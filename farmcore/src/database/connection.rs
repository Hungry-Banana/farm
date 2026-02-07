use sqlx::{mysql::MySqlPoolOptions, MySql, Pool};
use std::env;

pub type DbPool = Pool<MySql>;

/// Initialize the database connection pool
pub async fn init_db_pool() -> Result<DbPool, sqlx::Error> {
    let mysql_user = env::var("MYSQL_USER").unwrap_or_else(|_| "farm".to_string());
    let mysql_password = env::var("MYSQL_PASSWORD").unwrap_or_else(|_| "farm".to_string());
    let mysql_host = env::var("MYSQL_HOST").unwrap_or_else(|_| "mysql".to_string());
    let mysql_database = env::var("MYSQL_DATABASE").unwrap_or_else(|_| "farm".to_string());
    
    let database_url = format!(
        "mysql://{}:{}@{}/{}",
        mysql_user, mysql_password, mysql_host, mysql_database
    );

    MySqlPoolOptions::new()
        .max_connections(50)
        .min_connections(10)
        .connect(&database_url)
        .await
}