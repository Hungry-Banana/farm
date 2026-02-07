use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::models::{QueryValue, WhereCondition};

/// New structured search format that groups by column
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct StructuredSearch {
    #[serde(flatten)]
    pub columns: HashMap<String, ColumnCriteria>,
}

/// Column criteria can be either a simple string value or a map of values with operators
#[derive(Deserialize, Serialize, Debug, Clone)]
#[serde(untagged)]
pub enum ColumnCriteria {
    Simple(String),
    Complex(HashMap<String, ColumnOperation>), // value -> operation details
}

/// Operation details for complex column criteria
#[derive(Deserialize, Serialize, Debug, Clone)]
#[serde(untagged)]
pub enum ColumnOperation {
    Simple(String), // Just the logical operator (backward compatibility)
    WithComparison {
        #[serde(rename = "op")]
        comparison_operator: Option<String>, // =, !=, >, <, LIKE
        #[serde(rename = "logical")]
        logical_operator: String, // AND, OR
    },
}

/// Legacy structure to handle old JSON format (for backward compatibility)
#[derive(Deserialize, Debug, Clone)]
pub struct SearchCriterion {
    pub column: String,
    pub term: String,
    pub operator: Option<LogicalOperator>,      // AND/OR
    #[serde(rename = "comparisonOperator")]
    pub comparison_operator: Option<String>,     // =, !=, >, <, LIKE
}

/// Logical operators for combining search criteria
#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "UPPERCASE")]
pub enum LogicalOperator {
    And,
    Or,
}

/// Search query builder that can parse complex search criteria
/// and simple filter parameters into database WHERE conditions
pub struct SearchQueryBuilder;

impl SearchQueryBuilder {
    /// Build WHERE conditions from the new structured JSON search format
    /// This is the preferred method for the new JSON structure
    pub fn build_structured_conditions(search_json: &str) -> Result<Vec<WhereCondition>, String> {
        match serde_json::from_str::<StructuredSearch>(search_json) {
            Ok(structured_search) => {
                log::info!("Successfully parsed structured search with {} columns", structured_search.columns.len());
                
                let conditions = Self::build_from_structured(&structured_search);
                
                for (i, condition) in conditions.iter().enumerate() {
                    log::info!("Condition {}: {:?}", i, condition);
                }
                
                Ok(conditions)
            }
            Err(e) => {
                log::error!("Failed to parse structured search JSON '{}': {}", search_json, e);
                Err(format!("Invalid structured search format: {}", e))
            }
        }
    }

    /// Build WHERE conditions from structured search format
    fn build_from_structured(structured_search: &StructuredSearch) -> Vec<WhereCondition> {
        let mut conditions = Vec::new();
        let mut is_first_column = true;

        for (column_name, column_criteria) in &structured_search.columns {
            match column_criteria {
                ColumnCriteria::Simple(value) => {
                    // Single value for this column - assume equality
                    conditions.push(WhereCondition {
                        column: column_name.clone(),
                        operator: "=".to_string(),
                        value: Self::parse_value_type_with_operator(value, "="),
                        logical_operator: if is_first_column { None } else { Some("AND".to_string()) },
                    });
                }
                ColumnCriteria::Complex(value_operations) => {
                    // Multiple values for this column with explicit operators
                    if value_operations.len() == 1 {
                        // Single value in complex format
                        let (value, operation) = value_operations.iter().next().unwrap();
                        let comparison_op = match operation {
                            ColumnOperation::Simple(_) => "=".to_string(),
                            ColumnOperation::WithComparison { comparison_operator, .. } => {
                                comparison_operator.as_deref().unwrap_or("=").to_string()
                            }
                        };
                        
                        conditions.push(WhereCondition {
                            column: column_name.clone(),
                            operator: comparison_op.clone(),
                            value: Self::parse_value_type_with_operator(value, &comparison_op),
                            logical_operator: if is_first_column { None } else { Some("AND".to_string()) },
                        });
                    } else {
                        // Multiple values - need to check logical operators and comparison types
                        let operations: Vec<(String, String, String)> = value_operations.iter()
                            .map(|(value, operation)| {
                                let (comparison_op, logical_op) = match operation {
                                    ColumnOperation::Simple(log_op) => ("=", log_op.as_str()),
                                    ColumnOperation::WithComparison { comparison_operator, logical_operator } => {
                                        (comparison_operator.as_deref().unwrap_or("="), logical_operator.as_str())
                                    }
                                };
                                (value.clone(), comparison_op.to_string(), logical_op.to_string())
                            })
                            .collect();
                        
                        // Check if all operations are equality AND all logical operators are OR
                        let all_equal_with_or = operations.iter().all(|(_, comp_op, log_op)| {
                            comp_op == "=" && log_op == "OR"
                        });
                        
                        if all_equal_with_or {
                            // Use IN clause for multiple equality operations with OR
                            let values: Vec<String> = operations.iter()
                                .map(|(value, _, _)| format!("'{}'", value.replace("'", "''")))
                                .collect();
                            
                            conditions.push(WhereCondition {
                                column: column_name.clone(),
                                operator: "IN".to_string(),
                                value: QueryValue::String(format!("({})", values.join(", "))),
                                logical_operator: if is_first_column { None } else { Some("AND".to_string()) },
                            });
                        } else {
                            // Use raw SQL with proper logical operators
                            let parts: Vec<String> = operations.iter()
                                .map(|(value, comp_op, _)| {
                                    let formatted_value = if comp_op == "LIKE" {
                                        format!("%{}%", value.replace("'", "''"))
                                    } else {
                                        value.replace("'", "''")
                                    };
                                    format!("`{}` {} '{}'", column_name, comp_op, formatted_value)
                                })
                                .collect();
                            
                            // Get the logical operator from the first operation (they should all be the same in well-formed queries)
                            let logical_connector = operations.get(0)
                                .map(|(_, _, log_op)| log_op.as_str())
                                .unwrap_or("AND");
                            
                            conditions.push(WhereCondition {
                                column: "RAW_SQL".to_string(),
                                operator: "RAW".to_string(),
                                value: QueryValue::String(format!("({})", parts.join(&format!(" {} ", logical_connector)))),
                                logical_operator: if is_first_column { None } else { Some("AND".to_string()) },
                            });
                        }
                    }
                }
            }
            
            is_first_column = false;
        }

        log::info!("Built {} conditions from structured search", conditions.len());
        conditions
    }

    /// Parse value and detect its type, applying appropriate formatting for operators
    fn parse_value_type(value: &str) -> QueryValue {
        if let Ok(int_val) = value.parse::<i64>() {
            QueryValue::Integer(int_val)
        } else if let Ok(float_val) = value.parse::<f64>() {
            QueryValue::Float(float_val)
        } else if let Ok(bool_val) = value.parse::<bool>() {
            QueryValue::Boolean(bool_val)
        } else {
            QueryValue::String(value.to_string())
        }
    }

    /// Parse value and detect its type, applying appropriate formatting for operators
    fn parse_value_type_with_operator(value: &str, operator: &str) -> QueryValue {
        if let Ok(int_val) = value.parse::<i64>() {
            QueryValue::Integer(int_val)
        } else if let Ok(float_val) = value.parse::<f64>() {
            QueryValue::Float(float_val)
        } else if let Ok(bool_val) = value.parse::<bool>() {
            QueryValue::Boolean(bool_val)
        } else if operator == "LIKE" {
            QueryValue::String(format!("%{}%", value))
        } else {
            QueryValue::String(value.to_string())
        }
    }
    /// Build WHERE conditions from complex JSON search criteria
    /// Applies intelligent grouping: same columns get parentheses, different columns connect directly
    pub fn build_complex_conditions(search_json: &str) -> Result<Vec<WhereCondition>, String> {
        match serde_json::from_str::<Vec<SearchCriterion>>(search_json) {
            Ok(search_criteria) => {
                log::info!("Successfully parsed {} search criteria", search_criteria.len());
                
                // Validate the criteria first
                Self::validate_search_criteria(&search_criteria)?;
                
                // Apply intelligent grouping by column
                let conditions = Self::build_grouped_conditions(&search_criteria);
                
                for (i, condition) in conditions.iter().enumerate() {
                    log::info!("Condition {}: {:?}", i, condition);
                }
                
                Ok(conditions)
            }
            Err(e) => {
                log::error!("Failed to parse search criteria JSON '{}': {}", search_json, e);
                Err(format!("Invalid search criteria format: {}", e))
            }
        }
    }

    /// Build grouped WHERE conditions with intelligent grouping
    /// Groups criteria by column name - same columns get combined into IN clauses or OR conditions
    fn build_grouped_conditions(search_criteria: &[SearchCriterion]) -> Vec<WhereCondition> {
        if search_criteria.is_empty() {
            return Vec::new();
        }

        // Group criteria by column
        let mut column_groups: HashMap<String, Vec<&SearchCriterion>> = HashMap::new();
        for criterion in search_criteria {
            column_groups.entry(criterion.column.clone())
                         .or_insert_with(Vec::new)
                         .push(criterion);
        }

        let mut conditions = Vec::new();
        let mut is_first_group = true;

        // Process each column group
        for (column, criteria) in column_groups {
            if criteria.len() == 1 {
                // Single criterion, no special handling needed
                let mut condition = Self::build_where_condition(criteria[0]);
                if is_first_group {
                    condition.logical_operator = None;
                } else {
                    condition.logical_operator = Some("AND".to_string());
                }
                conditions.push(condition);
            } else {
                // Multiple criteria for same column - check if we can use IN clause
                let all_equal_ops = criteria.iter().all(|c| {
                    c.comparison_operator.as_deref().unwrap_or("=") == "="
                });
                
                if all_equal_ops {
                    // Use IN clause for multiple equality conditions
                    let values: Vec<String> = criteria.iter()
                        .map(|c| format!("'{}'", c.term.replace("'", "''")))
                        .collect();
                    
                    conditions.push(WhereCondition {
                        column: column.clone(),
                        operator: "IN".to_string(),
                        value: QueryValue::String(format!("({})", values.join(", "))),
                        logical_operator: if is_first_group { None } else { Some("AND".to_string()) },
                    });
                } else {
                    // Use OR conditions with proper SQL concatenation
                    let mut or_parts = Vec::new();
                    for criterion in criteria {
                        let op = criterion.comparison_operator.as_deref().unwrap_or("=");
                        let formatted_value = if op == "LIKE" {
                            format!("%{}%", criterion.term.replace("'", "''"))
                        } else {
                            criterion.term.replace("'", "''")
                        };
                        or_parts.push(format!("`{}` {} '{}'", column, op, formatted_value));
                    }
                    
                    conditions.push(WhereCondition {
                        column: "RAW_SQL".to_string(), // Special marker for raw SQL
                        operator: "RAW".to_string(),
                        value: QueryValue::String(format!("({})", or_parts.join(" OR "))),
                        logical_operator: if is_first_group { None } else { Some("AND".to_string()) },
                    });
                }
            }
            
            is_first_group = false;
        }
        
        log::info!("Built {} conditions from {} criteria with grouping", conditions.len(), search_criteria.len());
        for (i, condition) in conditions.iter().enumerate() {
            log::info!("Condition {}: column='{}', op='{}', logical_op={:?}", 
                i, condition.column, condition.operator, condition.logical_operator);
        }
        
        conditions
    }
    
    /// Build WHERE conditions from simple filter parameters (for backward compatibility)
    pub fn build_simple_conditions(
        filters: &HashMap<String, String>,
        excluded_keys: Option<&[&str]>
    ) -> Vec<WhereCondition> {
        let default_excluded = ["page", "per_page", "columns", "search"];
        let excluded_keys = excluded_keys.unwrap_or(&default_excluded);
        
        let mut conditions = Vec::new();
        
        for (key, value) in filters {
            if excluded_keys.contains(&key.as_str()) {
                continue;
            }
            
            let (column, operator) = Self::parse_filter_key(key);
            let query_value = Self::parse_filter_value(value, &operator);
            
            conditions.push(WhereCondition {
                column,
                operator: operator.to_string(),
                value: query_value,
                logical_operator: None, // Simple filters don't need logical operators between them
            });
        }
        
        conditions
    }

    /// Build WHERE conditions from both structured search and legacy formats
    /// Tries structured format first, falls back to legacy array format
    pub fn build_mixed_conditions(
        search_json: Option<&str>,
        filters: &HashMap<String, String>,
        excluded_keys: Option<&[&str]>
    ) -> Result<Vec<WhereCondition>, String> {
        if let Some(search) = search_json {
            // Try structured format first
            if let Ok(conditions) = Self::build_structured_conditions(search) {
                return Ok(conditions);
            }
            
            // Fall back to legacy complex search format
            Self::build_complex_conditions(search)
        } else {
            // Fall back to simple filters
            Ok(Self::build_simple_conditions(filters, excluded_keys))
        }
    }

    /// Convert a single SearchCriterion to a WhereCondition
    fn build_where_condition(criterion: &SearchCriterion) -> WhereCondition {
        let operator = criterion.comparison_operator.as_deref().unwrap_or("=");
        let query_value = Self::parse_criterion_value(&criterion.term, operator);
        
        WhereCondition {
            column: criterion.column.clone(),
            operator: operator.to_string(),
            value: query_value,
            logical_operator: criterion.operator.as_ref().map(|op| match op {
                LogicalOperator::And => "AND".to_string(),
                LogicalOperator::Or => "OR".to_string(),
            }),
        }
    }

    /// Parse filter key to extract column name and operator
    fn parse_filter_key(key: &str) -> (String, &'static str) {
        if key.ends_with("_like") {
            (key.trim_end_matches("_like").to_string(), "LIKE")
        } else if key.ends_with("_gt") {
            (key.trim_end_matches("_gt").to_string(), ">")
        } else if key.ends_with("_gte") {
            (key.trim_end_matches("_gte").to_string(), ">=")
        } else if key.ends_with("_lt") {
            (key.trim_end_matches("_lt").to_string(), "<")
        } else if key.ends_with("_lte") {
            (key.trim_end_matches("_lte").to_string(), "<=")
        } else if key.ends_with("_ne") {
            (key.trim_end_matches("_ne").to_string(), "!=")
        } else {
            (key.clone().to_string(), "=")
        }
    }

    /// Parse filter value based on its content and operator
    fn parse_filter_value(value: &str, operator: &str) -> QueryValue {
        if value.is_empty() || value.to_lowercase() == "null" {
            QueryValue::Null
        } else if operator == "LIKE" {
            QueryValue::String(format!("%{}%", value))
        } else if let Ok(int_val) = value.parse::<i64>() {
            QueryValue::Integer(int_val)
        } else if let Ok(float_val) = value.parse::<f64>() {
            QueryValue::Float(float_val)
        } else if let Ok(bool_val) = value.parse::<bool>() {
            QueryValue::Boolean(bool_val)
        } else {
            QueryValue::String(value.to_string())
        }
    }

    /// Parse search criterion value with intelligent type detection
    fn parse_criterion_value(term: &str, operator: &str) -> QueryValue {
        if let Ok(int_val) = term.parse::<i64>() {
            QueryValue::Integer(int_val)
        } else if let Ok(float_val) = term.parse::<f64>() {
            QueryValue::Float(float_val)
        } else if let Ok(bool_val) = term.parse::<bool>() {
            QueryValue::Boolean(bool_val)
        } else if operator == "LIKE" {
            QueryValue::String(format!("%{}%", term))
        } else {
            QueryValue::String(term.to_string())
        }
    }

    /// Validate search criteria before processing
    pub fn validate_search_criteria(search_criteria: &[SearchCriterion]) -> Result<(), String> {
        for (i, criterion) in search_criteria.iter().enumerate() {
            if criterion.column.is_empty() {
                return Err(format!("Search criterion {} has empty column name", i));
            }
            
            if criterion.term.is_empty() {
                return Err(format!("Search criterion {} has empty search term", i));
            }
            
            // Validate comparison operator if provided
            if let Some(ref op) = criterion.comparison_operator {
                let valid_operators = ["=", "!=", ">", "<", ">=", "<=", "LIKE", "NOT LIKE"];
                if !valid_operators.contains(&op.as_str()) {
                    return Err(format!(
                        "Search criterion {} has invalid comparison operator '{}'. Valid operators: {:?}",
                        i, op, valid_operators
                    ));
                }
            }
        }
        Ok(())
    }

    /// Create a SearchCriterion programmatically (useful for tests or API building)
    pub fn create_criterion(
        column: impl Into<String>,
        term: impl Into<String>,
        comparison_operator: Option<&str>,
        logical_operator: Option<LogicalOperator>
    ) -> SearchCriterion {
        SearchCriterion {
            column: column.into(),
            term: term.into(),
            comparison_operator: comparison_operator.map(|s| s.to_string()),
            operator: logical_operator,
        }
    }
    /// Create a structured search JSON programmatically (useful for frontend)
    pub fn create_structured_search() -> StructuredSearchBuilder {
        StructuredSearchBuilder::new()
    }
}

/// Builder for creating structured search queries programmatically
pub struct StructuredSearchBuilder {
    columns: HashMap<String, ColumnCriteria>,
}

impl StructuredSearchBuilder {
    pub fn new() -> Self {
        Self {
            columns: HashMap::new(),
        }
    }
    
    /// Add a simple column = value condition
    pub fn add_simple(mut self, column: &str, value: &str) -> Self {
        self.columns.insert(column.to_string(), ColumnCriteria::Simple(value.to_string()));
        self
    }
    
    /// Add a column with multiple values and operators
    pub fn add_complex(mut self, column: &str, value_operations: HashMap<String, ColumnOperation>) -> Self {
        self.columns.insert(column.to_string(), ColumnCriteria::Complex(value_operations));
        self
    }
    
    /// Convert to JSON string
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        let structured = StructuredSearch {
            columns: self.columns.clone(),
        };
        serde_json::to_string(&structured)
    }
    
    /// Convert to pretty JSON string
    pub fn to_json_pretty(&self) -> Result<String, serde_json::Error> {
        let structured = StructuredSearch {
            columns: self.columns.clone(),
        };
        serde_json::to_string_pretty(&structured)
    }
}