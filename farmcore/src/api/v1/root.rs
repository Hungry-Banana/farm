use actix_web::{get, web, Responder, HttpResponse};
use crate::database::DbPool;
use crate::api::responses::ApiResponse;
use crate::api::documentation::*;

#[get("")]
pub async fn index() -> impl Responder {
    let documentation = ApiDocumentation::new(
        "Farm API Server",
        "1.0.0",
        "Infrastructure management API",
        "/api/v1"
    )
    .with_response_format(standard_response_format())
    .with_authentication(AuthDoc {
        type_name: "None".to_string(),
        description: "No authentication required (development mode)".to_string(),
        header_name: None,
    })
    .with_rate_limiting(RateLimitDoc {
        requests_per_minute: None,
        requests_per_hour: None,
        description: "No rate limiting (development mode)".to_string(),
    })
    .add_endpoints(vec![
        // Health check endpoint
        EndpointDoc::new("/api/v1/health", HttpMethod::Get, "Health check endpoint")
            .with_tags(vec!["health".to_string(), "monitoring".to_string()])
            .add_example(ExampleDoc::new(
                "Check API health status",
                "/api/v1/health"
            ).with_response(serde_json::json!({
                "success": true,
                "data": {
                    "status": "healthy",
                    "timestamp": "2025-10-19T10:30:00Z",
                    "uptime": "Service is operational",
                    "checks": {
                        "api": "ok",
                        "database": "ok"
                    }
                }
            })))
            .add_response_code(ResponseCodeDoc::new(200, "Service is healthy"))
            .add_response_code(ResponseCodeDoc::new(503, "Service is unhealthy")),

        // Database test endpoint
        EndpointDoc::new("/api/v1/db-test", HttpMethod::Get, "Database connectivity test")
            .with_tags(vec!["health".to_string(), "database".to_string()])
            .add_example(ExampleDoc::new(
                "Test database connection",
                "/api/v1/db-test"
            ).with_response(serde_json::json!({
                "success": true,
                "data": {
                    "database": "connected",
                    "status": "ok",
                    "connection_test": "passed"
                }
            })))
            .add_response_code(ResponseCodeDoc::new(200, "Database connection successful"))
            .add_response_code(ResponseCodeDoc::new(500, "Database connection failed")),

        // Servers API endpoint
        EndpointDoc::new("/api/v1/servers/", HttpMethod::Get, "Server API information and available endpoints")
            .with_tags(vec!["servers".to_string(), "documentation".to_string()])
            .add_example(ExampleDoc::new(
                "Get server API documentation",
                "/api/v1/servers/"
            ))
            .add_response_code(ResponseCodeDoc::new(200, "Server API documentation retrieved successfully")),
    ]);

    let response = ApiResponse::success(documentation);
    HttpResponse::Ok().json(response)
}

#[get("/health")]
pub async fn health_check(pool: web::Data<DbPool>) -> impl Responder {
    let start_time = std::time::Instant::now();
    let mut overall_healthy = true;

    // Check API (always healthy if we reach this point)
    let api_check = "ok";

    // Check database by calling our test_db logic
    let (db_status, db_details) = match test_database_connection(&pool).await {
        Ok(response_time) => (
            "ok",
            serde_json::json!({
                "connection": "passed",
                "response_time_ms": response_time
            })
        ),
        Err(error) => {
            overall_healthy = false;
            (
                "error", 
                serde_json::json!({
                    "connection": "failed",
                    "error": error
                })
            )
        }
    };

    let total_response_time = start_time.elapsed().as_millis();
    let status = if overall_healthy { "healthy" } else { "degraded" };
    let http_status = if overall_healthy { 200 } else { 503 };

    let response = ApiResponse::success(serde_json::json!({
        "status": status,
        "timestamp": chrono::Utc::now(),
        "uptime": "Service is operational",
        "checks": {
            "api": api_check,
            "database": db_status
        },
        "details": {
            "database": db_details,
            "total_health_check_time_ms": total_response_time
        }
    }));

    HttpResponse::build(actix_web::http::StatusCode::from_u16(http_status).unwrap())
        .json(response)
}

#[get("/db-test")]
pub async fn test_db(pool: web::Data<DbPool>) -> impl Responder {
    match test_database_connection(&pool).await {
        Ok(response_time) => {
            let response = ApiResponse::success(serde_json::json!({
                "database": "connected",
                "status": "ok",
                "connection_test": "passed",
                "response_time_ms": response_time
            }));
            HttpResponse::Ok().json(response)
        },
        Err(error) => {
            let response = ApiResponse::<serde_json::Value>::error(
                "DATABASE_ERROR",
                &format!("Database connection failed: {}", error)
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// Helper function to test database connection and measure response time
async fn test_database_connection(pool: &web::Data<DbPool>) -> Result<u128, String> {
    let start_time = std::time::Instant::now();
    
    match sqlx::query("SELECT 1 as test")
        .fetch_one(pool.get_ref())
        .await
    {
        Ok(_) => {
            let response_time = start_time.elapsed().as_millis();
            Ok(response_time)
        },
        Err(e) => Err(e.to_string())
    }
}

pub fn configure_health_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(index)
       .service(health_check)
       .service(test_db);
}