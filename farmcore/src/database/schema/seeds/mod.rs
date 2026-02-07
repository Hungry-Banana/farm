use sqlx::MySqlPool;

pub async fn run_development_seeds(pool: &MySqlPool) -> Result<(), sqlx::Error> {
    sqlx::raw_sql(include_str!("development.sql")).execute(pool).await?;
    println!("✅ Applied development seeds");
    Ok(())
}