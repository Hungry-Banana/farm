use sqlx::{mysql::MySqlPoolOptions, MySql, Pool};
use std::env;

pub type DbPool = Pool<MySql>;

/// Initialize the database connection pool
pub async fn init_db_pool() -> Result<DbPool, sqlx::Error> {
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "mysql://farm:farm@mysql/farm".to_string());

    MySqlPoolOptions::new()
        .max_connections(50)
        .min_connections(10)
        .connect(&database_url)
        .await
}