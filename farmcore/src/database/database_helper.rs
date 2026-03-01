use sqlx::{MySqlPool, FromRow};
use std::collections::HashMap;

/// Type alias for MySQL query to make function signatures cleaner
type MySqlQuery<'q> = sqlx::query::Query<'q, sqlx::MySql, sqlx::mysql::MySqlArguments>;

/// Generic database helper for simple CRUD operations
pub struct DatabaseHelper;

impl DatabaseHelper {
    /// Find a single record by ID
    pub async fn get_by_id<T>(
        pool: &MySqlPool,
        table_name: &str,
        key_column: &str,
        id: i64,
    ) -> Result<Option<T>, sqlx::Error>
    where
        T: for<'r> FromRow<'r, sqlx::mysql::MySqlRow> + Unpin + Send,
    {
        let sql = format!("SELECT * FROM {} WHERE {} = ?", table_name, key_column);

        sqlx::query_as::<_, T>(&sql)
            .bind(id)
            .fetch_optional(pool)
            .await
    }

    /// Get all records from a table
    pub async fn find_all<T>(
        pool: &MySqlPool,
        table_name: &str,
    ) -> Result<Vec<T>, sqlx::Error>
    where
        T: for<'r> FromRow<'r, sqlx::mysql::MySqlRow> + Unpin + Send,
    {
        let sql = format!("SELECT * FROM {}", table_name);
        sqlx::query_as::<_, T>(&sql)
            .fetch_all(pool)
            .await
    }

    /// Get total count of records in a table
    pub async fn get_total_count(
        pool: &MySqlPool,
        table_name: &str,
    ) -> Result<i64, sqlx::Error> {
        let query = format!("SELECT COUNT(*) FROM {}", table_name);
        sqlx::query_scalar(&query)
            .fetch_one(pool)
            .await
    }

    /// Get count by field with grouping
    pub async fn get_count_by_field(
        pool: &MySqlPool, 
        table_name: &str,
        field: &str,
    ) -> Result<std::collections::HashMap<String, i64>, sqlx::Error> {
        let query = format!(
            "SELECT {}, COUNT(*) as count FROM {} WHERE {} IS NOT NULL GROUP BY {}",
            field, table_name, field, field
        );

        let rows = sqlx::query_as::<_, (Option<String>, i64)>(&query)
            .fetch_all(pool)
            .await?;

        let mut result = std::collections::HashMap::new();
        for (value, count) in rows {
            if let Some(val) = value {
                result.insert(val, count);
            }
        }
        
        Ok(result)
    }

    /// Delete a record by ID
    pub async fn delete_by_id(
        pool: &MySqlPool,
        table_name: &str,
        key_column: &str,
        id: i64,
    ) -> Result<u64, sqlx::Error> {
        let sql = format!("DELETE FROM {} WHERE {} = ?", table_name, key_column);
        
        let result = sqlx::query(&sql)
            .bind(id)
            .execute(pool)
            .await?;
            
        Ok(result.rows_affected())
    }

    /// Check if a record exists by ID
    pub async fn exists_by_id(
        pool: &MySqlPool,
        table_name: &str,
        key_column: &str,
        id: i64,
    ) -> Result<bool, sqlx::Error> {
        let sql = format!("SELECT 1 FROM {} WHERE {} = ? LIMIT 1", table_name, key_column);
        
        let result = sqlx::query_scalar::<_, Option<i32>>(&sql)
            .bind(id)
            .fetch_optional(pool)
            .await?;
            
        Ok(result.is_some())
    }

    /// Build insert SQL and return the query string for manual binding
    pub fn build_insert_sql(table_name: &str, columns: &[&str]) -> String {
        let placeholders = vec!["?"; columns.len()].join(", ");
        let columns_str = columns.join(", ");
        format!(
            "INSERT INTO {} ({}) VALUES ({})",
            table_name, columns_str, placeholders
        )
    }

    /// Generic update function for any table
    /// 
    /// # Arguments
    /// * `pool` - Database connection pool
    /// * `table_name` - Name of the table to update
    /// * `key_column` - Name of the primary key column
    /// * `id` - ID value of the record to update
    /// * `updates` - HashMap of field names and their new values
    /// * `blacklisted_fields` - Fields that should not be updated (e.g., id, created_at)
    /// 
    /// # Returns
    /// * `Ok(true)` if rows were updated
    /// * `Ok(false)` if no rows were updated
    /// * `Err` if blacklisted field was provided or query failed
    pub async fn update(
        pool: &MySqlPool,
        table_name: &str,
        key_column: &str,
        id: i32,
        updates: HashMap<String, serde_json::Value>,
        blacklisted_fields: &[&str],
    ) -> Result<bool, sqlx::Error> {
        if updates.is_empty() {
            return Ok(false);
        }

        // Build SET clauses
        let mut set_clauses = Vec::new();
        let mut values: Vec<String> = Vec::new();

        for (field, value) in &updates {
            // Check if field is blacklisted
            if blacklisted_fields.contains(&field.as_str()) {
                return Err(sqlx::Error::Protocol(
                    format!("Field '{}' is not allowed to be updated", field)
                ));
            }

            set_clauses.push(format!("{} = ?", field));
            
            // Convert JSON value to SQL-compatible string
            let sql_value = match value {
                serde_json::Value::Null => "NULL".to_string(),
                serde_json::Value::String(s) => format!("'{}'", s.replace("'", "''").replace("\\", "\\\\")),
                serde_json::Value::Number(n) => n.to_string(),
                serde_json::Value::Bool(b) => if *b { "1" } else { "0" }.to_string(),
                _ => return Err(sqlx::Error::Protocol(
                    format!("Unsupported value type for field '{}'", field)
                )),
            };
            values.push(sql_value);
        }

        // Build the UPDATE query with updated_at timestamp
        let query = format!(
            "UPDATE {} SET {}, updated_at = NOW() WHERE {} = {}",
            table_name,
            set_clauses.join(", ").replace("?", "&"),
            key_column,
            id
        );

        // Replace placeholders with actual values
        let mut final_query = query;
        for value in values {
            final_query = final_query.replacen("&", &value, 1);
        }

        // Execute the update
        let result = sqlx::query(&final_query)
            .execute(pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    /// Generic upsert function - inserts if not exists, updates if exists
    /// 
    /// # Arguments
    /// * `pool` - Database connection pool
    /// * `table_name` - Name of the table
    /// * `key_column` - Name of the unique constraint column (e.g., "name")
    /// * `key_value` - Value to check for existence
    /// * `insert_data` - HashMap of all fields for INSERT
    /// * `update_data` - HashMap of fields to UPDATE if record exists
    /// * `blacklisted_fields` - Fields that should not be updated
    /// 
    /// # Returns
    /// * Last insert ID (either new or existing record ID)
    pub async fn upsert(
        pool: &MySqlPool,
        table_name: &str,
        id_column: &str,
        key_column: &str,
        key_value: &str,
        insert_data: HashMap<String, serde_json::Value>,
        update_data: HashMap<String, serde_json::Value>,
        blacklisted_fields: &[&str],
    ) -> Result<i32, sqlx::Error> {
        // Check if record exists
        let exists_query = format!(
            "SELECT {} FROM {} WHERE {} = ? LIMIT 1",
            id_column, table_name, key_column
        );
        
        let existing_id: Option<(i32,)> = sqlx::query_as(&exists_query)
            .bind(key_value)
            .fetch_optional(pool)
            .await?;

        if let Some((id,)) = existing_id {
            // Update existing record
            Self::update(pool, table_name, id_column, id, update_data, blacklisted_fields).await?;
            Ok(id)
        } else {
            // Insert new record
            let mut columns = Vec::new();
            let mut values = Vec::new();

            for (field, value) in &insert_data {
                columns.push(field.as_str());
                let sql_value = match value {
                    serde_json::Value::Null => "NULL".to_string(),
                    serde_json::Value::String(s) => format!("'{}'", s.replace("'", "''").replace("\\", "\\\\")),
                    serde_json::Value::Number(n) => n.to_string(),
                    serde_json::Value::Bool(b) => if *b { "1" } else { "0" }.to_string(),
                    _ => return Err(sqlx::Error::Protocol(
                        format!("Unsupported value type for field '{}'", field)
                    )),
                };
                values.push(sql_value);
            }

            let insert_query = format!(
                "INSERT INTO {} ({}) VALUES ({})",
                table_name,
                columns.join(", "),
                values.join(", ")
            );

            let result = sqlx::query(&insert_query)
                .execute(pool)
                .await?;

            Ok(result.last_insert_id() as i32)
        }
    }
}