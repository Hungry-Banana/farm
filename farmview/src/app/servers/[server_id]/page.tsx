"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DefaultServerIcon } from "@/assets/icons";
import { getServerById } from "@/lib/servers";
import { getVMsByServer } from "@/lib/vms";
import { ServerCpuUI, ServerDiskUI, ServerGpuDetail, ServerInventory, ServerMemoryUI, ServerNetworkUI, ServerWithAllComponents } from "@/types/server";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import FieldSection from "@/components/ui/FieldSection";
import TableSection from "@/components/ui/table/TableSection";
import { convertServerToInventory } from "@/lib/serverDataAdapter";
import { TabContainer, TabDefinition } from "@/components/ui/tab/TabContainer";
import ServerActionsDropdown from "@/components/ui/Buttons/ServerActionButton";

// Helper component for rendering network interface sections
const NetworkSection = ({ fields }: { fields: Array<{ label: string; value: any; link?: { href: string; text: string } }> }) => (
    <div className="p-3 rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
        <div className="grid grid-cols-4 text-sm text-foreground font-mono">
            {fields.map(({ label, value, link }) => (
                <div key={label} className="text-center">
                    <div className="font-medium text-muted-foreground mb-1">{label}:</div>
                    {link ? (
                        <a 
                            href={link.href}
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            {link.text || 'N/A'}
                        </a>
                    ) : (
                        <div className="font-semibold">{value || 'N/A'}</div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

const CPUInventory = ({ cpu }: { cpu: ServerCpuUI[] }) => {
  return (
		<div className="p-5">
			<TableSection
			columns={[
				{ key: 'socket', label: 'Socket' },
                { key: 'manufacturer', label: 'Manufacturer' },
				{ key: 'model', label: 'Model' },
				{ key: 'cores', label: 'Cores'},
				{ key: 'threads', label: 'Threads'},
				{ key: 'base_frequency_ghz', label: 'Base Frequency (GHz)' },
				{ key: 'cache_l3_mb', label: 'Cache (MB)' },
			]}
			data={cpu}
			keyField="cpu_inventory_id"
			searchable={false}
			/>
		</div>
    );
};

const RAMInventory = ({ ram }: { ram: ServerMemoryUI[] }) => {
  return (
		<div className="p-5">
			<TableSection
			columns={[
				{ key: 'slot', label: 'Slot' },
				{ key: 'manufacturer', label: 'Manufacturer' },
				{ key: 'size_gb', label: 'Capacity (GB)'},
				{ key: 'speed_mhz', label: 'Speed (MHz)'},
				{ key: 'type', label: 'Type' },
				{ key: 'part_number', label: 'Part Number' },
				{ key: 'serial_number', label: 'Serial' },
			]}
			data={ram}
			keyField="ram_inventory_id"
			searchable={false}
			/>
		</div>
    );
};

const StorageInventory = ({ storage }: { storage: ServerDiskUI[] }) => {
  return (
		<div className="p-5">
			<TableSection
			columns={[
				{ key: 'device_name', label: 'Device' },
                { key: 'manufacturer', label: 'Manufacturer' },
				{ key: 'model', label: 'Model' },
                { key: 'firmware_version', label: 'Firmware' },
				{ key: 'size_gb', label: 'Capacity (GB)'},
				{ key: 'interface', label: 'Interface' },
				{ key: 'health_status', label: 'Health' },
				{ key: 'serial_number', label: 'Serial' },
			]}
			data={storage}
			keyField="storage_inventory_id"
			searchable={false}
			/>
		</div>
    );
};

const GPUInventory = ({ gpus }: { gpus: ServerGpuDetail[] }) => {
  return (
		<div className="p-5">
			<TableSection
			columns={[
				{ key: 'pci_address', label: 'PCI Address'},
				{ key: 'vendor', label: 'Vendor' },
				{ key: 'model', label: 'Model' },
				{ key: 'vram_mb', label: 'VRAM (MB)'},
				{ key: 'driver_version', label: 'Driver Version' },
				{ key: 'uuid', label: 'UUID' },
			]}
			data={gpus}
			keyField="gpu_id"
			searchable={false}
			/>
		</div>
    );
};

const NICInventory = ({ nics }: { nics: ServerNetworkUI[] }) => {
  return (
		<div className="p-5">
			<TableSection
			columns={[
				{ key: 'name', label: 'Interface' },
				{ key: 'mac_address', label: 'MAC Address' },
				{ key: 'ip_address', label: 'IP Address'},
				{ key: 'speed_mbps', label: 'Speed (Mbps)' },
				{ key: 'pci_address', label: 'PCI Address' },
				{ key: 'manufacturer', label: 'Manufacturer' },
				{ key: 'model', label: 'Model' },
				{ key: 'firmware_version', label: 'Firmware' },
				{ key: 'is_primary', label: 'Primary' },
			]}
			data={nics}
			keyField="interface_id"
			searchable={false}
			/>
		</div>
    );
};

const VMsInventory = ({ serverId }: { serverId: number }) => {
  const [vms, setVMs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVMs() {
      try {
        const data = await getVMsByServer(serverId);
        setVMs(data || []);
      } catch (error) {
        console.error('Failed to load VMs:', error);
      } finally {
        setLoading(false);
      }
    }

    loadVMs();
  }, [serverId]);

  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="text-muted-foreground">Loading virtual machines...</div>
      </div>
    );
  }

  if (vms.length === 0) {
    return (
      <div className="p-5 text-center">
        <div className="text-muted-foreground">No virtual machines found on this server</div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <TableSection
        columns={[
          {
            key: 'vm_name',
            label: 'VM Name',
            render: (value, vm) => (
              <div>
                <a 
                  href={`/servers/vms/${vm.vm_id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {value || `VM ${vm.vm_id}`}
                </a>
              </div>
            )
          },
          { key: 'hypervisor_type', label: 'Hypervisor' },
          {
            key: 'vm_state',
            label: 'State',
            render: (value) => {
              const stateColors: Record<string, string> = {
                running: 'text-green-500 bg-green-500/10 border-green-500/20',
                stopped: 'text-red-500 bg-red-500/10 border-red-500/20',
                paused: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
                suspended: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
                unknown: 'text-gray-500 bg-gray-500/10 border-gray-500/20'
              };
              const colorClass = stateColors[value?.toLowerCase()] || stateColors.unknown;
              return (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${colorClass}`}>
                  {value || 'unknown'}
                </span>
              );
            }
          },
          { key: 'guest_os_family', label: 'OS Family' },
          { key: 'vcpu_count', label: 'vCPUs' },
          {
            key: 'memory_mb',
            label: 'Memory',
            render: (value) => `${Math.round((value || 0) / 1024)} GB`
          },
          {
            key: 'storage_gb',
            label: 'Storage',
            render: (value) => `${Math.round(value || 0)} GB`
          }
        ]}
        data={vms}
        keyField="vm_id"
        searchable={false}
      />
    </div>
  );
};

const MotherboardInventory = ({ motherboard }: { motherboard: any }) => {
  return (
		<div className="p-6">
			<div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
				<div className="grid grid-cols-1 gap-4 text-sm text-foreground font-mono">
					<FieldSection fields={[
						{ label: 'Manufacturer', value: motherboard.manufacturer, icon: '' },
						{ label: 'Model', value: motherboard.model, icon: '' },
						{ label: 'Serial Number', value: motherboard.serial_number, icon: '' },
						{ label: 'Version', value: motherboard.version, icon: '' },
					]} />

					<FieldSection fields={[
						{ label: 'BIOS Version', value: motherboard.bios_version, icon: '' },
						{ label: 'BIOS Release Date', value: motherboard.bios_release_date, icon: '' },
					]} />

					<FieldSection fields={[
						{ label: 'BMC Firmware Version', value: motherboard.bmc_firmware_version, icon: '' },
						{ label: 'BMC Release Date', value: motherboard.bmc_release_date, icon: '' },
					]} />
				</div>
			</div>
		</div>
    );
};
    
const inventoryTabs: TabDefinition[] = [

    { id: "cpus", label: "Processors", icon: "" },
    { id: "ram", label: "Memory", icon: "" },
    { id: "disks", label: "Storage", icon: "" },
    { id: "gpus", label: "GPU", icon: "" },
    { id: "nics", label: "Network", icon: "" },
    { id: "motherboard", label: "Motherboard", icon: "" },
    { id: "vms", label: "Virtual Machines", icon: "" },
    { id: "monitoring", label: "Monitoring", icon: "" }
];

const monitoringTabs: TabDefinition[] = [
    { id: "system-metrics", label: "System Metrics", icon: "" },
    { id: "storage-metrics", label: "Storage Metrics", icon: "" },
    { id: "gpu-metrics", label: "GPU Metrics", icon: "" },
    { id: "network-metrics", label: "Network Metrics", icon: "" },
    { id: "system-logs", label: "System Logs", icon: "" }
];

const MonitorTab = () => {
	return (
		<TabContainer
			tabs={monitoringTabs}
			defaultTab="system-metrics"
			content={{
			}}
		/>
	);
}

export default function ServerPage() {

    const params = useParams();
    const serverId = parseInt(params.server_id as string);
    const [serverData, setServerData] = useState<ServerWithAllComponents | null>(null);
    const [loading, setLoading] = useState(true);
	const inventory: ServerInventory | null = serverData ? convertServerToInventory(serverData) : null;

    useEffect(() => {
		async function loadServer() {
			try {
				const data = await getServerById(serverId);
				setServerData(data);
			} catch (error) {
				console.error('Failed to load server:', error);
			} finally {
				setLoading(false);
			}
		}

		if (!isNaN(serverId)) {
			loadServer();
		} else {
			setLoading(false);
		}
	}, [serverId]);

	const server = Array.isArray(serverData) ? serverData[0] : serverData;
	const [showPasswords, setShowPasswords] = useState({
		serverPassword: false,
		bmcPassword: false
	});

	const togglePassword = (type: 'serverPassword' | 'bmcPassword') => {
		setShowPasswords(prev => ({
			...prev,
			[type]: !prev[type]
		}));
	};

	const statusConfig: { [key: string]: { color: string; bg: string; border: string; icon: string } } = {
		'ACTIVE': { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: '' },
		'INACTIVE': { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: '' },
		'MAINTENANCE': { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: '' },
		'UNKNOWN': { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: '' },
		'NEW': { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: '' },
		'DEFAULT': { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: '' }
	};

	if (!server) return <p className="text-center p-8">Server data not found.</p>;

	const currentStatus = statusConfig[server.status] || statusConfig['DEFAULT'];

	// Network interfaces
	const primaryNic = server.network_interfaces?.find((nic: any) => nic.is_primary) || server.network_interfaces?.[0];
	const bmcInterface = server.bmc_interfaces?.[0];

	// Credentials
	const osCredential = server.credentials?.find((cred: any) => cred.credential_type === 'OS');
	const serverPasswordDisplay = osCredential?.password 
		? (showPasswords.serverPassword ? osCredential.password : '••••••••') 
		: 'N/A';
	const bmcPasswordDisplay = bmcInterface?.password 
		? (showPasswords.bmcPassword ? bmcInterface.password : '••••••••') 
		: 'N/A';

	return (
		<div className="space-y-6">
            <Breadcrumb />

            {/* Main Content: Server Details Cards in 2 Columns */}
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Server Details</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Monitor and manage your server
                    </p>
                </div>
                {/* Combined Server Information & Network Configuration */}
                <div className="rounded-theme border border-island_border bg-island_background p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-island_border pb-4 mb-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-theme bg-primary/10">
                                <DefaultServerIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mt-1">{server.server_name || 'Unknown Server'}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-theme text-sm font-medium border ${currentStatus.color} ${currentStatus.bg} ${currentStatus.border}`}>
                                        <span className="mr-1">{currentStatus.icon}</span>
                                        {server.status || 'Unknown'}
                                    </span>
                                    <span className="text-sm text-muted-foreground">•</span>
                                    <span className="text-sm text-muted-foreground">{server.server_type || 'Unknown Type'}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <ServerActionsDropdown serverId={server.server_id} />
                        </div>
                    </div>
                    
                    {/* Two-column layout with vertical separator */}
                    <div className="grid grid-cols-2 gap-5">
                        {/* Left Column: Server Information */}
                        <div className="space-y-6">
                            <div className=" rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
                                <div className="space-y-5 text-sm text-foreground font-mono">
                                    {/* Basic Information Section */}
                                    <FieldSection fields={[
                                        { label: 'Server ID', value: server.server_id, icon: '' },
                                        { label: 'Status', value: server.status, icon: '' },
                                        { label: 'Server Name', value: server.server_name, icon: '' },
                                        { label: 'State', value: server.state, icon: '' },
                                        { label: 'Environment Type', value: server.environment_type, icon: '' },
                                        { label: 'Stage', value: server.stage, icon: '' },
                                        { label: 'Server Type', value: server.server_type, icon: '' }
                                    ]} />

                                   {/* Separator Line */}
                                    <div className="border-t border-island_border my-3"></div>

                                    {/* Location & Placement Section */}
                                    <FieldSection fields={[
                                        { label: 'Data Center ID', value: server.data_center_id || '0', icon: '' },
                                        { label: 'Cluster ID', value: server.cluster_id || '0', icon: '' },
                                        { label: 'Rack ID', value: server.rack_id || '0', icon: '' },
                                        { label: 'Sub Cluster ID', value: server.sub_cluster_id || '0', icon: '' },
                                        { label: 'Rack Position', value: server.rack_position_id || '0', icon: '' }
                                    ]} />

                                    {/* Separator Line */}
                                    <div className="border-t border-island_border my-3"></div>

                                    {/* Hardware Details Section */}
                                    <FieldSection fields={[
                                        { label: 'Manufacturer', value: server.manufacturer, icon: '' },
                                        { label: 'Product Name', value: server.product_name, icon: '' },
                                        { label: 'Serial Number', value: server.serial_number, icon: '' },
                                        { label: 'Architecture', value: server.architecture, icon: '' },
                                        { label: 'Chassis Serial', value: server.chassis_serial_number, icon: '' }
                                    ]} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className=" rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
                                <div className="space-y-4 text-sm text-foreground font-mono">

                                    {/* Primary Network Interface Section */}
                                    <FieldSection fields={[
                                        { label: 'Primary IP', value: primaryNic?.ip_address || 'N/A', icon: '' },
                                        { label: 'Primary MAC', value: primaryNic?.mac_address || 'N/A', icon: '' },
                                        { label: 'Switch', value: primaryNic?.switch_name || 'N/A', icon: '' },
                                        { label: 'Port', value: primaryNic?.switch_port_name || 'N/A', icon: '' }
                                    ]} />

                                    {/* BMC Network Interface Section */}
                                    <FieldSection fields={[
                                        { label: 'BMC IP', value: bmcInterface?.ip_address || 'N/A', icon: '' },
                                        { label: 'BMC MAC', value: bmcInterface?.mac_address || 'N/A', icon: '' },
                                        { label: 'BMC Switch', value: bmcInterface?.switch_name || 'N/A', icon: '' },
                                        { label: 'BMC Port', value: bmcInterface?.switch_port_name || 'N/A', icon: '' }
                                    ]} />

                                    {/* Separator Line */}
                                    <div className="border-t border-island_border my-3"></div>

                                    {/* Server Credentials Section */}
                                    <FieldSection fields={[
                                        { label: '👤 Server Username', value: osCredential?.username || 'N/A', icon: '' },
                                        { label: '👤 BMC Username', value: bmcInterface?.username || 'N/A', icon: '' },
                                        { 
                                            label: '🔑 Server Password',
                                            value: (
                                                <div className="flex items-center justify-center gap-2">
                                                    {osCredential?.password && (
                                                        <button
                                                            onClick={() => togglePassword('serverPassword')}
                                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            {showPasswords.serverPassword ? '👁️' : '👁️‍🗨️'}
                                                        </button>
                                                    )}
                                                    <span>{serverPasswordDisplay}</span>
                                                </div>
                                            ), 
                                            icon: '' 
                                        },
                                        { 
                                            label: '🔑 BMC Password', 
                                            value: (
                                                <div className="flex items-center justify-center gap-2">
                                                    {bmcInterface?.password && (
                                                        <button
                                                            onClick={() => togglePassword('bmcPassword')}
                                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            {showPasswords.bmcPassword ? '👁️' : '👁️‍🗨️'}
                                                        </button>
                                                    )}
                                                    <span>{bmcPasswordDisplay}</span>
                                                </div>
                                            ), 
                                            icon: '' 
                                        }
                                    ]} />

                                    {/* Separator Line */}
                                    <div className="border-t border-island_border my-3"></div>

                                    {/* Motherboard & Firmware Section */}
                                    <FieldSection fields={[
                                        { label: 'BIOS Version', value: inventory?.motherboard.bios_version, icon: '' },
                                        { label: 'BMC Firmware', value: inventory?.motherboard.bmc_firmware_version, icon: '' },
                                        { label: 'BIOS Release Date', value: inventory?.motherboard.bios_release_date, icon: '' },
                                        { label: 'BMC Release Date', value: inventory?.motherboard.bmc_release_date, icon: '' }
                                    ]} />



                                    {/* Separator Line */}
                                    <div className="border-t border-island_border my-3"></div>

                                    {/* Management & Status Section */}
                                    <FieldSection fields={[
                                        { label: 'Agent Version', value: server.agent_version, icon: '' },
                                        { label: 'Last Updated', value: server.updated_at ? new Date(server.updated_at).toLocaleDateString() : 'N/A', icon: '' },
                                        { label: 'Last Inventory', value: server.last_inventory_at ? new Date(server.last_inventory_at).toLocaleDateString() : 'N/A', icon: '' },
                                        { label: 'Created Date', value: server.created_at ? new Date(server.created_at).toLocaleDateString() : 'N/A', icon: '' }
                                    ]} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>			
            </div>	

            {/* Inventory & Monitoring Section */}
			{(
				<div>
					<div className="rounded-theme border border-island_border bg-island_background p-6 border-b border-island_border">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<span className="text-2xl">🔧</span>
								<div>
									<h2 className="text-lg font-semibold text-foreground">Inventory & Monitoring</h2>
									<p className="text-sm text-muted-foreground">Hardware specifications, performance metrics, and system monitoring</p>
								</div>
							</div>
						</div>
					</div>
					{inventory && (
						<TabContainer
							tabs={inventoryTabs}
							defaultTab="cpus"
							content={{
								cpus: <CPUInventory cpu={inventory.cpus} />,
								ram: <RAMInventory ram={inventory.ram} />,
								disks: <StorageInventory storage={inventory.disks} />,
								gpus: <GPUInventory gpus={inventory.gpus} />,
								nics: <NICInventory nics={inventory.nics} />,
								motherboard: <MotherboardInventory motherboard={inventory.motherboard} />,
								vms: <VMsInventory serverId={serverId} />,
								monitoring: <MonitorTab />,
							}}
					  	/>
					)}
				</div>

			)}	
        </div>
	);
}
