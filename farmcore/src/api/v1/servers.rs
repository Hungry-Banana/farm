use actix_web::{get, web, HttpResponse, Responder};

use crate::api::responses::ApiResponse;
use crate::api::documentation::*;
use crate::api::query_parser::CommonPaginationQuery;
use crate::state::AppState;

#[get("")]
pub async fn index() -> impl Responder {
    let documentation = ApiDocumentation::new(
        "Farm Server API",
        "v1",
        "Server management endpoints",
        "/api/v1"
    )
    .with_response_format(standard_response_format())
    .add_endpoint(
        EndpointDoc::new("/api/v1/servers/get_servers", HttpMethod::Get, 
            "List all servers with pagination and filtering")
            .add_query_parameter(ParameterDoc::new("page", ParameterType::Integer, "Page number", false).with_default("1"))
            .add_query_parameter(ParameterDoc::new("per_page", ParameterType::Integer, "Items per page", false).with_default("10"))
            .add_query_parameter(ParameterDoc::new("columns", ParameterType::String, "Comma-separated column list", false))
            .add_example(ExampleDoc::new("Get active servers", "/api/v1/servers/get_servers?status=active"))
            .add_example(ExampleDoc::new("Search web servers", "/api/v1/servers/get_servers?host_name_like=web"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid parameters"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/servers/{id}", HttpMethod::Get, "Get specific server by ID with complete component details")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Server ID", true))
            .add_example(ExampleDoc::new("Get server 123", "/api/v1/servers/123"))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Returns server with CPU, memory, disk, and network component details"))
            .add_response_code(ResponseCodeDoc::new(404, "Server not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/servers/overview", HttpMethod::Get, "Get server overview statistics")
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/servers/components", HttpMethod::Get, "Get all component types catalog")
            .add_response_code(ResponseCodeDoc::new(200, "Success - Returns all unique component types (CPUs, Memory, Disks, Network, GPUs, Motherboards)"))
    );

    let response = ApiResponse::success(documentation);
    HttpResponse::Ok().json(response)
}

#[get("/get_servers")]
pub async fn get_all_servers(
    app_state: web::Data<AppState>, 
    query: web::Query<CommonPaginationQuery>
) -> impl Responder {
    match app_state.server_repo().get_all_servers(query.into_inner()).await {
        Ok(servers) => {
            let response = ApiResponse::success(servers);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching servers: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch servers"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/{id}")]
pub async fn get_server_by_id(
    app_state: web::Data<AppState>, 
    id: web::Path<i64>
) -> impl Responder {
    let server_id = id.into_inner();
    
    match app_state.server_repo().get_server_with_all_components(server_id as i32).await {
        Ok(Some(server_with_components)) => {
            let response = ApiResponse::success(server_with_components);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Server with ID {} not found", server_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching server {}: {}", server_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch server details",
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/overview")]
pub async fn get_server_overview(
    app_state: web::Data<AppState>
) -> impl Responder {
    match app_state.server_repo().get_overview_stats().await {
        Ok(stats) => {
            let response = ApiResponse::success(stats);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching server overview: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch server overview"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

pub fn configure_server_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/servers")
            .service(index)
            .service(get_all_servers)
            .service(get_server_overview)  // Move overview BEFORE the /{id} route
            .service(get_server_by_id)     // This goes after more specific routes
    );
}