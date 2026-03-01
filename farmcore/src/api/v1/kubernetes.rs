use actix_web::{get, post, put, web, HttpResponse, Responder};
use std::collections::HashMap;

use crate::api::responses::ApiResponse;
use crate::api::documentation::*;
use crate::api::query_parser::CommonPaginationQuery;
use crate::state::AppState;

#[get("")]
pub async fn index() -> impl Responder {
    let documentation = ApiDocumentation::new(
        "Farm Kubernetes API",
        "v1",
        "Kubernetes cluster and resource management endpoints",
        "/api/v1"
    )
    .with_response_format(standard_response_format())
    .add_endpoint(
        EndpointDoc::new("/api/v1/k8s/clusters", HttpMethod::Get, 
            "List all Kubernetes clusters with pagination and filtering")
            .add_query_parameter(ParameterDoc::new("page", ParameterType::Integer, "Page number", false).with_default("1"))
            .add_query_parameter(ParameterDoc::new("per_page", ParameterType::Integer, "Items per page", false).with_default("10"))
            .add_query_parameter(ParameterDoc::new("columns", ParameterType::String, "Comma-separated column list", false))
            .add_example(ExampleDoc::new("Get production clusters", "/api/v1/k8s/clusters?environment=production"))
            .add_example(ExampleDoc::new("Search k3s clusters", "/api/v1/k8s/clusters?distribution=k3s"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid parameters"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/k8s/clusters/{id}", HttpMethod::Get, "Get specific cluster by ID with complete details")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_example(ExampleDoc::new("Get cluster 1", "/api/v1/k8s/clusters/1"))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Returns cluster with nodes, node groups, and namespaces"))
            .add_response_code(ResponseCodeDoc::new(404, "Cluster not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/k8s/clusters/{id}/overview", HttpMethod::Get, "Get cluster overview statistics")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_example(ExampleDoc::new("Get overview for cluster 1", "/api/v1/k8s/clusters/1/overview"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Cluster not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/k8s/clusters/{id}/nodes", HttpMethod::Get, "Get all nodes for a cluster")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_query_parameter(ParameterDoc::new("state", ParameterType::String, "Filter by node state (ready, not-ready, unknown)", false))
            .add_example(ExampleDoc::new("Get all nodes", "/api/v1/k8s/clusters/1/nodes"))
            .add_example(ExampleDoc::new("Get ready nodes", "/api/v1/k8s/clusters/1/nodes?state=ready"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/k8s/nodes/{id}", HttpMethod::Get, "Get specific node with metrics and pods")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Node ID", true))
            .add_example(ExampleDoc::new("Get node details", "/api/v1/k8s/nodes/1"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(404, "Node not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/k8s/clusters/{id}/namespaces", HttpMethod::Get, "Get all namespaces for a cluster")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_example(ExampleDoc::new("Get namespaces", "/api/v1/k8s/clusters/1/namespaces"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/k8s/namespaces/{id}", HttpMethod::Get, "Get namespace with all resources")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Namespace ID", true))
            .add_example(ExampleDoc::new("Get namespace details", "/api/v1/k8s/namespaces/1"))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Returns namespace with workloads, services, ingresses, and pods"))
            .add_response_code(ResponseCodeDoc::new(404, "Namespace not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/k8s/clusters/{id}/workloads", HttpMethod::Get, "Get all workloads for a cluster")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_query_parameter(ParameterDoc::new("namespace_id", ParameterType::Integer, "Filter by namespace", false))
            .add_query_parameter(ParameterDoc::new("type", ParameterType::String, "Filter by workload type", false))
            .add_example(ExampleDoc::new("Get all workloads", "/api/v1/k8s/clusters/1/workloads"))
            .add_example(ExampleDoc::new("Get deployments", "/api/v1/k8s/clusters/1/workloads?type=deployment"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/k8s/clusters/{id}/pods", HttpMethod::Get, "Get all pods for a cluster")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_query_parameter(ParameterDoc::new("namespace_id", ParameterType::Integer, "Filter by namespace", false))
            .add_example(ExampleDoc::new("Get all pods", "/api/v1/k8s/clusters/1/pods"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/k8s/clusters/{id}/services", HttpMethod::Get, "Get all services for a cluster")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_query_parameter(ParameterDoc::new("namespace_id", ParameterType::Integer, "Filter by namespace", false))
            .add_example(ExampleDoc::new("Get all services", "/api/v1/k8s/clusters/1/services"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/k8s/clusters/{id}/events", HttpMethod::Get, "Get recent events for a cluster")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_query_parameter(ParameterDoc::new("limit", ParameterType::Integer, "Number of events to return", false).with_default("50"))
            .add_example(ExampleDoc::new("Get recent events", "/api/v1/k8s/clusters/1/events?limit=100"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/k8s/clusters/{id}", HttpMethod::Put, "Update cluster fields")
            .add_path_parameter(ParameterDoc::new("id", ParameterType::Integer, "Cluster ID", true))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Cluster updated"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid field or value"))
            .add_response_code(ResponseCodeDoc::new(404, "Cluster not found"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/k8s/inventory", HttpMethod::Post, "Create or update Kubernetes cluster from inventory data")
            .add_example(ExampleDoc::new("Post K8s inventory", "/api/v1/k8s/inventory"))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Cluster and nodes created or updated"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid inventory data"))
            .add_response_code(ResponseCodeDoc::new(500, "Database error"))
    );

    let response = ApiResponse::success(documentation);
    HttpResponse::Ok().json(response)
}

// ===================================================================
// CLUSTER ENDPOINTS
// ===================================================================

#[get("/clusters")]
pub async fn get_all_clusters(
    app_state: web::Data<AppState>, 
    query: web::Query<CommonPaginationQuery>
) -> impl Responder {
    match app_state.k8s_repo().get_all_clusters(query.into_inner()).await {
        Ok(clusters) => {
            let response = ApiResponse::success(clusters);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching clusters: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch Kubernetes clusters"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/clusters/{id}")]
pub async fn get_cluster_by_id(
    app_state: web::Data<AppState>, 
    id: web::Path<i32>
) -> impl Responder {
    let cluster_id = id.into_inner();
    
    match app_state.k8s_repo().get_cluster_by_id(cluster_id).await {
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
                "Failed to fetch cluster details",
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/clusters/{id}/overview")]
pub async fn get_cluster_overview(
    app_state: web::Data<AppState>,
    id: web::Path<i32>
) -> impl Responder {
    let cluster_id = id.into_inner();
    
    match app_state.k8s_repo().get_cluster_overview_stats(cluster_id).await {
        Ok(stats) => {
            let response = ApiResponse::success(stats);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching cluster overview for {}: {}", cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch cluster overview"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[put("/clusters/{id}")]
pub async fn update_cluster(
    app_state: web::Data<AppState>,
    id: web::Path<i32>,
    updates: web::Json<HashMap<String, serde_json::Value>>
) -> impl Responder {
    let cluster_id = id.into_inner();
    let update_map = updates.into_inner();

    if update_map.is_empty() {
        let response = ApiResponse::<()>::error(
            "VALIDATION_ERROR",
            "No fields provided for update"
        );
        return HttpResponse::BadRequest().json(response);
    }

    match app_state.k8s_repo().update_cluster(cluster_id, update_map).await {
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
            
            let error_message = if e.to_string().contains("not allowed") {
                e.to_string()
            } else {
                "Failed to update cluster".to_string()
            };

            let response = ApiResponse::<()>::error(
                "UPDATE_ERROR",
                &error_message
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// ===================================================================
// NODE ENDPOINTS
// ===================================================================

#[derive(serde::Deserialize)]
pub struct NodeQuery {
    state: Option<String>,
}

#[get("/clusters/{id}/nodes")]
pub async fn get_cluster_nodes(
    app_state: web::Data<AppState>,
    id: web::Path<i32>,
    query: web::Query<NodeQuery>
) -> impl Responder {
    let cluster_id = id.into_inner();
    
    let result = if let Some(state) = &query.state {
        app_state.k8s_repo().get_nodes_by_state(cluster_id, state).await
    } else {
        app_state.k8s_repo().get_all_nodes(cluster_id).await
    };

    match result {
        Ok(nodes) => {
            let response = ApiResponse::success(nodes);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching nodes for cluster {}: {}", cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch cluster nodes"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/nodes/{id}")]
pub async fn get_node_by_id(
    app_state: web::Data<AppState>,
    id: web::Path<i32>
) -> impl Responder {
    let node_id = id.into_inner();
    
    match app_state.k8s_repo().get_node_with_metrics(node_id).await {
        Ok(Some(node_details)) => {
            let response = ApiResponse::success(node_details);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Node with ID {} not found", node_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching node {}: {}", node_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch node details"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[put("/nodes/{id}")]
pub async fn update_node(
    app_state: web::Data<AppState>,
    id: web::Path<i32>,
    updates: web::Json<HashMap<String, serde_json::Value>>
) -> impl Responder {
    let node_id = id.into_inner();
    let update_map = updates.into_inner();

    if update_map.is_empty() {
        let response = ApiResponse::<()>::error(
            "VALIDATION_ERROR",
            "No fields provided for update"
        );
        return HttpResponse::BadRequest().json(response);
    }

    match app_state.k8s_repo().update_node(node_id, update_map).await {
        Ok(true) => {
            let response = ApiResponse::success(serde_json::json!({
                "message": "Node updated successfully",
                "node_id": node_id
            }));
            HttpResponse::Ok().json(response)
        },
        Ok(false) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Node with ID {} not found or no changes made", node_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Error updating node {}: {}", node_id, e);
            
            let response = ApiResponse::<()>::error(
                "UPDATE_ERROR",
                "Failed to update node"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// ===================================================================
// NAMESPACE ENDPOINTS
// ===================================================================

#[get("/clusters/{id}/namespaces")]
pub async fn get_cluster_namespaces(
    app_state: web::Data<AppState>,
    id: web::Path<i32>
) -> impl Responder {
    let cluster_id = id.into_inner();
    
    match app_state.k8s_repo().get_all_namespaces(cluster_id).await {
        Ok(namespaces) => {
            let response = ApiResponse::success(namespaces);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching namespaces for cluster {}: {}", cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch namespaces"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/namespaces/{id}")]
pub async fn get_namespace_by_id(
    app_state: web::Data<AppState>,
    id: web::Path<i32>
) -> impl Responder {
    let namespace_id = id.into_inner();
    
    match app_state.k8s_repo().get_namespace_with_resources(namespace_id).await {
        Ok(Some(namespace_details)) => {
            let response = ApiResponse::success(namespace_details);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Namespace with ID {} not found", namespace_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching namespace {}: {}", namespace_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch namespace details"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// ===================================================================
// WORKLOAD ENDPOINTS
// ===================================================================

#[derive(serde::Deserialize)]
pub struct WorkloadQuery {
    namespace_id: Option<i32>,
    #[serde(rename = "type")]
    workload_type: Option<String>,
}

#[get("/clusters/{id}/workloads")]
pub async fn get_cluster_workloads(
    app_state: web::Data<AppState>,
    id: web::Path<i32>,
    query: web::Query<WorkloadQuery>
) -> impl Responder {
    let cluster_id = id.into_inner();
    
    let result = if let Some(workload_type) = &query.workload_type {
        app_state.k8s_repo().get_workloads_by_type(cluster_id, workload_type).await
    } else {
        app_state.k8s_repo().get_all_workloads(cluster_id, query.namespace_id).await
    };

    match result {
        Ok(workloads) => {
            let response = ApiResponse::success(workloads);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching workloads for cluster {}: {}", cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch workloads"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/workloads/{id}")]
pub async fn get_workload_by_id(
    app_state: web::Data<AppState>,
    id: web::Path<i32>
) -> impl Responder {
    let workload_id = id.into_inner();
    
    match app_state.k8s_repo().get_workload_by_id(workload_id).await {
        Ok(Some(workload)) => {
            let response = ApiResponse::success(workload);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Workload with ID {} not found", workload_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching workload {}: {}", workload_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch workload"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// ===================================================================
// POD ENDPOINTS
// ===================================================================

#[derive(serde::Deserialize)]
pub struct PodQuery {
    namespace_id: Option<i32>,
}

#[get("/clusters/{id}/pods")]
pub async fn get_cluster_pods(
    app_state: web::Data<AppState>,
    id: web::Path<i32>,
    query: web::Query<PodQuery>
) -> impl Responder {
    let cluster_id = id.into_inner();
    
    match app_state.k8s_repo().get_all_pods(cluster_id, query.namespace_id).await {
        Ok(pods) => {
            let response = ApiResponse::success(pods);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching pods for cluster {}: {}", cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch pods"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/pods/{id}")]
pub async fn get_pod_by_id(
    app_state: web::Data<AppState>,
    id: web::Path<i32>
) -> impl Responder {
    let pod_id = id.into_inner();
    
    match app_state.k8s_repo().get_pod_by_id(pod_id).await {
        Ok(Some(pod)) => {
            let response = ApiResponse::success(pod);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Pod with ID {} not found", pod_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching pod {}: {}", pod_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch pod"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// ===================================================================
// SERVICE ENDPOINTS
// ===================================================================

#[derive(serde::Deserialize)]
pub struct ServiceQuery {
    namespace_id: Option<i32>,
}

#[get("/clusters/{id}/services")]
pub async fn get_cluster_services(
    app_state: web::Data<AppState>,
    id: web::Path<i32>,
    query: web::Query<ServiceQuery>
) -> impl Responder {
    let cluster_id = id.into_inner();
    
    match app_state.k8s_repo().get_all_services(cluster_id, query.namespace_id).await {
        Ok(services) => {
            let response = ApiResponse::success(services);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching services for cluster {}: {}", cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch services"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/services/{id}")]
pub async fn get_service_by_id(
    app_state: web::Data<AppState>,
    id: web::Path<i32>
) -> impl Responder {
    let service_id = id.into_inner();
    
    match app_state.k8s_repo().get_service_by_id(service_id).await {
        Ok(Some(service)) => {
            let response = ApiResponse::success(service);
            HttpResponse::Ok().json(response)
        },
        Ok(None) => {
            let response = ApiResponse::<()>::error(
                "NOT_FOUND",
                &format!("Service with ID {} not found", service_id)
            );
            HttpResponse::NotFound().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching service {}: {}", service_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch service"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// ===================================================================
// EVENT ENDPOINTS
// ===================================================================

#[derive(serde::Deserialize)]
pub struct EventQuery {
    limit: Option<i64>,
}

#[get("/clusters/{id}/events")]
pub async fn get_cluster_events(
    app_state: web::Data<AppState>,
    id: web::Path<i32>,
    query: web::Query<EventQuery>
) -> impl Responder {
    let cluster_id = id.into_inner();
    let limit = query.limit.unwrap_or(50);
    
    match app_state.k8s_repo().get_recent_events(cluster_id, limit).await {
        Ok(events) => {
            let response = ApiResponse::success(events);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching events for cluster {}: {}", cluster_id, e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch events"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// ===================================================================
// INVENTORY ENDPOINT
// ===================================================================

#[post("/inventory")]
pub async fn upsert_k8s_inventory(
    app_state: web::Data<AppState>,
    inventory: web::Json<crate::repositories::kubernetes_repository::K8sInventory>
) -> impl Responder {
    log::info!("Received Kubernetes inventory for cluster: {}, Nodes count: {}", 
        inventory.cluster_name, inventory.nodes.len());
    
    match app_state.k8s_repo().upsert_cluster_from_inventory(inventory.into_inner()).await {
        Ok(cluster_id) => {
            log::info!("Kubernetes inventory processed successfully for cluster_id: {}", cluster_id);
            
            let response = ApiResponse::success(serde_json::json!({
                "message": "Kubernetes inventory processed successfully",
                "cluster_id": cluster_id
            }));
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Error upserting Kubernetes inventory: {}", e);
            
            let error_message = e.to_string();
            let (mut status_code, error_code) = if error_message.contains("does not exist") {
                (HttpResponse::BadRequest(), "VALIDATION_ERROR")
            } else {
                (HttpResponse::InternalServerError(), "DATABASE_ERROR")
            };

            let response = ApiResponse::<()>::error(error_code, &error_message);
            status_code.json(response)
        }
    }
}

// ===================================================================
// ROUTE CONFIGURATION
// ===================================================================

pub fn configure_k8s_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/k8s")
            .service(index)
            // Cluster routes
            .service(get_all_clusters)
            .service(get_cluster_by_id)
            .service(get_cluster_overview)
            .service(update_cluster)
            .service(get_cluster_nodes)
            .service(get_cluster_namespaces)
            .service(get_cluster_workloads)
            .service(get_cluster_pods)
            .service(get_cluster_services)
            .service(get_cluster_events)
            // Node routes
            .service(get_node_by_id)
            .service(update_node)
            // Namespace routes
            .service(get_namespace_by_id)
            // Workload routes
            .service(get_workload_by_id)
            // Pod routes
            .service(get_pod_by_id)
            // Service routes
            .service(get_service_by_id)
            // Inventory
            .service(upsert_k8s_inventory)
    );
}
