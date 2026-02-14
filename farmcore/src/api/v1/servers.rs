use actix_web::{get, post, put, web, HttpResponse, Responder};
use std::collections::HashMap;

use crate::api::responses::ApiResponse;
use crate::api::documentation::*;
use crate::api::query_parser::CommonPaginationQuery;
use crate::state::AppState;
use crate::domain::bmc::RedfishClient;

/// Helper function to get BMC client for a server
async fn get_bmc_client(
    app_state: &AppState,
    server_id: i32,
) -> Result<RedfishClient, HttpResponse> {
    let bmc_interfaces = match app_state.server_repo().get_server_bmc_interfaces(server_id).await {
        Ok(bmcs) => bmcs,
        Err(e) => {
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                &format!("Failed to get BMC info: {}", e)
            );
            return Err(HttpResponse::InternalServerError().json(response));
        }
    };

    let bmc_interface = match bmc_interfaces.first() {
        Some(bmc) => bmc,
        None => {
            let response = ApiResponse::<()>::error(
                "BMC_ERROR",
                &format!("No BMC interface found for server {}", server_id)
            );
            return Err(HttpResponse::NotFound().json(response));
        }
    };

    let ip = match &bmc_interface.ip_address {
        Some(ip) => ip,
        None => {
            let response = ApiResponse::<()>::error("BMC_ERROR", "BMC IP address not configured");
            return Err(HttpResponse::InternalServerError().json(response));
        }
    };

    let username = match &bmc_interface.username {
        Some(u) => u,
        None => {
            let response = ApiResponse::<()>::error("BMC_ERROR", "BMC username not configured");
            return Err(HttpResponse::InternalServerError().json(response));
        }
    };

    let password = match &bmc_interface.password {
        Some(p) => p,
        None => {
            let response = ApiResponse::<()>::error("BMC_ERROR", "BMC password not configured");
            return Err(HttpResponse::InternalServerError().json(response));
        }
    };

    match RedfishClient::new(ip, username, password) {
        Ok(client) => Ok(client),
        Err(e) => {
            let response = ApiResponse::<()>::error(
                "BMC_ERROR",
                &format!("Failed to create BMC client: {}", e)
            );
            Err(HttpResponse::InternalServerError().json(response))
        }
    }
}

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
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/servers/{id}/power/on", HttpMethod::Post, "Power on a server via BMC")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Server ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Server powered on"))
            .add_response_code(ResponseCodeDoc::new(404, "Server not found"))
            .add_response_code(ResponseCodeDoc::new(500, "BMC operation failed"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/servers/{id}/power/off", HttpMethod::Post, "Power off a server via BMC (graceful)")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Server ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Server powered off"))
            .add_response_code(ResponseCodeDoc::new(404, "Server not found"))
            .add_response_code(ResponseCodeDoc::new(500, "BMC operation failed"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/servers/{id}/power/restart", HttpMethod::Post, "Restart a server via BMC (graceful)")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Server ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Server restarting"))
            .add_response_code(ResponseCodeDoc::new(404, "Server not found"))
            .add_response_code(ResponseCodeDoc::new(500, "BMC operation failed"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/servers/{id}/power/force-off", HttpMethod::Post, "Force power off a server via BMC")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Server ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Server force powered off"))
            .add_response_code(ResponseCodeDoc::new(404, "Server not found"))
            .add_response_code(ResponseCodeDoc::new(500, "BMC operation failed"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/servers/{id}/power/force-restart", HttpMethod::Post, "Force restart a server via BMC")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Server ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Server force restarting"))
            .add_response_code(ResponseCodeDoc::new(404, "Server not found"))
            .add_response_code(ResponseCodeDoc::new(500, "BMC operation failed"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/servers/{id}/power/status", HttpMethod::Get, "Get server power state via BMC")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Server ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Returns power state"))
            .add_response_code(ResponseCodeDoc::new(404, "Server not found"))
            .add_response_code(ResponseCodeDoc::new(500, "BMC operation failed"))
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

#[post("/{id}/power/on")]
pub async fn power_on_server(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
) -> impl Responder {
    let server_id = id.into_inner() as i32;
    
    let client: RedfishClient = match get_bmc_client(&app_state, server_id).await {
        Ok(c) => c,
        Err(response) => return response,
    };

    match client.power_on(None).await {
        Ok(_) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Server power on command sent",
                "server_id": server_id
            }));
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            let response = ApiResponse::<()>::error("BMC_ERROR", &format!("Power on failed: {}", e));
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[post("/{id}/power/off")]
pub async fn power_off_server(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
) -> impl Responder {
    let server_id = id.into_inner() as i32;
    
    let client: RedfishClient = match get_bmc_client(&app_state, server_id).await {
        Ok(c) => c,
        Err(response) => return response,
    };

    match client.power_off(None).await {
        Ok(_) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Server graceful shutdown command sent",
                "server_id": server_id
            }));
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            let response = ApiResponse::<()>::error("BMC_ERROR", &format!("Power off failed: {}", e));
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[post("/{id}/power/restart")]
pub async fn restart_server(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
) -> impl Responder {
    let server_id = id.into_inner() as i32;
    
    let client: RedfishClient = match get_bmc_client(&app_state, server_id).await {
        Ok(c) => c,
        Err(response) => return response,
    };

    match client.reboot(None).await {
        Ok(_) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Server graceful restart command sent",
                "server_id": server_id
            }));
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            let response = ApiResponse::<()>::error("BMC_ERROR", &format!("Restart failed: {}", e));
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[post("/{id}/power/force-off")]
pub async fn force_power_off_server(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
) -> impl Responder {
    let server_id = id.into_inner() as i32;
    
    let client: RedfishClient = match get_bmc_client(&app_state, server_id).await {
        Ok(c) => c,
        Err(response) => return response,
    };

    match client.force_power_off(None).await {
        Ok(_) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Server force power off command sent",
                "server_id": server_id
            }));
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            let response = ApiResponse::<()>::error("BMC_ERROR", &format!("Force power off failed: {}", e));
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[post("/{id}/power/force-restart")]
pub async fn force_restart_server(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
) -> impl Responder {
    let server_id = id.into_inner() as i32;
    
    let client: RedfishClient = match get_bmc_client(&app_state, server_id).await {
        Ok(c) => c,
        Err(response) => return response,
    };

    match client.force_reboot(None).await {
        Ok(_) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Server force restart command sent",
                "server_id": server_id
            }));
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            let response = ApiResponse::<()>::error("BMC_ERROR", &format!("Force restart failed: {}", e));
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/{id}/power/status")]
pub async fn get_power_status(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
) -> impl Responder {
    let server_id = id.into_inner() as i32;
    
    let client: RedfishClient = match get_bmc_client(&app_state, server_id).await {
        Ok(c) => c,
        Err(response) => return response,
    };

    match client.get_power_state(None).await {
        Ok(power_state) => {
            let response = ApiResponse::success(serde_json::json!({
                "server_id": server_id,
                "power_state": power_state
            }));
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            let response = ApiResponse::<()>::error("BMC_ERROR", &format!("Failed to get power state: {}", e));
            HttpResponse::InternalServerError().json(response)
        }
    }
}

pub fn configure_server_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/servers")
            .service(index)
            .service(get_all_servers)
            .service(get_server_overview)
            .service(upsert_server_inventory)
            .service(get_server_by_id)
            .service(update_server)
            .service(power_on_server)
            .service(power_off_server)
            .service(restart_server)
            .service(force_power_off_server)
            .service(force_restart_server)
            .service(get_power_status)
    );
}