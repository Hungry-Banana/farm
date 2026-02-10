use actix_web::{get, web, HttpResponse, Responder};
use crate::api::responses::ApiResponse;
use crate::api::documentation::*;
use crate::api::query_parser::CommonPaginationQuery;
use crate::repositories::ComponentRepo;
use crate::state::AppState;

#[get("")]
pub async fn index() -> impl Responder {
    let documentation = ApiDocumentation::new(
        "Farm Component Catalog API",
        "v1",
        "Component reference data management endpoints",
        "/api/v1"
    )
    .with_response_format(standard_response_format())
    .add_endpoint(
        EndpointDoc::new("/api/v1/components/catalog", HttpMethod::Get, 
            "Get complete component catalog with all component types")
            .add_example(ExampleDoc::new("Get full catalog", "/api/v1/components/catalog"))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Returns all component types"))
            .add_response_code(ResponseCodeDoc::new(500, "Internal server error"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/components/stats", HttpMethod::Get, 
            "Get component catalog statistics")
            .add_example(ExampleDoc::new("Get catalog stats", "/api/v1/components/stats"))
            .add_response_code(ResponseCodeDoc::new(200, "Success - Returns component counts"))
            .add_response_code(ResponseCodeDoc::new(500, "Internal server error"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/components/cpus", HttpMethod::Get, 
            "Get all CPU component types with pagination")
            .add_query_parameter(ParameterDoc::new("page", ParameterType::Integer, "Page number", false).with_default("1"))
            .add_query_parameter(ParameterDoc::new("per_page", ParameterType::Integer, "Items per page", false).with_default("10"))
            .add_example(ExampleDoc::new("Get CPU types", "/api/v1/components/cpus?page=1&per_page=25"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid parameters"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/components/memory", HttpMethod::Get, 
            "Get all memory component types with pagination")
            .add_query_parameter(ParameterDoc::new("page", ParameterType::Integer, "Page number", false).with_default("1"))
            .add_query_parameter(ParameterDoc::new("per_page", ParameterType::Integer, "Items per page", false).with_default("10"))
            .add_example(ExampleDoc::new("Get memory types", "/api/v1/components/memory"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid parameters"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/components/disks", HttpMethod::Get, 
            "Get all disk component types with pagination")
            .add_query_parameter(ParameterDoc::new("page", ParameterType::Integer, "Page number", false).with_default("1"))
            .add_query_parameter(ParameterDoc::new("per_page", ParameterType::Integer, "Items per page", false).with_default("10"))
            .add_example(ExampleDoc::new("Get disk types", "/api/v1/components/disks"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid parameters"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/components/network", HttpMethod::Get, 
            "Get all network interface component types with pagination")
            .add_query_parameter(ParameterDoc::new("page", ParameterType::Integer, "Page number", false).with_default("1"))
            .add_query_parameter(ParameterDoc::new("per_page", ParameterType::Integer, "Items per page", false).with_default("10"))
            .add_example(ExampleDoc::new("Get network types", "/api/v1/components/network"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid parameters"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/components/gpus", HttpMethod::Get, 
            "Get all GPU component types with pagination")
            .add_query_parameter(ParameterDoc::new("page", ParameterType::Integer, "Page number", false).with_default("1"))
            .add_query_parameter(ParameterDoc::new("per_page", ParameterType::Integer, "Items per page", false).with_default("10"))
            .add_example(ExampleDoc::new("Get GPU types", "/api/v1/components/gpus"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid parameters"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/components/motherboards", HttpMethod::Get, 
            "Get all motherboard component types with pagination")
            .add_query_parameter(ParameterDoc::new("page", ParameterType::Integer, "Page number", false).with_default("1"))
            .add_query_parameter(ParameterDoc::new("per_page", ParameterType::Integer, "Items per page", false).with_default("10"))
            .add_example(ExampleDoc::new("Get motherboard types", "/api/v1/components/motherboards"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid parameters"))
    )
    .add_endpoint(
        EndpointDoc::new("/api/v1/components/bmcs", HttpMethod::Get, 
            "Get all BMC component types with pagination")
            .add_query_parameter(ParameterDoc::new("page", ParameterType::Integer, "Page number", false).with_default("1"))
            .add_query_parameter(ParameterDoc::new("per_page", ParameterType::Integer, "Items per page", false).with_default("10"))
            .add_example(ExampleDoc::new("Get BMC types", "/api/v1/components/bmcs"))
            .add_response_code(ResponseCodeDoc::new(200, "Success"))
            .add_response_code(ResponseCodeDoc::new(400, "Invalid parameters"))
    );

    let response = ApiResponse::success(documentation);
    HttpResponse::Ok().json(response)
}

#[get("/catalog")]
pub async fn get_complete_catalog(app_state: web::Data<AppState>) -> impl Responder {
    match app_state.component_repo().get_complete_catalog().await {
        Ok(catalog) => {
            let response = ApiResponse::success(catalog);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching component catalog: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch component catalog"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/stats")]
pub async fn get_catalog_stats(app_state: web::Data<AppState>) -> impl Responder {
    match app_state.component_repo().get_catalog_stats().await {
        Ok(stats) => {
            let response = ApiResponse::success(stats);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching component catalog stats: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch component catalog statistics"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/cpus")]
pub async fn get_all_cpu_types(
    app_state: web::Data<AppState>,
    query: web::Query<CommonPaginationQuery>
) -> impl Responder {
    match app_state.component_repo().get_all_cpu_types(query.into_inner()).await {
        Ok(cpu_types) => {
            let response = ApiResponse::success(cpu_types);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching CPU types: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch CPU component types"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/memory")]
pub async fn get_all_memory_types(
    app_state: web::Data<AppState>,
    query: web::Query<CommonPaginationQuery>
) -> impl Responder {
    match app_state.component_repo().get_all_memory_types(query.into_inner()).await {
        Ok(memory_types) => {
            let response = ApiResponse::success(memory_types);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching memory types: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch memory component types"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/disks")]
pub async fn get_all_disk_types(
    app_state: web::Data<AppState>,
    query: web::Query<CommonPaginationQuery>
) -> impl Responder {
    match app_state.component_repo().get_all_disk_types(query.into_inner()).await {
        Ok(disk_types) => {
            let response = ApiResponse::success(disk_types);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching disk types: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch disk component types"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/network")]
pub async fn get_all_network_types(
    app_state: web::Data<AppState>,
    query: web::Query<CommonPaginationQuery>
) -> impl Responder {
    match app_state.component_repo().get_all_network_types(query.into_inner()).await {
        Ok(network_types) => {
            let response = ApiResponse::success(network_types);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching network types: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch network component types"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/gpus")]
pub async fn get_all_gpu_types(
    app_state: web::Data<AppState>,
    query: web::Query<CommonPaginationQuery>
) -> impl Responder {
    match app_state.component_repo().get_all_gpu_types(query.into_inner()).await {
        Ok(gpu_types) => {
            let response = ApiResponse::success(gpu_types);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching GPU types: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch GPU component types"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/motherboards")]
pub async fn get_all_motherboard_types(
    app_state: web::Data<AppState>,
    query: web::Query<CommonPaginationQuery>
) -> impl Responder {
    match app_state.component_repo().get_all_motherboard_types(query.into_inner()).await {
        Ok(motherboard_types) => {
            let response = ApiResponse::success(motherboard_types);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching motherboard types: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch motherboard component types"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/bmcs")]
pub async fn get_all_bmc_types(
    app_state: web::Data<AppState>,
    query: web::Query<CommonPaginationQuery>
) -> impl Responder {
    match app_state.component_repo().get_all_bmc_types(query.into_inner()).await {
        Ok(bmc_types) => {
            let response = ApiResponse::success(bmc_types);
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            log::error!("Database error fetching BMC types: {}", e);
            
            let response = ApiResponse::<()>::error(
                "DATABASE_ERROR",
                "Failed to fetch BMC component types"
            );
            HttpResponse::InternalServerError().json(response)
        }
    }
}

pub fn configure_component_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/components")
            .service(index)
            .service(get_complete_catalog)
            .service(get_catalog_stats)
            .service(get_all_cpu_types)
            .service(get_all_memory_types)
            .service(get_all_disk_types)
            .service(get_all_network_types)
            .service(get_all_gpu_types)
            .service(get_all_motherboard_types)
            .service(get_all_bmc_types)
    );
}