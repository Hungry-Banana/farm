use sqlx::FromRow;
use serde::{Serialize, Deserialize};

// Virtual Machine details
#[derive(FromRow, Default, Debug, Clone, Serialize, Deserialize)]
pub struct VirtualMachine {
    pub vm_id: i32,
    pub server_id: i32,
    pub vm_name: String,
    pub vm_uuid: Option<String>,
    pub description: Option<String>,
    pub hypervisor_type: Option<String>, // ENUM: 'KVM', 'VMware', 'VirtualBox', 'Hyper-V', 'Xen', 'QEMU'
    pub guest_os_family: Option<String>,
    pub guest_os_version: Option<String>,
    pub guest_os_architecture: Option<String>,
    pub vcpu_count: Option<i32>,
    pub memory_mb: Option<i32>,
    pub storage_gb: Option<i32>,
    pub vm_state: Option<String>, // ENUM: 'running', 'stopped', 'paused', 'suspended', 'crashed', 'unknown'
    pub vm_status: Option<String>, // ENUM: 'active', 'inactive', 'maintenance', 'migrating', 'backup', 'error'
    pub config_file_path: Option<String>,
    pub boot_order: Option<String>,
    pub enable_vnc: Option<bool>,
    pub vnc_port: Option<i32>,
    pub enable_spice: Option<bool>,
    pub spice_port: Option<i32>,
    pub enable_ssh: Option<bool>,
    pub ssh_port: Option<i32>,
    pub cpu_limit_percent: Option<i32>,
    pub memory_balloon: Option<bool>,
    pub io_priority: Option<String>, // ENUM: 'low', 'normal', 'high'
    pub auto_backup_enabled: Option<bool>,
    pub backup_retention_days: Option<i32>,
    pub last_backup_at: Option<chrono::DateTime<chrono::Utc>>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
    pub started_at: Option<chrono::DateTime<chrono::Utc>>,
    pub stopped_at: Option<chrono::DateTime<chrono::Utc>>,
    pub created_by: Option<String>,
    pub managed_by: Option<String>,
}

// VM Disk details
#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct VmDisk {
    pub vm_disk_id: i32,
    pub vm_id: i32,
    pub disk_name: String,
    pub disk_uuid: Option<String>,
    pub description: Option<String>,
    pub disk_type: Option<String>, // ENUM: 'ide', 'scsi', 'virtio', 'sata', 'nvme'
    pub disk_format: Option<String>, // ENUM: 'raw', 'qcow2', 'vmdk', 'vhd', 'vhdx', 'vdi'
    pub disk_size_gb: Option<i32>,
    pub disk_path: Option<String>,
    pub storage_pool: Option<String>,
    pub storage_type: Option<String>, // ENUM: 'file', 'block', 'lvm', 'iscsi', 'ceph', 'rbd', 'nfs', 'zfs', 'glusterfs'
    pub cache_mode: Option<String>, // ENUM: 'none', 'writethrough', 'writeback', 'directsync', 'unsafe'
    pub io_mode: Option<String>, // ENUM: 'native', 'threads', 'io_uring'
    pub is_bootable: Option<bool>,
    pub boot_order: Option<i32>,
    pub read_only: Option<bool>,
    pub shareable: Option<bool>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

// VM Network Interface details
#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct VmNetworkInterface {
    pub vm_nic_id: i32,
    pub vm_id: i32,
    pub nic_name: String,
    pub mac_address: Option<String>,
    pub network_type: Option<String>, // ENUM: 'bridge', 'nat', 'host', 'macvtap', 'ovs', 'direct', 'isolated'
    pub bridge_name: Option<String>,
    pub network_name: Option<String>,
    pub model: Option<String>, // ENUM: 'virtio', 'e1000', 'rtl8139', 'vmxnet3'
    pub mtu: Option<i32>,
    pub vlan_id: Option<i32>,
    pub link_state: Option<String>, // ENUM: 'up', 'down'
    pub bandwidth_limit_mbps: Option<i32>,
    pub ip_address: Option<String>,
    pub netmask: Option<String>,
    pub gateway: Option<String>,
    pub dns_servers: Option<String>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

// VM Snapshot details
#[derive(FromRow, Debug, Clone, Serialize, Deserialize)]
pub struct VmSnapshot {
    pub snapshot_id: i32,
    pub vm_id: i32,
    pub snapshot_name: String,
    pub snapshot_uuid: Option<String>,
    pub description: Option<String>,
    pub snapshot_type: Option<String>, // ENUM: 'disk', 'memory', 'live', 'offline'
    pub parent_snapshot_id: Option<i32>,
    pub snapshot_state: Option<String>, // ENUM: 'creating', 'active', 'failed', 'deleted'
    pub snapshot_size_gb: Option<i32>,
    pub snapshot_path: Option<String>,
    pub is_current: Option<bool>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub created_by: Option<String>,
}

// Complete VM details with all components
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VmWithAllComponents {
    #[serde(flatten)]
    pub vm: VirtualMachine,
    pub disks: Vec<VmDisk>,
    pub network_interfaces: Vec<VmNetworkInterface>,
    pub snapshots: Vec<VmSnapshot>,
}

impl VirtualMachine {
    pub const TABLE: &'static str = "virtual_machines";
}
