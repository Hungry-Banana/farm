mod database;
mod models;
mod api;
mod search;
mod repositories;
mod state;
mod domain;

use actix_web::{web, App, HttpServer, HttpResponse, Result};
use database::DbPool;
use state::AppState;
use tracing_actix_web::TracingLogger;
use tracing::{info, error, warn};
use tracing_subscriber;
use api::responses::ApiResponse;

// Add a default handler function
async fn not_found() -> Result<HttpResponse> {
    warn!("404 Not Found request received");
    
    let response = ApiResponse::<serde_json::Value>::error(
        "NOT_FOUND",
        "The requested resource was not found"
    );
    
    Ok(HttpResponse::NotFound().json(response))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize tracing system
    tracing_subscriber::fmt()
        .with_env_filter("info,fast_server=debug") // App logs at debug level
        .init();

    info!("🚀 Starting Farm API Server initialization");

    let pool: DbPool = match database::init_db_pool().await {
        Ok(pool) => {
            info!("✓ Database pool initialized successfully");
            pool
        },
        Err(e) => {
            error!("✗ Failed to initialize database pool: {}", e);
            std::process::exit(1);
        }
    };

    // Create application state with all repositories
    let app_state = AppState::new(pool);
    info!("✓ Application state and repositories initialized");

    info!("🌐 Starting Farm API Server on 127.0.0.1:6183");

    HttpServer::new(move || {
        App::new()
            .wrap(TracingLogger::default()) // Automatic HTTP request/response logging
            .app_data(web::Data::new(app_state.clone()))
            .configure(api::configure_api_routes)
            .default_service(web::route().to(not_found))
    })
    .workers(12)
    .bind("0.0.0.0:6183")?
    .run()
    .await
}