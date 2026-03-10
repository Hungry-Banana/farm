use sqlx::FromRow;
use serde::{Deserialize, Serialize};

// ===================================================================
// SERVER CLUSTER MODEL
// ===================================================================

#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ServerCluster {
    pub cluster_id: i32,
    
    // Basic Information
    pub cluster_name: String,
    pub cluster_code: String,
    pub description: Option<String>,
    
    // Location Information
    pub data_center_id: Option<i32>,
    pub region: Option<String>,
    pub availability_zone: Option<String>,
    
    // Management Fields
    pub status: String, // ENUM: ACTIVE, INACTIVE, MAINTENANCE, DECOMMISSIONED
    pub environment_type: Option<String>, // ENUM: PRODUCTION, DEVELOPMENT, QA, STAGING, TESTING
    
    // Capacity Tracking
    pub total_servers: Option<i32>,
    pub active_servers: Option<i32>,
    pub max_capacity: Option<i32>,
    
    // Metadata
    pub owner: Option<String>,
    pub contact_email: Option<String>,
    pub tags: Option<serde_json::Value>,
    pub metadata: Option<serde_json::Value>,
    
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl ServerCluster {
    pub const TABLE: &'static str = "server_clusters";
    pub const KEY: &'static str = "cluster_id";
}

// ===================================================================
// SERVER SUB-CLUSTER MODEL
// ===================================================================

#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ServerSubCluster {
    pub sub_cluster_id: i32,
    pub cluster_id: i32,
    
    // Basic Information
    pub sub_cluster_name: String,
    pub sub_cluster_code: String,
    pub description: Option<String>,
    
    // Sub-cluster Type/Purpose
    pub sub_cluster_type: Option<String>, // ENUM: COMPUTE, STORAGE, MIXED, MANAGEMENT, NETWORK, OTHER
    
    // Management Fields
    pub status: String, // ENUM: ACTIVE, INACTIVE, MAINTENANCE, DECOMMISSIONED
    
    // Capacity Tracking
    pub total_servers: Option<i32>,
    pub active_servers: Option<i32>,
    pub max_capacity: Option<i32>,
    
    // Workload Information
    pub workload_type: Option<String>,
    pub priority_level: Option<String>, // ENUM: HIGH, MEDIUM, LOW
    
    // Metadata
    pub tags: Option<serde_json::Value>,
    pub metadata: Option<serde_json::Value>,
    
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl ServerSubCluster {
    pub const TABLE: &'static str = "server_sub_clusters";
    pub const KEY: &'static str = "sub_cluster_id";
}

// ===================================================================
// COMPOSITE STRUCTURES
// ===================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusterWithSubClusters {
    #[serde(flatten)]
    pub cluster: ServerCluster,
    pub sub_clusters: Vec<ServerSubCluster>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusterWithServers {
    #[serde(flatten)]
    pub cluster: ServerCluster,
    pub servers: Vec<crate::models::Server>,
}
