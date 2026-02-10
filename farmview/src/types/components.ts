// Component type definitions

export interface ComponentCpuType {
  component_cpu_id: number;
  manufacturer: string;
  model_name: string;
  num_cores?: number;
  num_threads?: number;
  capacity_mhz?: number;
  l1_cache_kb?: number;
  l2_cache_kb?: number;
  l3_cache_kb?: number;
  created_at?: string;
}

export interface ComponentMemoryType {
  component_memory_id: number;
  manufacturer: string;
  part_number: string;
  size_bytes: number;
  mem_type: string;
  speed_mt_s?: number;
  created_at?: string;
}

export interface ComponentMotherboardType {
  component_motherboard_id: number;
  manufacturer: string;
  product_name: string;
  version?: string;
  bios_version?: string;
  bmc_firmware_version?: string;
  created_at?: string;
}

export interface ComponentDiskType {
  component_disk_id: number;
  manufacturer?: string;
  model: string;
  size_bytes?: number;
  rotational?: boolean;
  bus_type?: string;
  created_at?: string;
}

export interface ComponentNetworkType {
  component_network_id: number;
  vendor_name?: string;
  device_name: string;
  driver?: string;
  max_speed_mbps?: number;
  created_at?: string;
}

export interface ComponentGpuType {
  component_gpu_id: number;
  vendor: string;
  model: string;
  vram_mb?: number;
  created_at?: string;
}

export interface ComponentBmcType {
  component_bmc_id: number;
  vendor: string;
  model: string;
  firmware_version?: string;
  supports_ipmi?: boolean;
  supports_redfish?: boolean;
  supports_web_interface?: boolean;
  supports_kvm?: boolean;
  supports_virtual_media?: boolean;
  has_dedicated_port?: boolean;
  max_speed_mbps?: number;
  created_at?: string;
}

export interface ComponentCatalog {
  cpus: ComponentCpuType[];
  memory: ComponentMemoryType[];
  disks: ComponentDiskType[];
  network_interfaces: ComponentNetworkType[];
  gpus: ComponentGpuType[];
  motherboards: ComponentMotherboardType[];
  bmcs: ComponentBmcType[];
}

export interface ComponentCatalogStats {
  total_cpu_types: number;
  total_memory_types: number;
  total_disk_types: number;
  total_network_types: number;
  total_gpu_types: number;
  total_motherboard_types: number;
  total_bmc_types: number;
}