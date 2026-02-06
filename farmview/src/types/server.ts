export interface Server {
  server_id: number;
  server_name?: string;
  architecture?: string;
  product_name?: string;
  manufacturer?: string;
  serial_number?: string;
  chassis_manufacturer?: string;
  chassis_serial_number?: string;
  component_motherboard_id?: number;
  motherboard_serial_number?: string;
  bios_vendor?: string;
  bios_version?: string;
  bios_release_date?: string;
  bmc_ip_address?: string;
  bmc_mac_address?: string;
  bmc_firmware_version?: string;
  bmc_release_date?: string;
  server_type?: string;
  status?: string;
  environment_type?: string;
  cluster_id?: number;
  sub_cluster_id?: number;
  data_center_id?: number;
  rack_id?: number;
  rack_position_id?: number;
  last_inventory_at?: string;
  agent_version?: string;
  created_at?: string;
  updated_at?: string;
  notes?: string;
}

export interface ServerCpuDetail {
  cpu_id: number;
  socket_number: number;
  slot?: string;
  manufacturer?: string;
  model_name?: string;
  num_cores?: number;
  num_threads?: number;
  capacity_mhz?: number;
  l1_cache_kb?: number;
  l2_cache_kb?: number;
  l3_cache_kb?: number;
}

export interface ServerMemoryDetail {
  dimm_id: number;
  slot: string;
  serial_number?: string;
  manufacturer?: string;
  part_number?: string;
  size_bytes?: number;
  speed_mt_s?: number;
  mem_type?: string;
  form_factor?: string;
  voltage?: number;
}

export interface ServerDiskDetail {
  disk_id: number;
  name: string;
  dev_path?: string;
  serial?: string;
  firmware_version?: string;
  smart_health?: string;
  manufacturer?: string;
  model?: string;
  size_bytes?: number;
  bus_type?: string;
  form_factor?: string;
  rpm?: number;
}

export interface ServerNetworkDetail {
  interface_id: number;
  name: string;
  mac_address?: string;
  ip_address?: string;
  mtu?: number;
  speed_mbps?: number;
  firmware_version?: string;
  pci_address?: string;
  is_primary?: boolean;
  bond_group?: string;
  bond_master?: string;
  switch_port_id?: number;
  interface_type?: string;
  firmware_version_bmc?: string;
  release_date?: string;
  switch_name?: string;
  switch_port_name?: string;
  manufacturer?: string;
  model?: string;
  max_speed_mbps?: number;
  num_ports?: number;
}

export interface ServerCredential {
  credential_id: number;
  credential_type: string;
  username: string;
  password: string;
}

export interface ServerMotherboardDetail {
  component_motherboard_id?: number;
  motherboard_serial_number?: string;
  bios_vendor?: string;
  bios_version?: string;
  bios_release_date?: string;
  manufacturer?: string;
  product_name?: string;
  version?: string;
  recommended_bios_version?: string;
  recommended_bmc_version?: string;
}

export interface ServerBMCDetail {
  bmc_interface_id: number;
  name: string;
  mac_address?: string;
  ip_address?: string;
  username?: string;
  password?: string;
  firmware_version?: string;
  release_date?: string;
  supports_ipmi?: boolean;
  supports_redfish?: boolean;
  supports_web_interface?: boolean;
  is_accessible?: boolean;
  last_ping_at?: string;
  switch_port_id?: number;
  switch_name?: string;
  switch_port_name?: string;
  manufacturer?: string;
  model?: string;
  max_speed_mbps?: number;
  num_ports?: number;
}

export interface ServerGpuDetail {
  id: string;
  name: string;
  vendor: 'NVIDIA' | 'AMD' | 'Intel';
  memory_gb: number;
  pci_slot: string;
  driver_version?: string;
  temperature?: number;
  power_usage?: number;
  utilization?: number;
}

export interface ServerInventory {
  server_id: string;
  server_name: string;
  disks: ServerDiskDetail[];
  gpus: ServerGpuDetail[];
  nics: ServerNetworkDetail[];
  cpus: ServerCpuDetail[];
  ram: ServerMemoryDetail[];
  motherboard?: {
    manufacturer: string;
    model: string; // This represents product_name from component_motherboard_types
    bios_version: string;
    serial_number?: string;
    version?: string; // Added to match component_motherboard_types.version
  };
  power_supplies?: {
    id: string;
    wattage: number;
    efficiency_rating?: string;
    status: 'active' | 'standby' | 'failed';
  }[];
}

// Complete server with all components from backend
export interface ServerWithAllComponents extends Server {
  cpus: ServerCpuDetail[];
  memory: ServerMemoryDetail[];
  disks: ServerDiskDetail[];
  network_interfaces: ServerNetworkDetail[];
  bmc_interfaces: ServerBMCDetail[];
  credentials: ServerCredential[];
  motherboard_detail?: ServerMotherboardDetail;
}