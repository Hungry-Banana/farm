use sqlx::{MySqlPool, FromRow};

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
}