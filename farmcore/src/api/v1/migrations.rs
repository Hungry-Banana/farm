use actix_web::{get, post, web, Responder, HttpResponse};
use crate::state::AppState;
use crate::api::responses::ApiResponse;
use crate::api::documentation::*;
use crate::database::schema::migrations;

#[get("")]
pub async fn migrations_index() -> impl Responder {
    let documentation = ApiDocumentation::new(
        "Database Migration Management API",
        "1.0.0",
        "Endpoints for managing database schema migrations",
        "/api/v1/migrations"
    )
    .with_response_format(standard_response_format())
    .with_authentication(AuthDoc {
        type_name: "None".to_string(),
        description: "No authentication required (development mode)".to_string(),
        header_name: None,
    })
    .with_rate_limiting(RateLimitDoc {
        requests_per_minute: Some(10),
        requests_per_hour: Some(100),
        description: "Limited rate for migration operations to prevent system overload".to_string(),
    })
    .add_endpoints(vec![
        // Run migrations endpoint
        EndpointDoc::new("/api/v1/migrations/run", HttpMethod::Post, "Execute all pending database migrations")
            .with_tags(vec!["migrations".to_string(), "database".to_string(), "admin".to_string()])
            .add_example(ExampleDoc::new(
                "Execute pending migrations",
                "/api/v1/migrations/run"
            ).with_response(serde_json::json!({
                "success": true,
                "data": {
                    "message": "Migrations executed successfully",
                    "status": "completed"
                }
            })))
            .add_response_code(ResponseCodeDoc::new(200, "Migrations executed successfully"))
            .add_response_code(ResponseCodeDoc::new(500, "Migration execution failed")),

        // Migration status endpoint
        
        // Reset migrations endpoint
        EndpointDoc::new("/api/v1/migrations/reset", HttpMethod::Post, "Reset all migration tracking (DANGER: Development only)")
            .with_tags(vec!["migrations".to_string(), "development".to_string(), "admin".to_string(), "danger".to_string()])
            .add_example(ExampleDoc::new(
                "Reset all migrations",
                "/api/v1/migrations/reset"
            ).with_response(serde_json::json!({
                "success": true,
                "data": {
                    "message": "Reset migration tracking table. 2 migrations were previously applied.",
                    "status": "completed",
                    "warning": "Migration tracking has been reset. Consider manually dropping tables for complete reset."
                }
            })))
            .add_response_code(ResponseCodeDoc::new(200, "Migration tracking reset successfully"))
            .add_response_code(ResponseCodeDoc::new(500, "Migration reset failed")),

        // Seed data endpoint
        EndpointDoc::new("/api/v1/migrations/seed", HttpMethod::Post, "Run database seed data (Development)")
            .with_tags(vec!["migrations".to_string(), "seeds".to_string(), "development".to_string(), "admin".to_string()])
            .add_example(ExampleDoc::new(
                "Seed database with development data",
                "/api/v1/migrations/seed"
            ).with_response(serde_json::json!({
                "success": true,
                "data": {
                    "message": "Development seed data applied successfully",
                    "status": "completed"
                }
            })))
            .add_response_code(ResponseCodeDoc::new(200, "Seed data applied successfully"))
            .add_response_code(ResponseCodeDoc::new(500, "Seed data failed")),
    ]);

    let response = ApiResponse::success(documentation);
    HttpResponse::Ok().json(response)
}

#[post("/run")]
pub async fn run_migrations(app_state: web::Data<AppState>) -> impl Responder {
    match migrations::run_all(app_state.pool()).await {
        Ok(message) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": message,
                "status": "completed"
            }));
            HttpResponse::Ok().json(response)
        }
        Err(e) => {
            // Log the full error details
            eprintln!("Migration error details: {:?}", e);
            
            let response = ApiResponse::<serde_json::Value>::error(
                "MIGRATION_ERROR",
                &format!("Failed to run migrations: {}\n\nError details: {:?}", e, e)
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[post("/reset")]
pub async fn reset_all_migrations(app_state: web::Data<AppState>) -> impl Responder {
    match migrations::reset_all_migrations(app_state.pool()).await {
        Ok(message) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": message,
                "status": "completed",
                "warning": "Migration tracking has been reset. Consider manually dropping tables for complete reset."
            }));
            HttpResponse::Ok().json(response)
        }
        Err(e) => {
            let response = ApiResponse::<serde_json::Value>::error(
                "MIGRATION_RESET_ERROR",
                &format!("Failed to reset migrations: {}", e)
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[post("/seed")]
pub async fn run_seed_data(app_state: web::Data<AppState>) -> impl Responder {
    use crate::database::schema::seeds;
    
    match seeds::run_development_seeds(app_state.pool()).await {
        Ok(_) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Development seed data applied successfully",
                "status": "completed"
            }));
            HttpResponse::Ok().json(response)
        }
        Err(e) => {
            let response = ApiResponse::<serde_json::Value>::error(
                "SEED_ERROR",
                &format!("Failed to run seed data: {}", e)
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

pub fn configure_migration_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/migrations")
            .service(migrations_index)
            .service(run_migrations)
            .service(reset_all_migrations)
            .service(run_seed_data)
    );
}