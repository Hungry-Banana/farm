import { 
  ServerWithAllComponents, 
  ServerInventory,
  ServerCpu,
  ServerRam,
  ServerDisk,
  ServerNic 
} from '@/types/server';

/**
 * Converts backend server data with components to the format expected by existing UI components
 */
export function convertServerToInventory(serverData: ServerWithAllComponents): ServerInventory {
  return {
    server_id: serverData.server_id.toString(),
    server_name: serverData.server_name || `Server ${serverData.server_id}`,
    
    // Convert CPUs
    cpus: serverData.cpus.map((cpu, index): ServerCpu => ({
      id: `cpu_${cpu.cpu_id}`,
      socket: cpu.socket_number,
      model: cpu.model_name || 'Unknown CPU',
      cores: cpu.num_cores || 0,
      threads: cpu.num_threads || 0,
      base_frequency_ghz: cpu.capacity_mhz ? cpu.capacity_mhz / 1000 : 0,
      max_frequency_ghz: cpu.capacity_mhz ? cpu.capacity_mhz / 1000 : undefined,
      cache_l3_mb: cpu.l3_cache_kb ? cpu.l3_cache_kb / 1024 : undefined,
    })),

    // Convert Memory
    ram: serverData.memory.map((mem): ServerRam => ({
      id: `dimm_${mem.dimm_id}`,
      slot: mem.slot,
      size_gb: mem.size_bytes ? Math.round(mem.size_bytes / (1024 * 1024 * 1024)) : 0,
      type: (mem.mem_type as 'DDR3' | 'DDR4' | 'DDR5') || 'DDR4',
      speed_mhz: mem.speed_mt_s || 0,
      manufacturer: mem.manufacturer || 'Unknown',
      part_number: mem.part_number || 'Unknown',
      serial_number: mem.serial_number,
      voltage: mem.voltage,
    })),

    // Convert Disks
    disks: serverData.disks.map((disk): ServerDisk => ({
      id: `disk_${disk.disk_id}`,
      device_name: disk.name,
      size_gb: disk.size_bytes ? Math.round(disk.size_bytes / (1024 * 1024 * 1024)) : 0,
      type: mapDiskType(disk.bus_type),
      interface: disk.bus_type || 'Unknown',
      model: disk.model || 'Unknown',
      serial_number: disk.serial || 'Unknown',
      health_status: mapHealthStatus(disk.smart_health),
      smart_status: disk.smart_health === 'healthy' ? 'passed' : 'failed',
    })),

    // Convert Network Interfaces
    nics: serverData.network_interfaces.map((nic): ServerNic => ({
      id: `nic_${nic.interface_id}`,
      interface_name: nic.name,
      mac_address: nic.mac_address || 'Unknown',
      ip_address: nic.ip_address,
      speed_mbps: nic.speed_mbps || 0,
      link_status: 'up', // Default since backend doesn't track real-time status
      vendor: nic.manufacturer || 'Unknown',
      pci_slot: nic.pci_address,
    })),

    // GPUs - placeholder since backend doesn't have GPU data yet
    gpus: [],

    // Motherboard info from motherboard detail
    motherboard: serverData.motherboard_detail ? {
      manufacturer: serverData.motherboard_detail.manufacturer || 'Unknown',
      model: serverData.motherboard_detail.product_name || serverData.product_name || 'Unknown',
      bios_version: serverData.motherboard_detail.bios_version || serverData.bios_version || 'Unknown',
      serial_number: serverData.motherboard_detail.motherboard_serial_number || serverData.motherboard_serial_number,
      version: serverData.motherboard_detail.version,
    } : {
      manufacturer: serverData.manufacturer || 'Unknown',
      model: serverData.product_name || 'Unknown', 
      bios_version: serverData.bios_version || 'Unknown',
      serial_number: serverData.motherboard_serial_number,
    },
  };
}

/**
 * Maps backend disk interface types to frontend disk types
 */
function mapDiskType(interfaceType?: string): 'SSD' | 'HDD' | 'NVMe' | 'SATA' {
  if (!interfaceType) return 'SATA';
  
  const type = interfaceType.toLowerCase();
  if (type.includes('nvme')) return 'NVMe';
  if (type.includes('ssd')) return 'SSD';
  if (type.includes('hdd')) return 'HDD';
  return 'SATA';
}

/**
 * Maps backend health status to frontend health status
 */
function mapHealthStatus(health?: string): 'healthy' | 'warning' | 'critical' {
  if (!health) return 'healthy';
  
  const status = health.toLowerCase();
  if (status === 'warning') return 'warning';
  if (status === 'critical' || status === 'failed') return 'critical';
  return 'healthy';
}

/**
 * Generates summary statistics from server component data
 */
export function getServerSummary(serverData: ServerWithAllComponents) {
  const totalCores = serverData.cpus.reduce((sum, cpu) => sum + (cpu.num_cores || 0), 0);
  const totalThreads = serverData.cpus.reduce((sum, cpu) => sum + (cpu.num_threads || 0), 0);
  const totalMemoryBytes = serverData.memory.reduce((sum, mem) => sum + (mem.size_bytes || 0), 0);
  const totalStorageBytes = serverData.disks.reduce((sum, disk) => sum + (disk.size_bytes || 0), 0);
  
  return {
    cpu: {
      total_sockets: serverData.cpus.length,
      total_cores: totalCores,
      total_threads: totalThreads,
      models: [...new Set(serverData.cpus.map(cpu => cpu.model_name).filter(Boolean))],
    },
    memory: {
      total_dimms: serverData.memory.length,
      total_capacity_gb: Math.round(totalMemoryBytes / (1024 * 1024 * 1024)),
      types: [...new Set(serverData.memory.map(mem => mem.mem_type).filter(Boolean))],
    },
    storage: {
      total_disks: serverData.disks.length,
      total_capacity_gb: Math.round(totalStorageBytes / (1024 * 1024 * 1024)),
      interfaces: [...new Set(serverData.disks.map(disk => disk.bus_type).filter(Boolean))],
    },
    network: {
      total_interfaces: serverData.network_interfaces.length,
      primary_interface: serverData.network_interfaces.find(nic => nic.is_primary),
      total_ports: serverData.network_interfaces.reduce((sum, nic) => sum + (nic.num_ports || 1), 0),
    }
  };
}

/**
 * Gets credentials by type (BMC or OS)
 */
export function getCredentialsByType(serverData: ServerWithAllComponents, type: 'BMC' | 'OS') {
  return serverData.credentials.filter(cred => cred.credential_type === type);
}

/**
 * Gets BMC credentials for server management
 */
export function getBMCCredentials(serverData: ServerWithAllComponents) {
  return getCredentialsByType(serverData, 'BMC');
}

/**
 * Gets OS credentials for server access
 */
export function getOSCredentials(serverData: ServerWithAllComponents) {
  return getCredentialsByType(serverData, 'OS');
}