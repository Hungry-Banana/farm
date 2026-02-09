use actix_web::{get, put, web, HttpResponse, Responder};
use std::collections::HashMap;

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
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/servers/{id}", HttpMethod::Put, "Update server fields")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Server ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Server updated"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid field or value"))
            .add_response_code(ResponseCodeDoc::new(404, "Server not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/servers/inventory", HttpMethod::Post, "Create or update server from inventory data")
            .add_response_code(ResponseCodeDoc::new(200, "Success - Server created or updated"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid inventory data"))
            .add_response_code(ResponseCodeDoc::new(500, "Database error"))
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

#[put("/{id}")]
pub async fn update_server(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
    updates: web::Json<HashMap<String, serde_json::Value>>
) -> impl Responder {
    let server_id = id.into_inner() as i32;
    let update_map = updates.into_inner();

    if update_map.is_empty() {
        let response = ApiResponse::<()>::error(
            "VALIDATION_ERROR",
            "No fields provided for update"
        );
        return HttpResponse::BadRequest().json(response);
    }

    match app_state.server_repo().update_server(server_id, update_map).await {
        Ok(true) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Server updated successfully",
                "server_id": server_id
            }));
            HttpResponse::Ok().json(response)
        },
        Ok(false) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Server with ID {} not found or no changes made", server_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Error updating server {}: {}", server_id, e);
            
            let error_message = if e.to_string().contains("not allowed") {
                e.to_string()
            } else {
                "Failed to update server".to_string()
            };

            let response = ApiResponse::<()>::error(
                "UPDATE_ERROR",
                &error_message
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[actix_web::post("/inventory")]
pub async fn upsert_server_inventory(
    app_state: web::Data<AppState>,
    inventory: web::Json<crate::repositories::server_repository::ServerInventory>
) -> impl Responder {
    let inventory_data = inventory.into_inner();

    match app_state.server_repo().upsert_server_from_inventory(inventory_data).await {
        Ok((server_id, was_created)) => {
            let message = if was_created {
                format!("Server created successfully with ID {}", server_id)
            } else {
                format!("Server {} updated successfully", server_id)
            };

            let response = ApiResponse::success(serde_json::json!({
                "message": message,
                "server_id": server_id,
                "created": was_created
            }));
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Error upserting server from inventory: {}", e);
            
            let error_message = e.to_string();
            let (mut status_code, error_code) = if error_message.contains("No primary network interface") 
                || error_message.contains("MAC address") 
                || error_message.contains("does not exist") {
                (HttpResponse::BadRequest(), "VALIDATION_ERROR")
            } else {
                (HttpResponse::InternalServerError(), "DATABASE_ERROR")
            };

            let response = ApiResponse::<()>::error(error_code, &error_message);
            status_code.json(response)
        }
    }
}

pub fn configure_server_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/servers")
            .service(index)
            .service(get_all_servers)
            .service(get_server_overview)  // Move overview BEFORE the /{id} route
            .service(upsert_server_inventory)  // POST endpoint for inventory
            .service(get_server_by_id)     // This goes after more specific routes
            .service(update_server)        // PUT endpoint for updates
    );
}