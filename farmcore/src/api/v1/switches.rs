use actix_web::{delete, get, post, put, web, HttpResponse, Responder};
use std::collections::HashMap;

use crate::api::documentation::*;
use crate::api::query_parser::CommonPaginationQuery;
use crate::api::responses::ApiResponse;
use crate::models::{Switch, SwitchPort, SwitchVlan};
use crate::state::AppState;

// ===================================================================
// API DOCUMENTATION (index)
// ===================================================================

#[get("")]
pub async fn index() -> impl Responder {
    let documentation = ApiDocumentation::new(
        "Farm Switch API",
        "v1",
        "Network switch management endpoints",
        "/api/v1",
    )
    .with_response_format(standard_response_format())
    // --- Switches ---
    .add_endpoint(
        EndpointDoc::new("/api/v1/switches", HttpMethod::Get, "List all switches with pagination and filtering")
            .add_query_parameter(ParameterDoc::new("page", ParameterType::Integer, "Page number", false).with_default("1"))
            .add_query_parameter(ParameterDoc::new("per_page", ParameterType::Integer, "Items per page (max 100)", false).with_default("10"))
            .add_query_parameter(ParameterDoc::new("columns", ParameterType::String, "Comma-separated column list", false))
            .add_query_parameter(ParameterDoc::new("status", ParameterType::String, "Filter by status (ACTIVE, INACTIVE, MAINTENANCE, NEW, RMA, DECOMMISSIONED)", false))
            .add_query_parameter(ParameterDoc::new("switch_role", ParameterType::String, "Filter by role (ACCESS, DISTRIBUTION, CORE, EDGE, MANAGEMENT, OOB)", false))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid parameters")),
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/switches/stats", HttpMethod::Get, "Get aggregate statistics for all switches")
            .add_response_code(ResponseCodeDoc::new(200, "Success")),
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/switches/{id}", HttpMethod::Get, "Get specific switch by ID (with ports and VLANs)")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Switch ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Switch not found")),
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/switches/{id}/stats", HttpMethod::Get, "Get statistics for a specific switch")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Switch ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Switch not found")),
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/switches", HttpMethod::Post, "Create a new switch")
            .add_response_code(ResponseCodeDoc::new(201, "Switch created"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid data")),
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/switches/{id}", HttpMethod::Put, "Update switch fields")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Switch ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Switch not found")),
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/switches/{id}", HttpMethod::Delete, "Delete a switch (cascades to ports and VLANs)")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Switch ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Switch not found")),
    )
    // --- Ports ---
    .add_endpoint(
        EndpointDoc::new("/api/v1/switches/{id}/ports", HttpMethod::Get, "Get all ports for a switch")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Switch ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success")),
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/switches/ports/{port_id}", HttpMethod::Get, "Get a specific port by ID")
            .add_path_parameter(ParameterDoc::new("port_id", ParameterType::Integer, "Port ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Port not found")),
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/switches/{id}/ports", HttpMethod::Post, "Add a port to a switch")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Switch ID", true))
            .add_response_code(ResponseCodeDoc::new(201, "Port created")),
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/switches/ports/{port_id}", HttpMethod::Put, "Update a port")
            .add_path_parameter(ParameterDoc::new("port_id", ParameterType::Integer, "Port ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Port not found")),
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/switches/ports/{port_id}", HttpMethod::Delete, "Delete a port")
            .add_path_parameter(ParameterDoc::new("port_id", ParameterType::Integer, "Port ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Port not found")),
    )
    // --- VLANs ---
    .add_endpoint(
        EndpointDoc::new("/api/v1/switches/{id}/vlans", HttpMethod::Get, "Get all VLANs configured on a switch")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Switch ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success")),
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/switches/{id}/vlans", HttpMethod::Post, "Add a VLAN to a switch")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Switch ID", true))
            .add_response_code(ResponseCodeDoc::new(201, "VLAN created")),
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/switches/vlans/{vlan_db_id}", HttpMethod::Delete, "Remove a VLAN from a switch")
            .add_path_parameter(ParameterDoc::new("vlan_db_id", ParameterType::Integer, "VLAN DB record ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "VLAN not found")),
    );

    let response = ApiResponse::success(documentation);
    HttpResponse::Ok().json(response)
}

// ===================================================================
// SWITCH CRUD ENDPOINTS
// ===================================================================

#[get("/get_switches")]
pub async fn get_all_switches(
    app_state: web::Data<AppState>,
    query: web::Query<CommonPaginationQuery>,
) -> impl Responder {
    match app_state.switch_repo().get_all_switches(query.into_inner()).await {
        Ok(switches) => HttpResponse::Ok().json(ApiResponse::success(switches)),
        Err(e) => {
            log::error!("Database error fetching switches: {}", e);
            HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("DATABASE_ERROR", "Failed to fetch switches"))
        }
    }
}

#[get("/stats")]
pub async fn get_all_switches_stats(app_state: web::Data<AppState>) -> impl Responder {
    match app_state.switch_repo().get_all_switches_stats().await {
        Ok(stats) => HttpResponse::Ok().json(ApiResponse::success(stats)),
        Err(e) => {
            log::error!("Database error fetching switch stats: {}", e);
            HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("DATABASE_ERROR", "Failed to fetch switch statistics"))
        }
    }
}

#[get("/{id}")]
pub async fn get_switch_by_id(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
) -> impl Responder {
    let switch_id = id.into_inner() as i32;
    match app_state.switch_repo().get_switch_with_ports(switch_id).await {
        Ok(Some(sw)) => HttpResponse::Ok().json(ApiResponse::success(sw)),
        Ok(None) => HttpResponse::NotFound().json(ApiResponse::<()>::error(
            "NOT_FOUND",
            &format!("Switch with ID {} not found", switch_id),
        )),
        Err(e) => {
            log::error!("Database error fetching switch {}: {}", switch_id, e);
            HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("DATABASE_ERROR", "Failed to fetch switch"))
        }
    }
}

#[get("/{id}/stats")]
pub async fn get_switch_stats(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
) -> impl Responder {
    let switch_id = id.into_inner() as i32;
    match app_state.switch_repo().get_switch_stats(switch_id).await {
        Ok(stats) => HttpResponse::Ok().json(ApiResponse::success(stats)),
        Err(e) if matches!(e, sqlx::Error::RowNotFound) => {
            HttpResponse::NotFound().json(ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Switch with ID {} not found", switch_id),
            ))
        }
        Err(e) => {
            log::error!("Database error fetching switch {} stats: {}", switch_id, e);
            HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("DATABASE_ERROR", "Failed to fetch switch statistics"))
        }
    }
}

#[post("")]
pub async fn create_switch(
    app_state: web::Data<AppState>,
    switch: web::Json<Switch>,
) -> impl Responder {
    match app_state.switch_repo().create_switch(switch.into_inner()).await {
        Ok(switch_id) => HttpResponse::Created().json(ApiResponse::success(serde_json::json!({
            "message": "Switch created successfully",
            "switch_id": switch_id
        }))),
        Err(e) => {
            log::error!("Error creating switch: {}", e);
            HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("DATABASE_ERROR", "Failed to create switch"))
        }
    }
}

#[put("/{id}")]
pub async fn update_switch(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
    updates: web::Json<HashMap<String, serde_json::Value>>,
) -> impl Responder {
    let switch_id = id.into_inner() as i32;
    let update_map = updates.into_inner();

    if update_map.is_empty() {
        return HttpResponse::BadRequest()
            .json(ApiResponse::<()>::error("VALIDATION_ERROR", "No fields provided for update"));
    }

    match app_state.switch_repo().update_switch(switch_id, update_map).await {
        Ok(true) => HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
            "message": "Switch updated successfully",
            "switch_id": switch_id
        }))),
        Ok(false) => HttpResponse::NotFound().json(ApiResponse::<()>::error(
            "NOT_FOUND",
            &format!("Switch with ID {} not found or no changes made", switch_id),
        )),
        Err(e) => {
            log::error!("Error updating switch {}: {}", switch_id, e);
            let msg = if e.to_string().contains("not allowed") {
                e.to_string()
            } else {
                "Failed to update switch".to_string()
            };
            HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("UPDATE_ERROR", &msg))
        }
    }
}

#[delete("/{id}")]
pub async fn delete_switch(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
) -> impl Responder {
    let switch_id = id.into_inner() as i32;
    match app_state.switch_repo().delete_switch(switch_id).await {
        Ok(true) => HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
            "message": "Switch deleted successfully",
            "switch_id": switch_id
        }))),
        Ok(false) => HttpResponse::NotFound().json(ApiResponse::<()>::error(
            "NOT_FOUND",
            &format!("Switch with ID {} not found", switch_id),
        )),
        Err(e) => {
            log::error!("Error deleting switch {}: {}", switch_id, e);
            HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("DELETE_ERROR", "Failed to delete switch"))
        }
    }
}

// ===================================================================
// PORT ENDPOINTS
// ===================================================================

#[get("/{id}/ports")]
pub async fn get_ports_by_switch(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
) -> impl Responder {
    let switch_id = id.into_inner() as i32;
    match app_state.switch_repo().get_ports_by_switch(switch_id).await {
        Ok(ports) => HttpResponse::Ok().json(ApiResponse::success(ports)),
        Err(e) => {
            log::error!("Error fetching ports for switch {}: {}", switch_id, e);
            HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("DATABASE_ERROR", "Failed to fetch ports"))
        }
    }
}

#[get("/ports/{port_id}")]
pub async fn get_port_by_id(
    app_state: web::Data<AppState>,
    port_id: web::Path<i64>,
) -> impl Responder {
    let port_id = port_id.into_inner() as i32;
    match app_state.switch_repo().get_port_by_id(port_id).await {
        Ok(Some(port)) => HttpResponse::Ok().json(ApiResponse::success(port)),
        Ok(None) => HttpResponse::NotFound().json(ApiResponse::<()>::error(
            "NOT_FOUND",
            &format!("Port with ID {} not found", port_id),
        )),
        Err(e) => {
            log::error!("Error fetching port {}: {}", port_id, e);
            HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("DATABASE_ERROR", "Failed to fetch port"))
        }
    }
}

#[post("/{id}/ports")]
pub async fn create_port(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
    mut port: web::Json<SwitchPort>,
) -> impl Responder {
    // Ensure switch_id matches the path parameter
    port.switch_id = id.into_inner() as i32;
    match app_state.switch_repo().create_port(port.into_inner()).await {
        Ok(port_id) => HttpResponse::Created().json(ApiResponse::success(serde_json::json!({
            "message": "Port created successfully",
            "switch_port_id": port_id
        }))),
        Err(e) => {
            log::error!("Error creating port: {}", e);
            HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("DATABASE_ERROR", "Failed to create port"))
        }
    }
}

#[put("/ports/{port_id}")]
pub async fn update_port(
    app_state: web::Data<AppState>,
    port_id: web::Path<i64>,
    updates: web::Json<HashMap<String, serde_json::Value>>,
) -> impl Responder {
    let port_id = port_id.into_inner() as i32;
    let update_map = updates.into_inner();

    if update_map.is_empty() {
        return HttpResponse::BadRequest()
            .json(ApiResponse::<()>::error("VALIDATION_ERROR", "No fields provided for update"));
    }

    match app_state.switch_repo().update_port(port_id, update_map).await {
        Ok(true) => HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
            "message": "Port updated successfully",
            "switch_port_id": port_id
        }))),
        Ok(false) => HttpResponse::NotFound().json(ApiResponse::<()>::error(
            "NOT_FOUND",
            &format!("Port with ID {} not found or no changes made", port_id),
        )),
        Err(e) => {
            log::error!("Error updating port {}: {}", port_id, e);
            HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("UPDATE_ERROR", "Failed to update port"))
        }
    }
}

#[delete("/ports/{port_id}")]
pub async fn delete_port(
    app_state: web::Data<AppState>,
    port_id: web::Path<i64>,
) -> impl Responder {
    let port_id = port_id.into_inner() as i32;
    match app_state.switch_repo().delete_port(port_id).await {
        Ok(true) => HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
            "message": "Port deleted successfully",
            "switch_port_id": port_id
        }))),
        Ok(false) => HttpResponse::NotFound().json(ApiResponse::<()>::error(
            "NOT_FOUND",
            &format!("Port with ID {} not found", port_id),
        )),
        Err(e) => {
            log::error!("Error deleting port {}: {}", port_id, e);
            HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("DELETE_ERROR", "Failed to delete port"))
        }
    }
}

// ===================================================================
// VLAN ENDPOINTS
// ===================================================================

#[get("/{id}/vlans")]
pub async fn get_vlans_by_switch(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
) -> impl Responder {
    let switch_id = id.into_inner() as i32;
    match app_state.switch_repo().get_vlans_by_switch(switch_id).await {
        Ok(vlans) => HttpResponse::Ok().json(ApiResponse::success(vlans)),
        Err(e) => {
            log::error!("Error fetching VLANs for switch {}: {}", switch_id, e);
            HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("DATABASE_ERROR", "Failed to fetch VLANs"))
        }
    }
}

#[post("/{id}/vlans")]
pub async fn create_vlan(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
    mut vlan: web::Json<SwitchVlan>,
) -> impl Responder {
    vlan.switch_id = id.into_inner() as i32;
    match app_state.switch_repo().create_vlan(vlan.into_inner()).await {
        Ok(vlan_db_id) => HttpResponse::Created().json(ApiResponse::success(serde_json::json!({
            "message": "VLAN created successfully",
            "vlan_db_id": vlan_db_id
        }))),
        Err(e) => {
            log::error!("Error creating VLAN: {}", e);
            HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("DATABASE_ERROR", "Failed to create VLAN"))
        }
    }
}

#[delete("/vlans/{vlan_db_id}")]
pub async fn delete_vlan(
    app_state: web::Data<AppState>,
    vlan_db_id: web::Path<i64>,
) -> impl Responder {
    let vlan_db_id = vlan_db_id.into_inner() as i32;
    match app_state.switch_repo().delete_vlan(vlan_db_id).await {
        Ok(true) => HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
            "message": "VLAN deleted successfully",
            "vlan_db_id": vlan_db_id
        }))),
        Ok(false) => HttpResponse::NotFound().json(ApiResponse::<()>::error(
            "NOT_FOUND",
            &format!("VLAN record with ID {} not found", vlan_db_id),
        )),
        Err(e) => {
            log::error!("Error deleting VLAN {}: {}", vlan_db_id, e);
            HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("DELETE_ERROR", "Failed to delete VLAN"))
        }
    }
}

// ===================================================================
// ROUTE CONFIGURATION
// ===================================================================

pub fn configure_switch_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/switches")
            .service(index)
            .service(get_all_switches)
            .service(get_all_switches_stats)
            // Port sub-routes must be registered before /{id} to avoid capture conflicts
            .service(get_port_by_id)
            .service(update_port)
            .service(delete_port)
            .service(delete_vlan)
            // Switch-level routes
            .service(get_switch_by_id)
            .service(get_switch_stats)
            .service(create_switch)
            .service(update_switch)
            .service(delete_switch)
            .service(get_ports_by_switch)
            .service(create_port)
            .service(get_vlans_by_switch)
            .service(create_vlan),
    );
}
