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
  state?: string;
  stage?: string;
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
  form_factor?: string | null;
  voltage?: number | null;
}

export interface ServerDiskDetail {
  disk_id: number;
  name: string;
  dev_path?: string;
  serial?: string;
  firmware_version?: string | null;
  smart_health?: string;
  manufacturer?: string;
  model?: string;
  size_bytes?: number;
  bus_type?: string;
  form_factor?: string | null;
  rpm?: number | null;
}

// UI-transformed types for display components
export interface ServerCpuUI {
  cpu_inventory_id: number;
  manufacturer?: string;
  socket: number;
  model?: string;
  cores?: number;
  threads?: number;
  base_frequency_ghz: number;
  cache_l3_mb: number;
}

export interface ServerMemoryUI {
  ram_inventory_id: number;
  slot: string;
  manufacturer?: string;
  size_gb: number;
  speed_mhz?: number;
  type?: string;
  voltage?: number | string;
  part_number?: string;
  serial_number?: string;
}

export interface ServerDiskUI {
  storage_inventory_id: number;
  device_name: string;
  dev_path?: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  firmware_version?: string | null;
  size_gb: number;
  type?: string | null;
  interface?: string;
  health_status?: string;
  rpm?: number | null;
}

export interface ServerNetworkDetail {
  interface_id: number;
  name: string;
  mac_address?: string;
  ip_address?: string | null;
  mtu?: number | null;
  speed_mbps?: number;
  firmware_version?: string | null;
  pci_address?: string | null;
  is_primary?: boolean;
  bond_group?: string | null;
  bond_master?: string | null;
  switch_port_id?: number | null;
  interface_type?: string;
  firmware_version_bmc?: string | null;
  release_date?: string | null;
  switch_id?: number | null;
  switch_name?: string | null;
  switch_port_name?: string | null;
  manufacturer?: string;
  model?: string;
  max_speed_mbps?: number | null;
  num_ports?: number | null;
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
  release_date?: string | null;
  supports_ipmi?: boolean;
  supports_redfish?: boolean;
  supports_web_interface?: boolean;
  is_accessible?: boolean;
  last_ping_at?: string | null;
  switch_port_id?: number | null;
  switch_id?: number | null;
  switch_name?: string | null;
  switch_port_name?: string | null;
  manufacturer?: string;
  model?: string;
  max_speed_mbps?: number | null;
  num_ports?: number | null;
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
  disks: ServerDiskUI[];
  gpus: ServerGpuDetail[];
  nics: ServerNetworkDetail[];
  cpus: ServerCpuUI[];
  ram: ServerMemoryUI[];
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