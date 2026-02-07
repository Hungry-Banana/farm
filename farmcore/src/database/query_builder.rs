use sqlx::{MySql, MySqlPool, QueryBuilder, FromRow};
use crate::models::{QueryOptions, WhereCondition, QueryValue};

/// Dynamic query builder for complex database operations
pub struct QueryBuilderHelper;

impl QueryBuilderHelper {
    /// Flexible select with dynamic conditions, ordering, and pagination
    pub async fn select<T>(
        pool: &MySqlPool,
        table_name: &str,
        options: QueryOptions,
    ) -> Result<Vec<T>, sqlx::Error>
    where
        T: for<'r> FromRow<'r, sqlx::mysql::MySqlRow> + Unpin + Send,
    {
        let mut qb = QueryBuilder::<MySql>::new("SELECT ");
        
        // Handle column selection
        match options.columns {
            Some(cols) if !cols.is_empty() => {
                for (i, col) in cols.iter().enumerate() {
                    if i > 0 { qb.push(", "); }
                    qb.push("`").push(col).push("`");
                }
            }
            _ => {
                qb.push("*");
            }
        }
        
        qb.push(" FROM `").push(table_name).push("`");
        
        // Handle WHERE conditions
        if !options.where_conditions.is_empty() {
            qb.push(" WHERE ");
            Self::add_where_conditions(&mut qb, &options.where_conditions);
        }
        
        // Handle ORDER BY
        if let Some(order) = options.order_by {
            qb.push(" ORDER BY ").push(order);
        }
        
        // Handle LIMIT
        if let Some(limit) = options.limit {
            qb.push(" LIMIT ").push_bind(limit);
        }
        
        // Handle OFFSET
        if let Some(offset) = options.offset {
            qb.push(" OFFSET ").push_bind(offset);
        }
        
        qb.build_query_as::<T>().fetch_all(pool).await
    }

    /// Helper function to add WHERE conditions to a query builder
    fn add_where_conditions<'a>(qb: &mut QueryBuilder<'a, MySql>, where_conditions: &'a [WhereCondition]) {
        for (i, condition) in where_conditions.iter().enumerate() {
            // Add logical operator (AND/OR) if not the first condition
            if i > 0 {
                let logical_op = condition.logical_operator.as_deref().unwrap_or("AND");
                qb.push(" ").push(logical_op).push(" ");
            }
            
            // Handle raw SQL conditions (for grouped OR conditions)
            if condition.column == "RAW_SQL" && condition.operator == "RAW" {
                if let QueryValue::String(raw_sql) = &condition.value {
                    qb.push(raw_sql);
                }
                continue;
            }
            
            qb.push("`").push(&condition.column).push("` ")
              .push(&condition.operator).push(" ");
            
            match &condition.value {
                QueryValue::String(s) => { 
                    if condition.operator == "IN" {
                        // For IN clauses, don't bind the parameter, use it directly
                        qb.push(s);
                    } else {
                        qb.push_bind(s);
                    }
                },
                QueryValue::Integer(i) => { qb.push_bind(*i); },
                QueryValue::Float(f) => { qb.push_bind(*f); },
                QueryValue::Boolean(b) => { qb.push_bind(*b); },
                QueryValue::Null => { 
                    // Use proper IS NULL syntax instead of = NULL
                    if condition.operator == "=" {
                        qb.push("IS NULL");
                    } else if condition.operator == "!=" {
                        qb.push("IS NOT NULL");
                    } else {
                        qb.push("IS NULL");  // Default fallback
                    }
                },
            };
        }
    }
}