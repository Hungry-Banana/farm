use serde::Deserialize;
use crate::models::{QueryValue, WhereCondition};

#[derive(Deserialize, Debug, Clone)]
pub struct SearchCriterion {
    pub column: String,
    pub term: String,
    pub operator: Option<LogicalOperator>,
    #[serde(rename = "comparisonOperator")]
    pub comparison_operator: Option<String>,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "UPPERCASE")]
pub enum LogicalOperator {
    And,
    Or,
}

pub struct SearchQueryBuilder;

impl SearchQueryBuilder {
    /// Parse a JSON array of SearchCriterion into WHERE conditions
    pub fn build_conditions(search_json: &str) -> Result<Vec<WhereCondition>, String> {
        let criteria = serde_json::from_str::<Vec<SearchCriterion>>(search_json)
            .map_err(|e| format!("Invalid search format: {}", e))?;

        Self::validate(&criteria)?;
        Ok(Self::build_sequential_conditions(&criteria))
    }

    fn build_sequential_conditions(criteria: &[SearchCriterion]) -> Vec<WhereCondition> {
        criteria.iter().enumerate().map(|(index, criterion)| {
            let op = criterion.comparison_operator.as_deref().unwrap_or("=");
            let logical_operator = if index == 0 {
                None
            } else {
                criteria[index - 1].operator.as_ref().map(|lo| match lo {
                    LogicalOperator::And => "AND".to_string(),
                    LogicalOperator::Or => "OR".to_string(),
                })
            };
            WhereCondition {
                column: criterion.column.clone(),
                operator: op.to_string(),
                value: Self::parse_value(&criterion.term, op),
                logical_operator,
            }
        }).collect()
    }

    fn parse_value(term: &str, operator: &str) -> QueryValue {
        if let Ok(i) = term.parse::<i64>() {
            QueryValue::Integer(i)
        } else if let Ok(f) = term.parse::<f64>() {
            QueryValue::Float(f)
        } else if let Ok(b) = term.parse::<bool>() {
            QueryValue::Boolean(b)
        } else if operator == "LIKE" {
            QueryValue::String(format!("%{}%", term))
        } else {
            QueryValue::String(term.to_string())
        }
    }

    pub fn validate(criteria: &[SearchCriterion]) -> Result<(), String> {
        let valid_ops = ["=", "!=", ">", "<", ">=", "<=", "LIKE", "NOT LIKE"];
        for (i, c) in criteria.iter().enumerate() {
            if c.column.is_empty() {
                return Err(format!("Criterion {} has an empty column name", i));
            }
            if c.term.is_empty() {
                return Err(format!("Criterion {} has an empty search term", i));
            }
            if let Some(ref op) = c.comparison_operator {
                if !valid_ops.contains(&op.as_str()) {
                    return Err(format!("Criterion {} has invalid operator '{}'", i, op));
                }
            }
        }
        Ok(())
    }
}

