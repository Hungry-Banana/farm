use sqlx::{FromRow};
use serde::{Serialize, Deserialize};

// Server details
#[derive(FromRow, Default, Debug, Clone, Serialize, Deserialize)]
pub struct Server {
    pub server_id: i32,
    pub agent_version: Option<String>,
    pub architecture: Option<String>,
    pub chassis_manufacturer: Option<String>,
    pub chassis_serial_number: Option<String>,
    pub cluster_id: Option<i32>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub data_center_id: Option<i32>,
    pub environment_type: Option<String>, // ENUM in DB: 'PRODUCTION', 'DEVELOPMENT', 'QA', 'STAGING', 'TESTING'
    pub last_inventory_at: Option<chrono::DateTime<chrono::Utc>>,
    pub manufacturer: Option<String>,
    pub product_name: Option<String>,
    pub rack_id: Option<i32>,
    pub rack_position_id: Option<i32>,
    pub serial_number: Option<String>,
    pub server_name: Option<String>,
    pub server_type: Option<String>, // ENUM in DB: 'BAREMETAL', 'HOST', 'STORAGE', 'COMPUTE'
    pub stage: Option<String>, // ENUM in DB: 'NONE', 'DISCOVERY', 'ALLOCATE_RESOURCES', 'INSTALL_OS', 'CONFIGURE_NETWORK', 'WIPE_DISKS', 'WIPE_NIC_CONFIG', 'RELEASE_IPS', 'FINALIZE'
    pub state: Option<String>, // ENUM in DB: 'NEW', 'ONBOARDING', 'PROVISIONING', 'RUNNING', 'SUSPENDED', 'DEPROVISIONING', 'FAILED'
    pub status: Option<String>, // ENUM in DB: 'ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RMA', 'DECOMMISSIONED'
    pub sub_cluster_id: Option<i32>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

// Server credential details
#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ServerCredential {
    pub credential_id: i32,
    pub credential_type: String, // BMC or OS
    pub username: String,
    pub password: String,
}

// Motherboard component details
#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ServerMotherboardDetail {
    // Server-specific motherboard data (from server_motherboards table)
    pub motherboard_id: i32,
    pub component_motherboard_id: i32,
    pub serial_number: Option<String>,
    pub bios_vendor: Option<String>,
    pub bios_version: Option<String>,
    pub bios_release_date: Option<chrono::NaiveDate>,
    // Component reference data (from JOIN with component_motherboard_types)
    pub manufacturer: Option<String>,
    pub product_name: Option<String>,
    pub version: Option<String>,
    pub recommended_bios_version: Option<String>,
    pub recommended_bmc_version: Option<String>,
}

// BMC interface component details
#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ServerBmcDetail {
    pub bmc_interface_id: i32,
    pub name: String,
    pub mac_address: Option<String>,
    pub ip_address: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
    pub firmware_version: Option<String>,
    pub release_date: Option<chrono::NaiveDate>,
    pub supports_ipmi: Option<bool>,
    pub supports_redfish: Option<bool>,
    pub supports_web_interface: Option<bool>,
    pub is_accessible: Option<bool>,
    pub last_ping_at: Option<chrono::DateTime<chrono::Utc>>,
    pub switch_port_id: Option<i32>,
    pub switch_id: Option<i32>,
    pub switch_name: Option<String>,
    pub switch_port_name: Option<String>,
    pub manufacturer: Option<String>,
    pub model: Option<String>,
    pub max_speed_mbps: Option<i32>,
    pub num_ports: Option<i32>,
}

// Complete server details with all components
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerWithAllComponents {
    #[serde(flatten)]
    pub server: Server,
    pub cpus: Vec<ServerCpuDetail>,
    pub memory: Vec<ServerMemoryDetail>,
    pub disks: Vec<ServerDiskDetail>,
    pub network_interfaces: Vec<ServerNetworkDetail>,
    pub gpus: Vec<ServerGpuDetail>,
    pub bmc_interfaces: Vec<ServerBmcDetail>,
    pub credentials: Vec<ServerCredential>,
    pub motherboard_detail: Option<ServerMotherboardDetail>,
}

// CPU component details
#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ServerCpuDetail {
    // Server-specific CPU data
    pub cpu_id: i32,
    pub socket_number: i32,
    pub slot: Option<String>,
    // Component reference data (from JOIN with component_cpu_types)
    pub manufacturer: Option<String>,
    pub model_name: Option<String>,
    pub num_cores: Option<i32>,
    pub num_threads: Option<i32>,
    pub capacity_mhz: Option<i32>,
    pub l1_cache_kb: Option<i32>,
    pub l2_cache_kb: Option<i32>,
    pub l3_cache_kb: Option<i32>,
}

// Memory component details
#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ServerMemoryDetail {
    // Server-specific memory data
    pub dimm_id: i32,
    pub slot: String,
    pub serial_number: Option<String>,
    // Component reference data (from JOIN with component_memory_types)
    pub manufacturer: Option<String>,
    pub part_number: Option<String>,
    pub size_bytes: Option<i64>,
    pub speed_mt_s: Option<i32>,
    pub mem_type: Option<String>,
    pub form_factor: Option<String>,
    pub voltage: Option<f64>,
}

// Disk component details
#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ServerDiskDetail {
    // Server-specific disk data
    pub disk_id: i32,
    pub name: String,
    pub dev_path: Option<String>,
    pub serial: Option<String>,
    pub firmware_version: Option<String>,
    pub smart_health: Option<String>,
    // Component reference data (from JOIN with component_disk_types)
    pub manufacturer: Option<String>,
    pub model: Option<String>,
    pub size_bytes: Option<i64>,
    pub bus_type: Option<String>,
    pub form_factor: Option<String>,
    pub rpm: Option<i32>,
}

// GPU component details
#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ServerGpuDetail {
    // Server-specific GPU data
    pub gpu_id: i32,
    pub pci_address: Option<String>,
    pub driver_version: Option<String>,
    pub uuid: Option<String>,
    // Component reference data (from JOIN with component_gpu_types)
    pub vendor: Option<String>,
    pub model: Option<String>,
    pub vram_mb: Option<i32>,
}

// Network interface component details
#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct ServerNetworkDetail {
    // Server-specific network interface data
    pub interface_id: i32,
    pub name: String,
    pub mac_address: Option<String>,
    pub ip_address: Option<String>,
    pub mtu: Option<i32>,
    pub speed_mbps: Option<i32>,
    pub firmware_version: Option<String>,
    pub pci_address: Option<String>,
    pub is_primary: Option<bool>,
    pub bond_group: Option<String>,
    pub bond_master: Option<String>,
    pub switch_port_id: Option<i32>,
    // Interface type (REGULAR, BMC, MANAGEMENT)
    pub interface_type: Option<String>,
    // BMC-specific fields
    pub firmware_version_bmc: Option<String>,
    pub release_date: Option<chrono::NaiveDate>,
    // Switch connection data (from JOIN with switch_ports and switches)
    pub switch_id: Option<i32>,
    pub switch_name: Option<String>,
    pub switch_port_name: Option<String>,
    // Component reference data (from JOIN with component_network_types)
    pub manufacturer: Option<String>,
    pub model: Option<String>,
    pub max_speed_mbps: Option<i32>,
    pub num_ports: Option<i32>,
}

impl Server {
    pub const TABLE: &'static str = "servers";
    pub const KEY: &'static str = "server_id";
}