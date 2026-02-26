use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Serialize)]
pub struct Inventory {
    pub agent_version: String,
    pub node: NodeInfo,
    pub cpu: CpuInfo,
    pub memory: MemoryInfo,
    pub disks: Vec<DiskInfo>,
    pub network: NetworkInfo,
    pub gpus: Vec<GpuInfo>,
    pub power_supplies: Vec<PowerSupplyInfo>,
}

#[derive(Debug, Serialize)]
pub struct NodeInfo {
    pub hostname: String,
    pub architecture: String,
    pub product_name: Option<String>,
    pub manufacturer: Option<String>,
    pub serial_number: Option<String>,
    pub chassis_manufacturer: Option<String>,
    pub chassis_serial_number: Option<String>,
    pub motherboard: Option<MotherboardInfo>,
    pub bios: Option<BiosInfo>,
    pub bmc: Option<BmcInfo>,
}

#[derive(Debug, Serialize)]
pub struct MotherboardInfo {
    pub manufacturer: Option<String>,
    pub product_name: Option<String>,
    pub version: Option<String>,
    pub serial_number: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct BiosInfo {
    pub vendor: Option<String>,
    pub version: Option<String>,
    pub release_date: Option<String>,
}


#[derive(Debug, Serialize)]
pub struct BmcInfo {
    pub ip_address: Option<String>,
    pub mac_address: Option<String>,
    pub firmware_version: Option<String>,
    pub release_date: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct CpuInfo {
    pub sockets: Option<u32>,
    pub cores: Option<u32>,
    pub threads: Option<u32>,
    pub cpus: Vec<CpuSocket>,
}

#[derive(Debug, Serialize)]
pub struct CpuSocket {
    pub socket: u32,
    pub manufacturer: Option<String>,
    pub model_name: Option<String>,
    pub num_cores: Option<u32>,
    pub num_threads: Option<u32>,
    pub capacity_mhz: Option<u32>,
    pub slot: Option<String>,
    pub l1_cache_kb: Option<u32>,
    pub l2_cache_kb: Option<u32>,
    pub l3_cache_kb: Option<u32>,
}

#[derive(Debug, Serialize)]
pub struct MemoryInfo {
    pub total_bytes: Option<u64>,
    pub dimms: Vec<DimmInfo>,
}

#[derive(Debug, Serialize)]
pub struct DimmInfo {
    pub slot: Option<String>,
    pub size_bytes: Option<u64>,
    pub mem_type: Option<String>,
    pub speed_mt_s: Option<u32>,
    pub manufacturer: Option<String>,
    pub serial_number: Option<String>,
    pub part_number: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct DiskInfo {
    pub name: String,
    pub dev_path: String,
    pub model: Option<String>,
    pub serial: Option<String>,
    pub size_bytes: Option<u64>,
    pub rotational: Option<bool>,
    pub bus_type: Option<String>, // "nvme", "scsi", "virtio", etc.
    pub firmware_version: Option<String>,
    pub smart: Option<SmartInfo>,
}

#[derive(Debug, Serialize)]
pub struct SmartInfo {
    pub health: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct NetworkInfo {
    pub interfaces: Vec<NetInterface>,
    pub routes: Vec<RouteInfo>,
}

#[derive(Debug, Serialize)]
pub struct NetInterface {
    pub name: String,
    pub mac_address: Option<String>,
    pub mtu: Option<u32>,
    pub speed_mbps: Option<u32>,
    pub driver: Option<String>,
    pub firmware_version: Option<String>,
    pub vendor_name: Option<String>,
    pub device_name: Option<String>,
    pub pci_address: Option<String>,
    pub addresses: Vec<IpAddress>,
    
    // Bond/Team configuration
    pub is_primary: bool,
    pub bond_group: Option<String>,
    pub bond_master: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
pub struct IpAddress {
    pub family: String, // "IPv4" or "IPv6"
    pub address: String,
    pub prefix: u8,
}

#[derive(Debug, Serialize)]
pub struct RouteInfo {
    pub dst: String,     // CIDR
    pub gateway: String, // IP
    pub iface: String,
}

#[derive(Debug, Serialize)]
pub struct GpuInfo {
    pub vendor: Option<String>,
    pub model: Option<String>,
    pub pci_address: Option<String>,
    pub vram_mb: Option<u32>,
    pub driver_version: Option<String>,
    pub uuid: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct Timestamps {
    pub collected_at: String,
    pub agent_version: String,
}

#[derive(Debug, Serialize)]
pub struct PowerSupplyInfo {
    pub name: Option<String>,
    pub manufacturer: Option<String>,
    pub model: Option<String>,
    pub serial_number: Option<String>,
    pub part_number: Option<String>,
    pub max_power_watts: Option<u32>,
    pub efficiency_rating: Option<String>, // "80 Plus Gold", "80 Plus Platinum", etc.
    pub status: Option<String>, // "OK", "Critical", "Non-critical", etc.
    pub input_voltage: Option<f32>,
    pub input_current: Option<f32>,
    pub output_voltage: Option<f32>,
    pub output_current: Option<f32>,
    pub temperature_c: Option<i32>,
    pub fan_speed_rpm: Option<u32>,
}

#[derive(Debug, Serialize)]
pub struct RawBlobs {
    pub lshw: Option<serde_json::Value>,
    pub lsblk: Option<serde_json::Value>,
    pub lspci: Option<serde_json::Value>,
    pub dmidecode: Option<serde_json::Value>,
    pub extra: HashMap<String, serde_json::Value>,
}
