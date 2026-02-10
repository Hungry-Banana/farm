"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import { TabContainer, TabDefinition } from "@/components/ui/tab/TabContainer";
import TableSection from "@/components/ui/table/TableSection";
import { getComponentCatalog } from "@/lib/components";
import { ComponentCatalog, ComponentMotherboardType, ComponentCpuType, ComponentMemoryType, ComponentGpuType, ComponentDiskType, ComponentNetworkType, ComponentBmcType } from "@/types/components";

// Unique motherboard models component
const MotherboardModelsTab = ({ motherboards = [] }: { motherboards?: ComponentMotherboardType[] }) => {
  const totalMotherboards = motherboards.length;
  const manufacturers = [...new Set(motherboards.map(mb => mb.manufacturer))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Motherboard Models</h3>
        <div className="text-sm flex items-center gap-2">
          <span className="text-blue-600 font-semibold">{totalMotherboards} models</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-green-600 font-semibold">{manufacturers.length} manufacturers</span>
        </div>
      </div>

      {motherboards.length > 0 ? (
        <TableSection
          columns={[
            { key: 'product_name', label: 'Model' },
            { key: 'manufacturer', label: 'Manufacturer' },
            { 
              key: 'version', 
              label: 'Version',
              render: (value) => value || 'N/A'
            },
            { 
              key: 'bios_version', 
              label: 'BIOS Version',
              render: (value) => value || 'N/A'
            },
            { 
              key: 'bmc_firmware_version', 
              label: 'BMC Firmware',
              render: (value) => value || 'N/A'
            },
            { 
              key: 'created_at', 
              label: 'Created At',
              render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
            }
          ]}
          data={motherboards}
          keyField="component_motherboard_id"
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">🖥️</div>
          <p>No motherboard data available in current inventory</p>
        </div>
      )}
    </div>
  );
};

// Unique CPU models component
const CPUModelsTab = ({ cpus = [] }: { cpus?: ComponentCpuType[] }) => {
  const getVendorColor = (vendor: string) => {
    switch (vendor.toLowerCase()) {
      case 'intel': return 'text-blue-500 bg-blue-500/10 border-blue-500/10';
      case 'amd': return 'text-red-500 bg-red-500/10 border-red-500/10';
      case 'arm': return 'text-green-500 bg-green-500/10 border-green-500/10';
      case 'apple': return 'text-gray-500 bg-gray-500/10 border-gray-500/10';
      default: return 'text-purple-600 bg-purple-100 border-purple-200';
    }
  };

  const totalCpuCount = cpus.length;
  const manufacturers = [...new Set(cpus.map(cpu => cpu.manufacturer))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">CPU Models</h3>
        <div className="text-sm flex items-center gap-2">
          <span className="text-blue-600 font-semibold">{totalCpuCount} models</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-green-600 font-semibold">{manufacturers.length} manufacturers</span>
        </div>
      </div>

      {cpus.length > 0 ? (
        <TableSection
          columns={[
            { key: 'model_name', label: 'Model' },
            { 
              key: 'manufacturer', 
              label: 'Manufacturer',
              render: (value) => (
                <span className={`inline-flex items-center px-2 rounded-theme text-sm border ${getVendorColor(value)}`}>
                  {value}
                </span>
              )
            },
            { 
              key: 'num_cores', 
              label: 'Cores/Threads',
              render: (value, item) => `${value || 'N/A'}C/${item.num_threads || 'N/A'}T`
            },
            { 
              key: 'capacity_mhz', 
              label: 'Frequency',
              render: (value) => value ? `${value} MHz` : 'N/A'
            },
            { 
              key: 'l3_cache_kb', 
              label: 'L3 Cache',
              render: (value) => value ? `${Math.round(value / 1024)} MB` : 'N/A'
            },
            { 
              key: 'created_at', 
              label: 'Created At',
              render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
            }
          ]}
          data={cpus}
          keyField="component_cpu_id"
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">🔥</div>
          <p>No CPU data available in current inventory</p>
        </div>
      )}
    </div>
  );
};

// Unique RAM models component
const RAMModelsTab = ({ memory = [] }: { memory?: ComponentMemoryType[] }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DDR5': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'DDR4': return 'text-green-500 bg-green-500/10 border-green-200/10';
      case 'DDR3': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const totalMemoryCount = memory.length;
  const totalCapacity = memory.reduce((sum, mem) => sum + (mem.size_bytes / (1024 * 1024 * 1024)), 0); // Convert bytes to GB
  const memoryTypes = [...new Set(memory.map(mem => mem.mem_type))];
  const manufacturers = [...new Set(memory.map(mem => mem.manufacturer))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Memory Models</h3>
        <div className="text-sm flex items-center gap-2">
          <span className="text-blue-600 font-semibold">{totalMemoryCount} models</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-purple-600 font-semibold">{Math.round(totalCapacity)} GB total</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-orange-600 font-semibold">Types: {memoryTypes.join(', ')}</span>
        </div>
      </div>

      {memory.length > 0 ? (
        <TableSection
          columns={[
            { key: 'part_number', label: 'Model' },
            { key: 'manufacturer', label: 'Manufacturer' },
            { 
              key: 'mem_type', 
              label: 'Type',
              render: (value) => (
                <span className={`inline-flex items-center px-2 rounded-theme text-sm font-medium border ${getTypeColor(value)}`}>
                  {value}
                </span>
              )
            },
            { 
              key: 'size_bytes', 
              label: 'Capacity',
              render: (value) => `${Math.round(value / (1024 * 1024 * 1024))} GB`
            },
            { 
              key: 'speed_mt_s', 
              label: 'Speed',
              render: (value) => value ? `${value} MT/s` : 'N/A'
            },
            { 
              key: 'created_at', 
              label: 'Created At',
              render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
            }
          ]}
          data={memory}
          keyField="component_memory_id"
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">💾</div>
          <p>No memory data available in current inventory</p>
        </div>
      )}
    </div>
  );
};

// Unique GPU models component
const GPUModelsTab = ({ gpus = [] }: { gpus?: ComponentGpuType[] }) => {
  const getVendorColor = (vendor: string) => {
    switch (vendor.toLowerCase()) {
      case 'nvidia': return 'text-green-500 bg-green-500/10 border-green-500/10';
      case 'amd': return 'text-red-500 bg-red-500/10 border-red-500/10';
      case 'intel': return 'text-blue-500 bg-blue-500/10 border-blue-500/10';
      default: return 'text-purple-600 bg-purple-100 border-purple-200';
    }
  };

  const totalGpuCount = gpus.length;
  const totalVram = gpus.reduce((sum, gpu) => sum + (gpu.vram_mb || 0), 0);
  const vendors = [...new Set(gpus.map(gpu => gpu.vendor))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">GPU Models</h3>
        <div className="text-sm flex items-center gap-2">
          <span className="text-blue-600 font-semibold">{totalGpuCount} models</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-purple-600 font-semibold">{Math.round(totalVram / 1024)} GB VRAM</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-orange-600 font-semibold">Vendors: {vendors.join(', ')}</span>
        </div>
      </div>

      {gpus.length > 0 ? (
        <TableSection
          columns={[
            { key: 'model', label: 'Model' },
            { 
              key: 'vendor', 
              label: 'Vendor',
              render: (value) => (
                <span className={`inline-flex items-center px-2 rounded-theme text-sm font-medium border ${getVendorColor(value)}`}>
                  {value}
                </span>
              )
            },
            { 
              key: 'vram_mb', 
              label: 'VRAM',
              render: (value) => value ? `${value} MB` : 'N/A'
            },
            { 
              key: 'created_at', 
              label: 'Created At',
              render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
            }
          ]}
          data={gpus}
          keyField="component_gpu_id"
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">🎮</div>
          <p>No GPU data available in current inventory</p>
        </div>
      )}
    </div>
  );
};

// Unique Disk models component
const DiskModelsTab = ({ disks = [] }: { disks?: ComponentDiskType[] }) => {
  const getTypeColor = (rotational?: boolean) => {
    if (rotational === false) return 'text-blue-500 bg-blue-500/10 border-blue-500/10'; // SSD/NVMe
    if (rotational === true) return 'text-orange-500 bg-orange-500/10 border-orange-500/10'; // HDD
    return 'text-gray-600 bg-gray-100 border-gray-200'; // Unknown
  };

  const getTypeLabel = (rotational?: boolean) => {
    if (rotational === false) return 'SSD/NVMe';
    if (rotational === true) return 'HDD';
    return 'Unknown';
  };

  const totalDiskCount = disks.length;
  const totalCapacity = disks.reduce((sum, disk) => sum + (disk.size_bytes || 0), 0);
  const busTypes = [...new Set(disks.filter(d => d.bus_type).map(disk => disk.bus_type))];
  const manufacturers = [...new Set(disks.filter(d => d.manufacturer).map(disk => disk.manufacturer))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Disk Models</h3>
        <div className="text-sm flex items-center gap-2">
          <span className="text-blue-600 font-semibold">{totalDiskCount} models</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-purple-600 font-semibold">{Math.round(totalCapacity / (1024 ** 4))} TB total</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-orange-600 font-semibold">Bus Types: {busTypes.join(', ')}</span>
        </div>
      </div>

      {disks.length > 0 ? (
        <TableSection
          columns={[
            { key: 'model', label: 'Model' },
            { 
              key: 'manufacturer', 
              label: 'Manufacturer',
              render: (value) => value || 'Unknown'
            },
            { 
              key: 'rotational', 
              label: 'Type',
              render: (value) => (
                <span className={`inline-flex items-center px-2 rounded-theme text-sm font-medium border ${getTypeColor(value)}`}>
                  {getTypeLabel(value)}
                </span>
              )
            },
            { 
              key: 'size_bytes', 
              label: 'Capacity',
              render: (value) => value ? 
                (value > (1024 ** 4) ? 
                  `${(value / (1024 ** 4)).toFixed(1)} TB` : 
                  `${Math.round(value / (1024 ** 3))} GB`) 
                : 'N/A'
            },
            { 
              key: 'bus_type', 
              label: 'Bus Type',
              render: (value) => value || 'N/A'
            },
            { 
              key: 'created_at', 
              label: 'Created At',
              render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
            }
          ]}
          data={disks}
          keyField="component_disk_id"
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">💾</div>
          <p>No disk data available in current inventory</p>
        </div>
      )}
    </div>
  );
};

// Network Interfaces component
const NetworkModelsTab = ({ networkInterfaces = [] }: { networkInterfaces?: ComponentNetworkType[] }) => {
  const totalNetworkCount = networkInterfaces.length;
  const vendors = [...new Set(networkInterfaces.filter(nic => nic.vendor_name).map(nic => nic.vendor_name))];
  const drivers = [...new Set(networkInterfaces.filter(nic => nic.driver).map(nic => nic.driver))];

  const getSpeedColor = (speed?: number) => {
    if (!speed) return 'text-gray-500 bg-gray-500/10 border-gray-500/10'; // Unknown speed
    if (speed >= 10000) return 'text-purple-500 bg-purple-500/10 border-purple-500/10'; // 10Gbps+
    if (speed >= 1000) return 'text-green-500 bg-green-500/10 border-green-500/10'; // 1Gbps
    return 'text-orange-500 bg-orange-500/10 border-orange-500/10'; // Lower speed
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Network Interface Models</h3>
        <div className="text-sm flex items-center gap-2">
          <span className="text-blue-600 font-semibold">{totalNetworkCount} models</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-green-600 font-semibold">{vendors.length} vendors</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-orange-600 font-semibold">{drivers.length} drivers</span>
        </div>
      </div>

      {networkInterfaces.length > 0 ? (
        <TableSection
          columns={[
            { key: 'device_name', label: 'Device' },
            { 
              key: 'vendor_name', 
              label: 'Vendor',
              render: (value) => value || 'Unknown'
            },
            { 
              key: 'driver', 
              label: 'Driver',
              className: 'font-mono',
              render: (value) => value || 'N/A'
            },
            { 
              key: 'max_speed_mbps', 
              label: 'Max Speed',
              render: (value) => (
                <span className={`inline-flex items-center px-2 rounded-theme text-sm font-bold border ${getSpeedColor(value)}`}>
                  {value ? 
                    (value >= 1000 ? 
                      `${value / 1000} Gbps` : 
                      `${value} Mbps`) 
                    : 'Unknown'}
                </span>
              )
            },
            { 
              key: 'created_at', 
              label: 'Created At',
              render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
            }
          ]}
          data={networkInterfaces}
          keyField="component_network_id"
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">🔌</div>
          <p>No network interface data available in current inventory</p>
        </div>
      )}
    </div>
  );
};

// BMC Models Tab
const BMCModelsTab = ({ bmcs = [] }: { bmcs?: ComponentBmcType[] }) => {
  const getCapabilityBadge = (supports: boolean | undefined, label: string) => {
    if (supports === undefined) return null;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-theme text-xs font-medium border ${
        supports 
          ? 'text-green-600 bg-green-500/10 border-green-500/20' 
          : 'text-gray-500 bg-gray-500/10 border-gray-500/20'
      }`}>
        {supports ? '✓' : '✗'} {label}
      </span>
    );
  };

  const totalBmcCount = bmcs.length;
  const vendors = [...new Set(bmcs.map(bmc => bmc.vendor))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">BMC Models</h3>
        <div className="text-sm flex items-center gap-2">
          <span className="text-blue-600 font-semibold">{totalBmcCount} models</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-green-600 font-semibold">{vendors.length} vendors</span>
        </div>
      </div>

      {bmcs.length > 0 ? (
        <TableSection
          columns={[
            { key: 'model', label: 'Model' },
            { key: 'vendor', label: 'Vendor' },
            { 
              key: 'firmware_version', 
              label: 'Firmware',
              render: (value) => value || 'N/A'
            },
            { 
              key: 'supports_ipmi', 
              label: 'IPMI',
              render: (value) => getCapabilityBadge(value, 'IPMI')
            },
            { 
              key: 'supports_redfish', 
              label: 'Redfish',
              render: (value) => getCapabilityBadge(value, 'Redfish')
            },
            { 
              key: 'supports_kvm', 
              label: 'KVM',
              render: (value) => getCapabilityBadge(value, 'KVM')
            },
            { 
              key: 'supports_virtual_media', 
              label: 'Virtual Media',
              render: (value) => getCapabilityBadge(value, 'VM')
            },
            { 
              key: 'max_speed_mbps', 
              label: 'Max Speed',
              render: (value) => (
                <span className="text-sm font-medium">
                  {value ? `${value} Mbps` : 'N/A'}
                </span>
              )
            },
            { 
              key: 'created_at', 
              label: 'Created At',
              render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
            }
          ]}
          data={bmcs}
          keyField="component_bmc_id"
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No BMC data available in current inventory</p>
        </div>
      )}
    </div>
  );
};

export default function ServerComponentsPage() {
  const [loading, setLoading] = useState(true);
  const [componentCatalog, setComponentCatalog] = useState<ComponentCatalog>({
    cpus: [],
    memory: [],
    disks: [],
    network_interfaces: [],
    gpus: [],
    motherboards: [],
    bmcs: []
  });

  const componentTabs: TabDefinition[] = [
    { id: "motherboards", label: "Motherboard Models", icon: "" },
    { id: "cpus", label: "CPU Models", icon: "" },
    { id: "memory", label: "Memory Models", icon: "" },
    { id: "gpus", label: "GPU Models", icon: "" },
    { id: "disks", label: "Disk Models", icon: "" },
    { id: "network", label: "Network Interfaces", icon: "" },
    { id: "bmcs", label: "BMC Models", icon: "" }
  ];

  useEffect(() => {
    async function loadComponents() {
      try {
        const catalogData = await getComponentCatalog();
        setComponentCatalog(catalogData);
      } catch (error) {
        console.error('Failed to load component catalog:', error);
      } finally {
        setLoading(false);
      }
    }

    loadComponents();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto">
        <Breadcrumb />
        <div className="rounded-theme border border-island_border bg-island_background p-6 text-center">
          <div className="text-2xl mb-4">⏳</div>
          <p className="text-foreground">Loading component models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Breadcrumb />
      
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-theme bg-primary/10">
            <span className="text-2xl">🔧</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Component Models</h1>
            <p className="text-sm text-muted-foreground">
              Unique hardware component models and specifications across the farm
            </p>
          </div>
        </div>
      </div>

      {/* Component Model Catalog */}
      <TabContainer
        tabs={componentTabs}
        defaultTab="motherboards"
        content={{
          motherboards: <MotherboardModelsTab motherboards={componentCatalog.motherboards} />,
          cpus: <CPUModelsTab cpus={componentCatalog.cpus} />,
          memory: <RAMModelsTab memory={componentCatalog.memory} />,
          gpus: <GPUModelsTab gpus={componentCatalog.gpus} />,
          disks: <DiskModelsTab disks={componentCatalog.disks} />,
          network: <NetworkModelsTab networkInterfaces={componentCatalog.network_interfaces} />,
          bmcs: <BMCModelsTab bmcs={componentCatalog.bmcs} />
        }}
        contentClassName="p-6"
      />
    </div>
  );
}