use sqlx::{MySqlPool, Row, FromRow};
use serde::Serialize;

#[derive(Debug, Serialize, FromRow)]
pub struct MigrationInfo {
    pub version: i64,
    pub description: String,
    pub checksum: Vec<u8>,
    pub execution_time: i64,
    pub success: bool,
    pub installed_on: chrono::DateTime<chrono::Utc>,
}

pub async fn run_all(pool: &MySqlPool) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    // Use SQLx built-in migration system
    match sqlx::migrate!("./src/database/schema/migrations").run(pool).await {
        Ok(_) => {
            println!("✅ All migrations completed successfully");
            Ok("All migrations completed successfully".to_string())
        }
        Err(e) => {
            eprintln!("❌ Migration error: {:?}", e);
            Err(Box::new(e))
        }
    }
}

/// Reset all migrations (DANGER: This will drop all data!)
pub async fn reset_all_migrations(pool: &MySqlPool) -> Result<String, sqlx::Error> {
    // Get list of all applied migrations first
    let migrations = sqlx::query("SELECT version, description FROM _sqlx_migrations ORDER BY version DESC")
        .fetch_all(pool)
        .await?;

    // Start a transaction to ensure all operations are atomic
    let mut tx = pool.begin().await?;

    // Disable foreign key checks within the transaction
    sqlx::query("SET foreign_key_checks = 0")
        .execute(&mut *tx)
        .await?;

    // Get all table names except the migration tracking table
    let tables: Vec<String> = sqlx::query_scalar::<_, String>(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name != '_sqlx_migrations'"
    )
    .fetch_all(&mut *tx)
    .await?;

    // Drop all user tables
    for table in &tables {
        let drop_sql = format!("DROP TABLE IF EXISTS `{}`", table);
        sqlx::query(&drop_sql).execute(&mut *tx).await?;
    }

    // Re-enable foreign key checks
    sqlx::query("SET foreign_key_checks = 1")
        .execute(&mut *tx)
        .await?;

    // Clear the migrations tracking table
    sqlx::query("DELETE FROM _sqlx_migrations")
        .execute(&mut *tx)
        .await?;

    // Commit the transaction
    tx.commit().await?;

    let migration_count = migrations.len();
    let table_count = tables.len();

    Ok(format!(
        "Reset migration tracking table. {} migrations were previously applied. {} tables dropped.",
        migration_count, table_count
    ))
}