use sqlx::FromRow;
use serde::{Serialize, Deserialize};

#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ComponentCpuType {
    pub component_cpu_id: i32,
    pub manufacturer: String,
    pub model_name: String,
    pub num_cores: Option<i32>,
    pub num_threads: Option<i32>,
    pub capacity_mhz: Option<i32>,
    pub l1_cache_kb: Option<i32>,
    pub l2_cache_kb: Option<i32>,
    pub l3_cache_kb: Option<i32>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ComponentMemoryType {
    pub component_memory_id: i32,
    pub manufacturer: String,
    pub part_number: String,
    pub size_bytes: i64,
    pub mem_type: String,
    pub speed_mt_s: Option<i32>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ComponentMotherboardType {
    pub component_motherboard_id: i32,
    pub manufacturer: String,
    pub product_name: String,
    pub version: Option<String>,
    pub bios_version: Option<String>,
    pub bmc_firmware_version: Option<String>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ComponentDiskType {
    pub component_disk_id: i32,
    pub manufacturer: Option<String>,
    pub model: String,
    pub size_bytes: Option<i64>,
    pub rotational: Option<bool>,
    pub bus_type: Option<String>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ComponentNetworkType {
    pub component_network_id: i32,
    pub vendor_name: Option<String>,
    pub device_name: String,
    pub driver: Option<String>,
    pub max_speed_mbps: Option<i32>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ComponentGpuType {
    pub component_gpu_id: i32,
    pub vendor: String,
    pub model: String,
    pub vram_mb: Option<i32>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ComponentBmcType {
    pub component_bmc_id: i32,
    pub vendor: String,
    pub model: String,
    pub firmware_version: Option<String>,
    pub supports_ipmi: Option<bool>,
    pub supports_redfish: Option<bool>,
    pub supports_web_interface: Option<bool>,
    pub supports_kvm: Option<bool>,
    pub supports_virtual_media: Option<bool>,
    pub has_dedicated_port: Option<bool>,
    pub max_speed_mbps: Option<i32>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}

// ===================================================================
// COMPONENT CATALOG/MANAGEMENT STRUCTS
// ===================================================================

/// For component catalog/inventory management endpoints
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentCatalog {
    pub cpus: Vec<ComponentCpuType>,
    pub memory: Vec<ComponentMemoryType>,
    pub disks: Vec<ComponentDiskType>,
    pub network_interfaces: Vec<ComponentNetworkType>,
    pub gpus: Vec<ComponentGpuType>,
    pub motherboards: Vec<ComponentMotherboardType>,
    pub bmcs: Vec<ComponentBmcType>,
}

/// Summary stats for component catalog
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentCatalogStats {
    pub total_cpu_types: i32,
    pub total_memory_types: i32,
    pub total_disk_types: i32,
    pub total_network_types: i32,
    pub total_gpu_types: i32,
    pub total_motherboard_types: i32,
    pub total_bmc_types: i32,
}