use actix_web::{get, put, web, HttpResponse, Responder};
use std::collections::HashMap;

use crate::api::responses::ApiResponse;
use crate::api::documentation::*;
use crate::api::query_parser::CommonPaginationQuery;
use crate::state::AppState;

#[get("")]
pub async fn index() -> impl Responder {
    let documentation = ApiDocumentation::new(
        "Farm VM API",
        "v1",
        "Virtual machine management endpoints",
        "/api/v1"
    )
    .with_response_format(standard_response_format())
    .add_endpoint(
        EndpointDoc::new("/api/v1/vms/get_vms", HttpMethod::Get, 
            "List all virtual machines with pagination and filtering")
            .add_query_parameter(ParameterDoc::new("page", ParameterType::Integer, "Page number", false).with_default("1"))
            .add_query_parameter(ParameterDoc::new("per_page", ParameterType::Integer, "Items per page", false).with_default("10"))
            .add_query_parameter(ParameterDoc::new("columns", ParameterType::String, "Comma-separated column list", false))
            .add_example(ExampleDoc::new("Get running VMs", "/api/v1/vms/get_vms?vm_state=running"))
            .add_example(ExampleDoc::new("Search Ubuntu VMs", "/api/v1/vms/get_vms?guest_os_version_like=ubuntu"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid parameters"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/vms/{id}", HttpMethod::Get, "Get specific VM by ID with complete details")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "VM ID", true))
            .add_example(ExampleDoc::new("Get VM 123", "/api/v1/vms/123"))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Returns VM with disks, network interfaces, and snapshots"))
            .add_response_code(ResponseCodeDoc::new(404, "VM not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/vms/server/{server_id}", HttpMethod::Get, "Get all VMs for a specific server")
            .add_path_parameter(ParameterDoc::new("server_id", ParameterType::Integer, "Server ID", true))
            .add_example(ExampleDoc::new("Get VMs for server 5", "/api/v1/vms/server/5"))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Returns list of VMs for the server"))
            .add_response_code(ResponseCodeDoc::new(404, "Server not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/vms/overview", HttpMethod::Get, "Get VM overview statistics")
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/vms/{id}", HttpMethod::Put, "Update VM fields")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "VM ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success - VM updated"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid field or value"))
            .add_response_code(ResponseCodeDoc::new(404, "VM not found"))
    );

    let response = ApiResponse::success(documentation);
    HttpResponse::Ok().json(response)
}

#[get("/get_vms")]
pub async fn get_all_vms(
    app_state: web::Data<AppState>, 
    query: web::Query<CommonPaginationQuery>
) -> impl Responder {
    match app_state.vm_repo().get_all_vms(query.into_inner()).await {
        Ok(vms) => {
            let response = ApiResponse::success(vms);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching VMs: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch VMs"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/{id}")]
pub async fn get_vm_by_id(
    app_state: web::Data<AppState>, 
    id: web::Path<i64>
) -> impl Responder {
    let vm_id = id.into_inner();
    
    match app_state.vm_repo().get_vm_with_all_components(vm_id as i32).await {
        Ok(Some(vm_with_components)) => {
            let response = ApiResponse::success(vm_with_components);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("VM with ID {} not found", vm_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching VM {}: {}", vm_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch VM details",
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/server/{server_id}")]
pub async fn get_vms_by_server_id(
    app_state: web::Data<AppState>, 
    server_id: web::Path<i64>
) -> impl Responder {
    let server_id = server_id.into_inner() as i32;
    
    match app_state.vm_repo().get_vms_by_server_id(server_id).await {
        Ok(vms) => {
            let response = ApiResponse::success(vms);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching VMs for server {}: {}", server_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch VMs for server"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/overview")]
pub async fn get_vm_overview(
    app_state: web::Data<AppState>
) -> impl Responder {
    match app_state.vm_repo().get_overview_stats().await {
        Ok(stats) => {
            let response = ApiResponse::success(stats);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching VM overview: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch VM overview"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[put("/{id}")]
pub async fn update_vm(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
    updates: web::Json<HashMap<String, serde_json::Value>>
) -> impl Responder {
    let vm_id = id.into_inner() as i32;
    let update_map = updates.into_inner();

    if update_map.is_empty() {
        let response = ApiResponse::<()>::error(
            "VALIDATION_ERROR",
            "No fields provided for update"
        );
        return HttpResponse::BadRequest().json(response);
    }

    match app_state.vm_repo().update_vm(vm_id, update_map).await {
        Ok(true) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "VM updated successfully",
                "vm_id": vm_id
            }));
            HttpResponse::Ok().json(response)
        },
        Ok(false) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("VM with ID {} not found or no changes made", vm_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Error updating VM {}: {}", vm_id, e);
            
            let error_message = if e.to_string().contains("not allowed") {
                e.to_string()
            } else {
                "Failed to update VM".to_string()
            };

            let response = ApiResponse::<()>::error(
                "UPDATE_ERROR",
                &error_message
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

pub fn configure_vm_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/vms")
            .service(index)
            .service(get_all_vms)
            .service(get_vm_overview)
            .service(get_vms_by_server_id)
            .service(get_vm_by_id)
            .service(update_vm)
    );
}
