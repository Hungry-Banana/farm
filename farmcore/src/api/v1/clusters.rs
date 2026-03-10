use actix_web::{delete, get, post, put, web, HttpResponse, Responder};
use std::collections::HashMap;

use crate::api::responses::ApiResponse;
use crate::api::documentation::*;
use crate::api::query_parser::CommonPaginationQuery;
use crate::state::AppState;
use crate::models::{ServerCluster, ServerSubCluster};

#[get("")]
pub async fn index() -> impl Responder {
    let documentation = ApiDocumentation::new(
        "Farm Cluster API",
        "v1",
        "Cluster management endpoints",
        "/api/v1"
    )
    .with_response_format(standard_response_format())
    .add_endpoint(
        EndpointDoc::new("/api/v1/clusters", HttpMethod::Get, 
            "List all clusters with pagination and filtering")
            .add_query_parameter(ParameterDoc::new("page", ParameterType::Integer, "Page number", false).with_default("1"))
            .add_query_parameter(ParameterDoc::new("per_page", ParameterType::Integer, "Items per page", false).with_default("10"))
            .add_query_parameter(ParameterDoc::new("columns", ParameterType::String, "Comma-separated column list", false))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid parameters"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/clusters/{id}", HttpMethod::Get, "Get specific cluster by ID")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Cluster not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/clusters/{id}/with-sub-clusters", HttpMethod::Get, "Get cluster with all its sub-clusters")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Cluster not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/clusters/{id}/with-servers", HttpMethod::Get, "Get cluster with all its servers")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Cluster not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/clusters/stats", HttpMethod::Get, "Get statistics for all clusters")
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/clusters/{id}/stats", HttpMethod::Get, "Get statistics for a specific cluster")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Cluster not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/clusters", HttpMethod::Post, "Create a new cluster")
            .add_response_code(ResponseCodeDoc::new(201, "Cluster created"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid data"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/clusters/{id}", HttpMethod::Put, "Update cluster fields")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Cluster not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/clusters/{id}", HttpMethod::Delete, "Delete a cluster")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Cluster not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/clusters/{id}/sub-clusters", HttpMethod::Get, "Get all sub-clusters for a cluster")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/clusters/sub-clusters/{sub_cluster_id}", HttpMethod::Get, "Get specific sub-cluster by ID")
            .add_path_parameter(ParameterDoc::new("sub_cluster_id", ParameterType::Integer, "Sub-cluster ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Sub-cluster not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/clusters/sub-clusters/{sub_cluster_id}/stats", HttpMethod::Get, "Get sub-cluster statistics")
            .add_path_parameter(ParameterDoc::new("sub_cluster_id", ParameterType::Integer, "Sub-cluster ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Sub-cluster not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/clusters/{id}/sub-clusters", HttpMethod::Post, "Create a new sub-cluster in a cluster")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_response_code(ResponseCodeDoc::new(201, "Sub-cluster created"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid data"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/clusters/sub-clusters/{sub_cluster_id}", HttpMethod::Put, "Update sub-cluster fields")
            .add_path_parameter(ParameterDoc::new("sub_cluster_id", ParameterType::Integer, "Sub-cluster ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Sub-cluster not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/clusters/sub-clusters/{sub_cluster_id}", HttpMethod::Delete, "Delete a sub-cluster")
            .add_path_parameter(ParameterDoc::new("sub_cluster_id", ParameterType::Integer, "Sub-cluster ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Sub-cluster not found"))
    );

    let response = ApiResponse::success(documentation);
    HttpResponse::Ok().json(response)
}

// ==================== Cluster Endpoints ====================

#[get("/list")]
pub async fn get_all_clusters(
    app_state: web::Data<AppState>, 
    query: web::Query<CommonPaginationQuery>
) -> impl Responder {
    match app_state.cluster_repo().get_all_clusters(query.into_inner()).await {
        Ok(clusters) => {
            let response = ApiResponse::success(clusters);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching clusters: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch clusters"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/{id}")]
pub async fn get_cluster_by_id(
    app_state: web::Data<AppState>, 
    id: web::Path<i64>
) -> impl Responder {
    let cluster_id = id.into_inner() as i32;
    
    match app_state.cluster_repo().get_cluster_by_id(cluster_id).await {
        Ok(Some(cluster)) => {
            let response = ApiResponse::success(cluster);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Cluster with ID {} not found", cluster_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching cluster {}: {}", cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch cluster"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/{id}/with-sub-clusters")]
pub async fn get_cluster_with_sub_clusters(
    app_state: web::Data<AppState>, 
    id: web::Path<i64>
) -> impl Responder {
    let cluster_id = id.into_inner() as i32;
    
    match app_state.cluster_repo().get_cluster_with_sub_clusters(cluster_id).await {
        Ok(Some(cluster_with_sub_clusters)) => {
            let response = ApiResponse::success(cluster_with_sub_clusters);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Cluster with ID {} not found", cluster_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching cluster with sub-clusters {}: {}", cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch cluster with sub-clusters"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/{id}/with-servers")]
pub async fn get_cluster_with_servers(
    app_state: web::Data<AppState>, 
    id: web::Path<i64>
) -> impl Responder {
    let cluster_id = id.into_inner() as i32;
    
    match app_state.cluster_repo().get_cluster_with_servers(cluster_id).await {
        Ok(Some(cluster_with_servers)) => {
            let response = ApiResponse::success(cluster_with_servers);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Cluster with ID {} not found", cluster_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching cluster with servers {}: {}", cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch cluster with servers"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/stats")]
pub async fn get_all_clusters_stats(
    app_state: web::Data<AppState>
) -> impl Responder {
    match app_state.cluster_repo().get_all_clusters_stats().await {
        Ok(stats) => {
            let response = ApiResponse::success(stats);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching cluster stats: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch cluster statistics"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/{id}/stats")]
pub async fn get_cluster_stats(
    app_state: web::Data<AppState>,
    id: web::Path<i64>
) -> impl Responder {
    let cluster_id = id.into_inner() as i32;
    
    match app_state.cluster_repo().get_cluster_stats(cluster_id).await {
        Ok(stats) => {
            let response = ApiResponse::success(stats);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching cluster {} stats: {}", cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch cluster statistics"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[post("")]
pub async fn create_cluster(
    app_state: web::Data<AppState>,
    cluster: web::Json<ServerCluster>
) -> impl Responder {
    let cluster_data = cluster.into_inner();
    
    match app_state.cluster_repo().create_cluster(cluster_data).await {
        Ok(cluster_id) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Cluster created successfully",
                "cluster_id": cluster_id
            }));
            HttpResponse::Created().json(response)
        },
        Err(e) => {
            log::error!("Error creating cluster: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to create cluster"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[put("/{id}")]
pub async fn update_cluster(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
    updates: web::Json<HashMap<String, serde_json::Value>>
) -> impl Responder {
    let cluster_id = id.into_inner() as i32;
    let update_map = updates.into_inner();

    if update_map.is_empty() {
        let response = ApiResponse::<()>::error(
            "VALIDATION_ERROR",
            "No fields provided for update"
        );
        return HttpResponse::BadRequest().json(response);
    }

    match app_state.cluster_repo().update_cluster(cluster_id, update_map).await {
        Ok(true) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Cluster updated successfully",
                "cluster_id": cluster_id
            }));
            HttpResponse::Ok().json(response)
        },
        Ok(false) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Cluster with ID {} not found or no changes made", cluster_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Error updating cluster {}: {}", cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "UPDATE_ERROR",
                "Failed to update cluster"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[delete("/{id}")]
pub async fn delete_cluster(
    app_state: web::Data<AppState>,
    id: web::Path<i64>
) -> impl Responder {
    let cluster_id = id.into_inner() as i32;
    
    match app_state.cluster_repo().delete_cluster(cluster_id).await {
        Ok(true) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Cluster deleted successfully",
                "cluster_id": cluster_id
            }));
            HttpResponse::Ok().json(response)
        },
        Ok(false) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Cluster with ID {} not found", cluster_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Error deleting cluster {}: {}", cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DELETE_ERROR",
                "Failed to delete cluster"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// ==================== Sub-Cluster Endpoints ====================

#[get("/{id}/sub-clusters")]
pub async fn get_sub_clusters_by_cluster(
    app_state: web::Data<AppState>,
    id: web::Path<i64>
) -> impl Responder {
    let cluster_id = id.into_inner() as i32;
    
    match app_state.cluster_repo().get_sub_clusters_by_cluster(cluster_id).await {
        Ok(sub_clusters) => {
            let response = ApiResponse::success(sub_clusters);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching sub-clusters for cluster {}: {}", cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch sub-clusters"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/sub-clusters/{sub_cluster_id}")]
pub async fn get_sub_cluster_by_id(
    app_state: web::Data<AppState>,
    sub_cluster_id: web::Path<i64>
) -> impl Responder {
    let sub_cluster_id = sub_cluster_id.into_inner() as i32;
    
    match app_state.cluster_repo().get_sub_cluster_by_id(sub_cluster_id).await {
        Ok(Some(sub_cluster)) => {
            let response = ApiResponse::success(sub_cluster);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Sub-cluster with ID {} not found", sub_cluster_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching sub-cluster {}: {}", sub_cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch sub-cluster"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/sub-clusters/{sub_cluster_id}/stats")]
pub async fn get_sub_cluster_stats(
    app_state: web::Data<AppState>,
    sub_cluster_id: web::Path<i64>
) -> impl Responder {
    let sub_cluster_id = sub_cluster_id.into_inner() as i32;
    
    match app_state.cluster_repo().get_sub_cluster_stats(sub_cluster_id).await {
        Ok(stats) => {
            let response = ApiResponse::success(stats);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching sub-cluster {} stats: {}", sub_cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch sub-cluster statistics"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[post("/{id}/sub-clusters")]
pub async fn create_sub_cluster(
    app_state: web::Data<AppState>,
    id: web::Path<i64>,
    sub_cluster: web::Json<ServerSubCluster>
) -> impl Responder {
    let cluster_id = id.into_inner() as i32;
    let mut sub_cluster_data = sub_cluster.into_inner();
    sub_cluster_data.cluster_id = cluster_id;
    
    match app_state.cluster_repo().create_sub_cluster(sub_cluster_data).await {
        Ok(sub_cluster_id) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Sub-cluster created successfully",
                "sub_cluster_id": sub_cluster_id
            }));
            HttpResponse::Created().json(response)
        },
        Err(e) => {
            log::error!("Error creating sub-cluster: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to create sub-cluster"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[put("/sub-clusters/{sub_cluster_id}")]
pub async fn update_sub_cluster(
    app_state: web::Data<AppState>,
    sub_cluster_id: web::Path<i64>,
    updates: web::Json<HashMap<String, serde_json::Value>>
) -> impl Responder {
    let sub_cluster_id = sub_cluster_id.into_inner() as i32;
    let update_map = updates.into_inner();

    if update_map.is_empty() {
        let response = ApiResponse::<()>::error(
            "VALIDATION_ERROR",
            "No fields provided for update"
        );
        return HttpResponse::BadRequest().json(response);
    }

    match app_state.cluster_repo().update_sub_cluster(sub_cluster_id, update_map).await {
        Ok(true) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Sub-cluster updated successfully",
                "sub_cluster_id": sub_cluster_id
            }));
            HttpResponse::Ok().json(response)
        },
        Ok(false) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Sub-cluster with ID {} not found or no changes made", sub_cluster_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Error updating sub-cluster {}: {}", sub_cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "UPDATE_ERROR",
                "Failed to update sub-cluster"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[delete("/sub-clusters/{sub_cluster_id}")]
pub async fn delete_sub_cluster(
    app_state: web::Data<AppState>,
    sub_cluster_id: web::Path<i64>
) -> impl Responder {
    let sub_cluster_id = sub_cluster_id.into_inner() as i32;
    
    match app_state.cluster_repo().delete_sub_cluster(sub_cluster_id).await {
        Ok(true) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Sub-cluster deleted successfully",
                "sub_cluster_id": sub_cluster_id
            }));
            HttpResponse::Ok().json(response)
        },
        Ok(false) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Sub-cluster with ID {} not found", sub_cluster_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Error deleting sub-cluster {}: {}", sub_cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DELETE_ERROR",
                "Failed to delete sub-cluster"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

pub fn configure_cluster_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/clusters")
            .service(index)
            .service(get_all_clusters)
            .service(get_all_clusters_stats)
            .service(get_cluster_by_id)
            .service(get_cluster_with_sub_clusters)
            .service(get_cluster_with_servers)
            .service(get_cluster_stats)
            .service(create_cluster)
            .service(update_cluster)
            .service(delete_cluster)
            .service(get_sub_clusters_by_cluster)
            .service(get_sub_cluster_by_id)
            .service(get_sub_cluster_stats)
            .service(create_sub_cluster)
            .service(update_sub_cluster)
            .service(delete_sub_cluster)
    );
}
