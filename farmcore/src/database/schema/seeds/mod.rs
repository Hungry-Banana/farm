use sqlx::MySqlPool;
use include_dir::{include_dir, Dir};

static SEED_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/src/database/schema/seeds/development");

pub async fn run_development_seeds(pool: &MySqlPool) -> Result<(), sqlx::Error> {
    // Get all .sql files and sort them by name
    let mut files: Vec<_> = SEED_DIR
        .files()
        .filter(|f| f.path().to_str().map(|s| s.ends_with(".sql")).unwrap_or(false))
        .collect();
    
    files.sort_by_key(|f| f.path());
    
    if files.is_empty() {
        println!("⚠️  No seed files found in development directory");
        return Ok(());
    }
    
    let file_count = files.len();
    println!("Running {} seed file(s)...", file_count);
    
    for file in files {
        let name = file.path().file_name().and_then(|n| n.to_str()).unwrap_or("unknown");
        println!("  → Running seed: {}", name);
        
        let sql = file.contents_utf8().ok_or_else(|| {
            sqlx::Error::Protocol(format!("Seed file {} is not valid UTF-8", name))
        })?;
        
        sqlx::raw_sql(sql)
            .execute(pool)
            .await
            .map_err(|e| {
                eprintln!("❌ Failed to run seed {}: {:?}", name, e);
                e
            })?;
    }
    
    println!("✅ Applied {} development seeds", file_count);
    Ok(())
}