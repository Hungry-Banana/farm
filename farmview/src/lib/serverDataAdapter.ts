import { 
  ServerWithAllComponents, 
  ServerInventory,
  ServerCpuDetail,
  ServerMemoryDetail,
  ServerDiskDetail,
  ServerNetworkDetail 
} from '@/types/server';

/**
 * Converts backend server data with components to the format expected by existing UI components
 */
export function convertServerToInventory(serverData: ServerWithAllComponents): ServerInventory {
  return {
    server_id: serverData.server_id.toString(),
    server_name: serverData.server_name || `Server ${serverData.server_id}`,
    
    // Convert CPUs
    cpus: serverData.cpus.map((cpu, index): ServerCpuDetail => ({
      cpu_id: cpu.cpu_id,
      socket_number: cpu.socket_number,
      slot: cpu.slot,
      manufacturer: cpu.manufacturer,
      model_name: cpu.model_name,
      num_cores: cpu.num_cores,
      num_threads: cpu.num_threads,
      capacity_mhz: cpu.capacity_mhz,
      l1_cache_kb: cpu.l1_cache_kb,
      l2_cache_kb: cpu.l2_cache_kb,
      l3_cache_kb: cpu.l3_cache_kb,
    })),

    // Convert Memory
    ram: serverData.memory.map((mem): ServerMemoryDetail => ({
      dimm_id: mem.dimm_id,
      slot: mem.slot,
      serial_number: mem.serial_number,
      manufacturer: mem.manufacturer,
      part_number: mem.part_number,
      size_bytes: mem.size_bytes,
      speed_mt_s: mem.speed_mt_s,
      mem_type: mem.mem_type,
      form_factor: mem.form_factor,
      voltage: mem.voltage,
    })),

    // Convert Disks
    disks: serverData.disks.map((disk): ServerDiskDetail => ({
      disk_id: disk.disk_id,
      name: disk.name,
      dev_path: disk.dev_path,
      serial: disk.serial,
      firmware_version: disk.firmware_version,
      smart_health: disk.smart_health,
      manufacturer: disk.manufacturer,
      model: disk.model,
      size_bytes: disk.size_bytes,
      bus_type: disk.bus_type,
      form_factor: disk.form_factor,
      rpm: disk.rpm,
    })),

    // Convert Network Interfaces
    nics: serverData.network_interfaces.map((nic): ServerNetworkDetail => ({
      interface_id: nic.interface_id,
      name: nic.name,
      mac_address: nic.mac_address,
      ip_address: nic.ip_address,
      mtu: nic.mtu,
      speed_mbps: nic.speed_mbps,
      firmware_version: nic.firmware_version,
      pci_address: nic.pci_address,
      is_primary: nic.is_primary,
      bond_group: nic.bond_group,
      bond_master: nic.bond_master,
      switch_port_id: nic.switch_port_id,
      interface_type: nic.interface_type,
      firmware_version_bmc: nic.firmware_version_bmc,
      release_date: nic.release_date,
      switch_name: nic.switch_name,
      switch_port_name: nic.switch_port_name,
      manufacturer: nic.manufacturer,
      model: nic.model,
      max_speed_mbps: nic.max_speed_mbps,
      num_ports: nic.num_ports,
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