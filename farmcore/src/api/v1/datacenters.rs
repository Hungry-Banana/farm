use actix_web::{delete, get, post, put, web, HttpResponse, Responder};
use std::collections::HashMap;

use crate::api::responses::ApiResponse;
use crate::api::documentation::*;
use crate::api::query_parser::CommonPaginationQuery;
use crate::state::AppState;
use crate::models::{Datacenter, DatacenterRack, DatacenterRackPosition};

#[get("")]
pub async fn index() -> impl Responder {
    let documentation = ApiDocumentation::new(
        "Farm Datacenter API",
        "v1",
        "Datacenter management endpoints",
        "/api/v1"
    )
    .with_response_format(standard_response_format())
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters", HttpMethod::Get, 
            "List all datacenters with pagination and filtering")
            .add_query_parameter(ParameterDoc::new("page", ParameterType::Integer, "Page number", false).with_default("1"))
            .add_query_parameter(ParameterDoc::new("per_page", ParameterType::Integer, "Items per page", false).with_default("10"))
            .add_query_parameter(ParameterDoc::new("columns", ParameterType::String, "Comma-separated column list", false))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid parameters"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/{id}", HttpMethod::Get, "Get specific datacenter by ID")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Datacenter ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Datacenter not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/{id}/with-racks", HttpMethod::Get, "Get datacenter with all its racks")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Datacenter ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Datacenter not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/stats", HttpMethod::Get, "Get statistics for all datacenters")
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/{id}/stats", HttpMethod::Get, "Get statistics for a specific datacenter")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Datacenter ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Datacenter not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters", HttpMethod::Post, "Create a new datacenter")
            .add_response_code(ResponseCodeDoc::new(201, "Datacenter created"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid data"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/{id}", HttpMethod::Put, "Update datacenter fields")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Datacenter ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Datacenter not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/{id}", HttpMethod::Delete, "Delete a datacenter")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Datacenter ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Datacenter not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/{id}/racks", HttpMethod::Get, "Get all racks for a datacenter")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Datacenter ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/racks/{rack_id}", HttpMethod::Get, "Get specific rack by ID")
            .add_path_parameter(ParameterDoc::new("rack_id", ParameterType::Integer, "Rack ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Rack not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/racks/{rack_id}/with-positions", HttpMethod::Get, "Get rack with all its positions")
            .add_path_parameter(ParameterDoc::new("rack_id", ParameterType::Integer, "Rack ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Rack not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/racks/{rack_id}/utilization", HttpMethod::Get, "Get rack utilization statistics")
            .add_path_parameter(ParameterDoc::new("rack_id", ParameterType::Integer, "Rack ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Rack not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/{id}/racks", HttpMethod::Post, "Create a new rack in a datacenter")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Datacenter ID", true))
            .add_response_code(ResponseCodeDoc::new(201, "Rack created"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid data"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/racks/{rack_id}", HttpMethod::Put, "Update rack fields")
            .add_path_parameter(ParameterDoc::new("rack_id", ParameterType::Integer, "Rack ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Rack not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/racks/{rack_id}", HttpMethod::Delete, "Delete a rack")
            .add_path_parameter(ParameterDoc::new("rack_id", ParameterType::Integer, "Rack ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Rack not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/racks/{rack_id}/positions", HttpMethod::Get, "Get all positions for a rack")
            .add_path_parameter(ParameterDoc::new("rack_id", ParameterType::Integer, "Rack ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/positions/{position_id}", HttpMethod::Get, "Get specific position by ID")
            .add_path_parameter(ParameterDoc::new("position_id", ParameterType::Integer, "Position ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Position not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/racks/{rack_id}/positions", HttpMethod::Post, "Create a new position in a rack")
            .add_path_parameter(ParameterDoc::new("rack_id", ParameterType::Integer, "Rack ID", true))
            .add_response_code(ResponseCodeDoc::new(201, "Position created"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid data"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/positions/{position_id}", HttpMethod::Put, "Update position fields")
            .add_path_parameter(ParameterDoc::new("position_id", ParameterType::Integer, "Position ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Position not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/datacenters/positions/{position_id}", HttpMethod::Delete, "Delete a position")
            .add_path_parameter(ParameterDoc::new("position_id", ParameterType::Integer, "Position ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Position not found"))
    );

    let response = ApiResponse::success(documentation);
    HttpResponse::Ok().json(response)
}

// ==================== Datacenter Endpoints ====================

#[get("/list")]
pub async fn get_all_datacenters(
    app_state: web::Data<AppState>, 
    query: web::Query<CommonPaginationQuery>
) -> impl Responder {
    match app_state.datacenter_repo().get_all_datacenters(query.into_inner()).await {
        Ok(datacenters) => {
            let response = ApiResponse::success(datacenters);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching datacenters: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch datacenters"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/{id}")]
pub async fn get_datacenter_by_id(
    app_state: web::Data<AppState>, 
    id: web::Path<i64>
) -> impl Responder {
    let datacenter_id = id.into_inner() as i32;
    
    match app_state.datacenter_repo().get_datacenter_by_id(datacenter_id).await {
        Ok(Some(datacenter)) => {
            let response = ApiResponse::success(datacenter);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Datacenter with ID {} not found", datacenter_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching datacenter {}: {}", datacenter_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch datacenter"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/{id}/with-racks")]
pub async fn get_datacenter_with_racks(
    app_state: web::Data<AppState>, 
    id: web::Path<i64>
) -> impl Responder {
    let datacenter_id = id.into_inner() as i32;
    
    match app_state.datacenter_repo().get_datacenter_with_racks(datacenter_id).await {
        Ok(Some(datacenter_with_racks)) => {
            let response = ApiResponse::success(datacenter_with_racks);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Datacenter with ID {} not found", datacenter_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching datacenter with racks {}: {}", datacenter_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch datacenter with racks"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/stats")]
pub async fn get_all_datacenters_stats(
    app_state: web::Data<AppState>
) -> impl Responder {
    match app_state.datacenter_repo().get_all_datacenters_stats().await {
        Ok(stats) => {
            let response = ApiResponse::success(stats);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching datacenter stats: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch datacenter statistics"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/{id}/stats")]
pub async fn get_datacenter_stats(
    app_state: web::Data<AppState>,
    id: web::Path<i64>
) -> impl Responder {
    let datacenter_id = id.into_inner() as i32;
    
    match app_state.datacenter_repo().get_datacenter_stats(datacenter_id).await {
        Ok(stats) => {
            let response = ApiResponse::success(stats);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching datacenter {} stats: {}", datacenter_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch datacenter statistics"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[post("")]
pub async fn create_datacenter(
    app_state: web::Data<AppState>,
    datacenter: web::Json<Datacenter>
) -> impl Responder {
    let datacenter_data = datacenter.into_inner();
    
    match app_state.datacenter_repo().create_datacenter(datacenter_data).await {
        Ok(datacenter_id) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Datacenter created successfully",
                "datacenter_id": datacenter_id
            }));
            HttpResponse::Created().json(response)
        },
        Err(e) => {
            log::error!("Error creating datacenter: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to create datacenter"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[put("/{id}")]
pub async fn update_datacenter(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
    updates: web::Json<HashMap<String, serde_json::Value>>
) -> impl Responder {
    let datacenter_id = id.into_inner() as i32;
    let update_map = updates.into_inner();

    if update_map.is_empty() {
        let response = ApiResponse::<()>::error(
            "VALIDATION_ERROR",
            "No fields provided for update"
        );
        return HttpResponse::BadRequest().json(response);
    }

    match app_state.datacenter_repo().update_datacenter(datacenter_id, update_map).await {
        Ok(true) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Datacenter updated successfully",
                "datacenter_id": datacenter_id
            }));
            HttpResponse::Ok().json(response)
        },
        Ok(false) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Datacenter with ID {} not found or no changes made", datacenter_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Error updating datacenter {}: {}", datacenter_id, e);
            
            let response = ApiResponse::<()>::error(
                "UPDATE_ERROR",
                "Failed to update datacenter"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[delete("/{id}")]
pub async fn delete_datacenter(
    app_state: web::Data<AppState>,
    id: web::Path<i64>
) -> impl Responder {
    let datacenter_id = id.into_inner() as i32;
    
    match app_state.datacenter_repo().delete_datacenter(datacenter_id).await {
        Ok(true) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Datacenter deleted successfully",
                "datacenter_id": datacenter_id
            }));
            HttpResponse::Ok().json(response)
        },
        Ok(false) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Datacenter with ID {} not found", datacenter_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Error deleting datacenter {}: {}", datacenter_id, e);
            
            let response = ApiResponse::<()>::error(
                "DELETE_ERROR",
                "Failed to delete datacenter"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// ==================== Rack Endpoints ====================

#[get("/{id}/racks")]
pub async fn get_racks_by_datacenter(
    app_state: web::Data<AppState>,
    id: web::Path<i64>
) -> impl Responder {
    let datacenter_id = id.into_inner() as i32;
    
    match app_state.datacenter_repo().get_racks_by_datacenter(datacenter_id).await {
        Ok(racks) => {
            let response = ApiResponse::success(racks);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching racks for datacenter {}: {}", datacenter_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch racks"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/racks/{rack_id}")]
pub async fn get_rack_by_id(
    app_state: web::Data<AppState>,
    rack_id: web::Path<i64>
) -> impl Responder {
    let rack_id = rack_id.into_inner() as i32;
    
    match app_state.datacenter_repo().get_rack_by_id(rack_id).await {
        Ok(Some(rack)) => {
            let response = ApiResponse::success(rack);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Rack with ID {} not found", rack_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching rack {}: {}", rack_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch rack"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/racks/{rack_id}/with-positions")]
pub async fn get_rack_with_positions(
    app_state: web::Data<AppState>,
    rack_id: web::Path<i64>
) -> impl Responder {
    let rack_id = rack_id.into_inner() as i32;
    
    match app_state.datacenter_repo().get_rack_with_positions(rack_id).await {
        Ok(Some(rack_with_positions)) => {
            let response = ApiResponse::success(rack_with_positions);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Rack with ID {} not found", rack_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching rack with positions {}: {}", rack_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch rack with positions"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/racks/{rack_id}/utilization")]
pub async fn get_rack_utilization(
    app_state: web::Data<AppState>,
    rack_id: web::Path<i64>
) -> impl Responder {
    let rack_id = rack_id.into_inner() as i32;
    
    match app_state.datacenter_repo().get_rack_utilization(rack_id).await {
        Ok(utilization) => {
            let response = ApiResponse::success(utilization);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching rack utilization {}: {}", rack_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch rack utilization"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[post("/{id}/racks")]
pub async fn create_rack(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
    rack: web::Json<DatacenterRack>
) -> impl Responder {
    let datacenter_id = id.into_inner() as i32;
    let mut rack_data = rack.into_inner();
    rack_data.data_center_id = datacenter_id;
    
    match app_state.datacenter_repo().create_rack(rack_data).await {
        Ok(rack_id) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Rack created successfully",
                "rack_id": rack_id
            }));
            HttpResponse::Created().json(response)
        },
        Err(e) => {
            log::error!("Error creating rack: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to create rack"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[put("/racks/{rack_id}")]
pub async fn update_rack(
    app_state: web::Data<AppState>,
    rack_id: web::Path<i64>,
    updates: web::Json<HashMap<String, serde_json::Value>>
) -> impl Responder {
    let rack_id = rack_id.into_inner() as i32;
    let update_map = updates.into_inner();

    if update_map.is_empty() {
        let response = ApiResponse::<()>::error(
            "VALIDATION_ERROR",
            "No fields provided for update"
        );
        return HttpResponse::BadRequest().json(response);
    }

    match app_state.datacenter_repo().update_rack(rack_id, update_map).await {
        Ok(true) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Rack updated successfully",
                "rack_id": rack_id
            }));
            HttpResponse::Ok().json(response)
        },
        Ok(false) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Rack with ID {} not found or no changes made", rack_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Error updating rack {}: {}", rack_id, e);
            
            let response = ApiResponse::<()>::error(
                "UPDATE_ERROR",
                "Failed to update rack"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[delete("/racks/{rack_id}")]
pub async fn delete_rack(
    app_state: web::Data<AppState>,
    rack_id: web::Path<i64>
) -> impl Responder {
    let rack_id = rack_id.into_inner() as i32;
    
    match app_state.datacenter_repo().delete_rack(rack_id).await {
        Ok(true) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Rack deleted successfully",
                "rack_id": rack_id
            }));
            HttpResponse::Ok().json(response)
        },
        Ok(false) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Rack with ID {} not found", rack_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Error deleting rack {}: {}", rack_id, e);
            
            let response = ApiResponse::<()>::error(
                "DELETE_ERROR",
                "Failed to delete rack"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// ==================== Rack Position Endpoints ====================

#[get("/racks/{rack_id}/positions")]
pub async fn get_positions_by_rack(
    app_state: web::Data<AppState>,
    rack_id: web::Path<i64>
) -> impl Responder {
    let rack_id = rack_id.into_inner() as i32;
    
    match app_state.datacenter_repo().get_positions_by_rack(rack_id).await {
        Ok(positions) => {
            let response = ApiResponse::success(positions);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching positions for rack {}: {}", rack_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch positions"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/positions/{position_id}")]
pub async fn get_position_by_id(
    app_state: web::Data<AppState>,
    position_id: web::Path<i64>
) -> impl Responder {
    let position_id = position_id.into_inner() as i32;
    
    match app_state.datacenter_repo().get_position_by_id(position_id).await {
        Ok(Some(position)) => {
            let response = ApiResponse::success(position);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Position with ID {} not found", position_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching position {}: {}", position_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch position"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[post("/racks/{rack_id}/positions")]
pub async fn create_position(
    app_state: web::Data<AppState>,
    rack_id: web::Path<i64>,
    position: web::Json<DatacenterRackPosition>
) -> impl Responder {
    let rack_id = rack_id.into_inner() as i32;
    let mut position_data = position.into_inner();
    position_data.rack_id = rack_id;
    
    match app_state.datacenter_repo().create_position(position_data).await {
        Ok(position_id) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Position created successfully",
                "position_id": position_id
            }));
            HttpResponse::Created().json(response)
        },
        Err(e) => {
            log::error!("Error creating position: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to create position"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[put("/positions/{position_id}")]
pub async fn update_position(
    app_state: web::Data<AppState>,
    position_id: web::Path<i64>,
    updates: web::Json<HashMap<String, serde_json::Value>>
) -> impl Responder {
    let position_id = position_id.into_inner() as i32;
    let update_map = updates.into_inner();

    if update_map.is_empty() {
        let response = ApiResponse::<()>::error(
            "VALIDATION_ERROR",
            "No fields provided for update"
        );
        return HttpResponse::BadRequest().json(response);
    }

    match app_state.datacenter_repo().update_position(position_id, update_map).await {
        Ok(true) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Position updated successfully",
                "position_id": position_id
            }));
            HttpResponse::Ok().json(response)
        },
        Ok(false) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Position with ID {} not found or no changes made", position_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Error updating position {}: {}", position_id, e);
            
            let response = ApiResponse::<()>::error(
                "UPDATE_ERROR",
                "Failed to update position"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[delete("/positions/{position_id}")]
pub async fn delete_position(
    app_state: web::Data<AppState>,
    position_id: web::Path<i64>
) -> impl Responder {
    let position_id = position_id.into_inner() as i32;
    
    match app_state.datacenter_repo().delete_position(position_id).await {
        Ok(true) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Position deleted successfully",
                "position_id": position_id
            }));
            HttpResponse::Ok().json(response)
        },
        Ok(false) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Position with ID {} not found", position_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Error deleting position {}: {}", position_id, e);
            
            let response = ApiResponse::<()>::error(
                "DELETE_ERROR",
                "Failed to delete position"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

pub fn configure_datacenter_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/datacenters")
            .service(index)
            .service(get_all_datacenters)
            .service(get_all_datacenters_stats)
            .service(get_datacenter_by_id)
            .service(get_datacenter_with_racks)
            .service(get_datacenter_stats)
            .service(create_datacenter)
            .service(update_datacenter)
            .service(delete_datacenter)
            .service(get_racks_by_datacenter)
            .service(get_rack_by_id)
            .service(get_rack_with_positions)
            .service(get_rack_utilization)
            .service(create_rack)
            .service(update_rack)
            .service(delete_rack)
            .service(get_positions_by_rack)
            .service(get_position_by_id)
            .service(create_position)
            .service(update_position)
            .service(delete_position)
    );
}
