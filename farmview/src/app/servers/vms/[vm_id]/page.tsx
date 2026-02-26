"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DefaultServerIcon } from "@/assets/icons";
import { getVMById } from "@/lib/vms";
import { getServerById } from "@/lib/servers";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import FieldSection from "@/components/ui/FieldSection";
import { TabContainer, TabDefinition } from "@/components/ui/tab/TabContainer";

const vmTabs: TabDefinition[] = [
    { id: "storage", label: "Storage", icon: "" },
    { id: "network", label: "Network", icon: "" },
    { id: "monitoring", label: "Monitoring", icon: "" },
    { id: "snapshots", label: "Snapshots", icon: "" }
];

const monitoringTabs: TabDefinition[] = [
    { id: "performance-metrics", label: "Performance Metrics", icon: "" },
    { id: "resource-usage", label: "Resource Usage", icon: "" },
    { id: "vm-logs", label: "VM Logs", icon: "" }
];

const MonitorTab = () => {
    return (
        <TabContainer
            tabs={monitoringTabs}
            defaultTab="performance-metrics"
            content={{
                "performance-metrics": (
                    <div className="p-5 text-center text-muted-foreground">
                        Performance metrics coming soon...
                    </div>
                ),
                "resource-usage": (
                    <div className="p-5 text-center text-muted-foreground">
                        Resource usage coming soon...
                    </div>
                ),
                "vm-logs": (
                    <div className="p-5 text-center text-muted-foreground">
                        VM logs coming soon...
                    </div>
                )
            }}
        />
    );
};

const OverviewTab = ({ vm, server }: { vm: any; server: any }) => {
    return (
        <div className="p-5">
            <div className="grid grid-cols-2 gap-5">
                {/* Left Column: VM Information */}
                <div className="space-y-6">
                    <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
                        <div className="space-y-4 text-sm text-foreground font-mono">
                            {/* Basic Information Section */}
                            <FieldSection fields={[
                                { label: 'VM ID', value: vm.vm_id, icon: '' },
                                { label: 'VM Name', value: vm.vm_name, icon: '' },
                                { label: 'VM State', value: vm.vm_state, icon: '' },
                                { label: 'VM Status', value: vm.vm_status, icon: '' },
                                { label: 'Hypervisor Type', value: vm.hypervisor_type, icon: '' }
                            ]} />

                            {/* Separator Line */}
                            <div className="border-t border-island_border my-3"></div>

                            {/* Guest OS Section */}
                            <FieldSection fields={[
                                { label: 'Guest OS Family', value: vm.guest_os_family, icon: '' },
                                { label: 'Guest OS Version', value: vm.guest_os_version, icon: '' },
                                { label: 'Guest OS Distribution', value: vm.guest_os_distribution, icon: '' }
                            ]} />

                            {/* Separator Line */}
                            <div className="border-t border-island_border my-3"></div>

                            {/* Host Server Information */}
                            <FieldSection fields={[
                                { 
                                    label: 'Host Server', 
                                    value: server ? (
                                        <a 
                                            href={`/servers/${vm.server_id}`}
                                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {server.server_name}
                                        </a>
                                    ) : 'N/A', 
                                    icon: ''
                                },
                                { label: 'Server ID', value: vm.server_id, icon: '' }
                            ]} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Resource Configuration */}
                <div className="space-y-6">
                    <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
                        <div className="space-y-4 text-sm text-foreground font-mono">
                            {/* Resource Allocation Section */}
                            <FieldSection fields={[
                                { label: 'vCPU Count', value: vm.vcpu_count, icon: '' },
                                { label: 'Memory (MB)', value: vm.memory_mb, icon: '' },
                                { label: 'Memory (GB)', value: vm.memory_mb ? Math.round(vm.memory_mb / 1024) : 'N/A', icon: '' },
                                { label: 'Storage (GB)', value: vm.storage_gb, icon: '' }
                            ]} />

                            {/* Separator Line */}
                            <div className="border-t border-island_border my-3"></div>

                            {/* VNC Configuration */}
                            <FieldSection fields={[
                                { label: 'VNC Enabled', value: vm.enable_vnc ? 'Yes' : 'No', icon: '' },
                                { label: 'VNC Port', value: vm.vnc_port || 'N/A', icon: '' }
                            ]} />

                            {/* Separator Line */}
                            <div className="border-t border-island_border my-3"></div>

                            {/* VM Identification */}
                            <FieldSection fields={[
                                { label: 'VM UUID', value: vm.vm_uuid, icon: '' },
                                { label: 'Instance UUID', value: vm.instance_uuid, icon: '' }
                            ]} />

                            {/* Separator Line */}
                            <div className="border-t border-island_border my-3"></div>

                            {/* Timestamps */}
                            <FieldSection fields={[
                                { label: 'Created At', value: vm.created_at ? new Date(vm.created_at).toLocaleString() : 'N/A', icon: '' },
                                { label: 'Updated At', value: vm.updated_at ? new Date(vm.updated_at).toLocaleString() : 'N/A', icon: '' }
                            ]} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StorageTab = ({ vm }: { vm: any }) => {
    return (
        <div className="p-5">
            <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors p-5">
                <div className="text-sm text-foreground font-mono">
                    <FieldSection fields={[
                        { label: 'Total Storage', value: `${vm.storage_gb || 0} GB`, icon: '' },
                        { label: 'Storage Type', value: 'Virtual Disk', icon: '' }
                    ]} />
                    <div className="mt-4 text-center text-muted-foreground">
                        Detailed storage information coming soon...
                    </div>
                </div>
            </div>
        </div>
    );
};

const NetworkTab = ({ vm }: { vm: any }) => {
    return (
        <div className="p-5">
            <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors p-5">
                <div className="text-center text-muted-foreground">
                    Network configuration details coming soon...
                </div>
            </div>
        </div>
    );
};

const SnapshotsTab = ({ vm }: { vm: any }) => {
    return (
        <div className="p-5">
            <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors p-5">
                <div className="text-center text-muted-foreground">
                    VM snapshots coming soon...
                </div>
            </div>
        </div>
    );
};

export default function VMPage() {
    const params = useParams();
    const router = useRouter();
    const vmId = parseInt(params.vm_id as string);
    const [vmData, setVMData] = useState<any | null>(null);
    const [serverData, setServerData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadVM() {
            try {
                const data = await getVMById(vmId);
                console.log('VM data received:', data);
                
                // Extract VM from array if needed
                const vm = Array.isArray(data) ? data[0] : data;
                setVMData(vm);

                // Load server data if server_id is available
                if (vm?.server_id) {
                    const server = await getServerById(vm.server_id);
                    setServerData(server);
                }
            } catch (error) {
                console.error('Failed to load VM:', error);
            } finally {
                setLoading(false);
            }
        }

        if (!isNaN(vmId)) {
            loadVM();
        } else {
            setLoading(false);
        }
    }, [vmId]);

    const [showPasswords, setShowPasswords] = useState({
        vmPassword: false
    });

    const togglePassword = (type: 'vmPassword') => {
        setShowPasswords(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const stateConfig: { [key: string]: { color: string; bg: string; border: string; icon: string } } = {
        'running': { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: '' },
        'stopped': { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: '' },
        'paused': { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: '' },
        'suspended': { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: '' },
        'unknown': { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: '' },
        'DEFAULT': { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: '' }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-lg text-muted-foreground">Loading VM details...</div>
                </div>
            </div>
        );
    }

    const vm = vmData;
    const server = Array.isArray(serverData) ? serverData[0] : serverData;

    if (!vm || !vm.vm_id) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-lg text-muted-foreground">VM not found.</p>
                    <button 
                        onClick={() => router.push('/servers/vms')}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-theme hover:bg-primary/90"
                    >
                        Back to VMs
                    </button>
                </div>
            </div>
        );
    }
    const currentState = stateConfig[vm.vm_state?.toLowerCase()] || stateConfig['DEFAULT'];

    return (
        <div className="space-y-6">
            <Breadcrumb />

            {/* Main Content: VM Details Cards */}
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Virtual Machine Details</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Monitor and manage your virtual machine
                    </p>
                </div>

                {/* VM Header Card */}
                <div className="rounded-theme border border-island_border bg-island_background p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-island_border pb-4 mb-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-theme bg-primary/10">
                                <DefaultServerIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mt-1">
                                    {vm.vm_name || `VM ${vm.vm_id}`}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-theme text-sm font-medium border ${currentState.color} ${currentState.bg} ${currentState.border}`}>
                                        <span className="mr-1">{currentState.icon}</span>
                                        {vm.vm_state || 'unknown'}
                                    </span>
                                    <span className="text-sm text-muted-foreground">•</span>
                                    <span className="text-sm text-muted-foreground">{vm.hypervisor_type || 'Unknown Hypervisor'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => router.push(`/servers/vms/${vmId}/edit`)}
                                className="px-4 py-2 bg-primary text-white rounded-theme hover:bg-primary/90 transition-colors"
                            >
                                Edit VM
                            </button>
                        </div>
                    </div>

                    {/* VM Overview */}
                    <div>
                        <div className="grid grid-cols-2 gap-5">
                            {/* Left Column: VM Information */}
                            <div className="space-y-6">
                                <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
                                    <div className="space-y-4 text-sm text-foreground font-mono">
                                        {/* Basic Information Section */}
                                        <FieldSection fields={[
                                            { label: 'VM ID', value: vm.vm_id, icon: '' },
                                            { label: 'VM Status', value: vm.vm_status, icon: '' },
                                            { label: 'VM Name', value: vm.vm_name, icon: '' },
                                            { label: 'VM State', value: vm.vm_state, icon: '' },
                                            { 
                                                label: 'Host Server', 
                                                value: server ? (
                                                    <a 
                                                        href={`/servers/${vm.server_id}`}
                                                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        {server.server_name}
                                                    </a>
                                                ) : 'N/A', 
                                                icon: ''
                                            },
                                            { label: 'Hypervisor Type', value: vm.hypervisor_type, icon: '' }
                                        ]} />

                                        {/* Separator Line */}
                                        <div className="border-t border-island_border my-3"></div>

                                        {/* Resource Allocation Section */}
                                        <FieldSection fields={[
                                            { label: 'vCPU Count', value: vm.vcpu_count, icon: '' },
                                            { label: 'Memory (MB)', value: vm.memory_mb, icon: '' },
                                            { label: 'Storage (GB)', value: vm.storage_gb, icon: '' }
                                        ]} />

                                        {/* Separator Line */}
                                        <div className="border-t border-island_border my-3"></div>

                                        {/* Guest OS Section */}
                                        <FieldSection fields={[
                                            { label: 'Guest OS Family', value: vm.guest_os_family, icon: '' },
                                            { label: 'Guest OS Version', value: vm.guest_os_version, icon: '' },
                                            { label: 'Guest OS Distribution', value: vm.guest_os_distribution, icon: '' }
                                        ]} />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Resource Configuration */}
                            <div className="space-y-6">
                                <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
                                    <div className="space-y-4 text-sm text-foreground font-mono">
                                        {/* VNC Configuration */}
                                        <FieldSection fields={[
                                            { label: 'VNC Enabled', value: vm.enable_vnc ? 'Yes' : 'No', icon: '' },
                                            { label: 'VNC Port', value: vm.vnc_port || 'N/A', icon: '' }
                                        ]} />

                                        {/* Separator Line */}
                                        <div className="border-t border-island_border my-3"></div>

                                        {/* VM Identification */}
                                        <FieldSection fields={[
                                            { label: 'VM UUID', value: vm.vm_uuid, icon: '' },
                                            { label: 'Instance UUID', value: vm.instance_uuid, icon: '' }
                                        ]} />

                                        {/* Separator Line */}
                                        <div className="border-t border-island_border my-3"></div>

                                        {/* Timestamps */}
                                        <FieldSection fields={[
                                            { label: 'Created At', value: vm.created_at ? new Date(vm.created_at).toLocaleString() : 'N/A', icon: '' },
                                            { label: 'Updated At', value: vm.updated_at ? new Date(vm.updated_at).toLocaleString() : 'N/A', icon: '' }
                                        ]} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>                    
                </div>
            </div>

            {/* Tabs Section */}
            <div>
                <div className="rounded-theme border border-island_border bg-island_background p-6 border-b border-island_border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🖥️</span>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">VM Configuration & Monitoring</h2>
                                <p className="text-sm text-muted-foreground">Virtual machine specifications, resources, and performance</p>
                            </div>
                        </div>
                    </div>
                </div>
                <TabContainer
                    tabs={vmTabs}
                    defaultTab="storage"
                    content={{
                        storage: <StorageTab vm={vm} />,
                        network: <NetworkTab vm={vm} />,
                        monitoring: <MonitorTab />,
                        snapshots: <SnapshotsTab vm={vm} />
                    }}
                />
            </div>
        </div>
    );
}
