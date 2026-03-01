"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getClusterById, getClusterNamespaces, getClusterPods, getClusterServices, getClusterEvents, getClusterWorkloads } from "@/lib/kubernetes";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import FieldSection from "@/components/ui/FieldSection";
import TableSection from "@/components/ui/table/TableSection";
import { TabContainer, TabDefinition } from "@/components/ui/tab/TabContainer";

// Helper component for rendering status badges
const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: { [key: string]: { color: string; bg: string; border: string } } = {
        'active': { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        'inactive': { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
        'maintenance': { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
        'archived': { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig['inactive'];

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-theme text-sm font-medium border ${config.color} ${config.bg} ${config.border}`}>
            {status || 'Unknown'}
        </span>
    );
};

const StateBadge = ({ state }: { state: string }) => {
    const stateConfig: { [key: string]: { color: string; bg: string; border: string } } = {
        'ready': { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        'active': { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        'running': { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        'degraded': { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
        'warning': { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
        'initializing': { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        'upgrading': { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        'offline': { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
        'error': { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
        'failed': { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
        'maintenance': { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
    };

    const config = stateConfig[state?.toLowerCase()] || stateConfig['maintenance'];

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-theme text-sm font-medium border ${config.color} ${config.bg} ${config.border}`}>
            {state || 'Unknown'}
        </span>
    );
};

// Namespaces Tab Component
const NamespacesInventory = ({ clusterId }: { clusterId: number }) => {
    const [namespaces, setNamespaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadNamespaces() {
            try {
                const data = await getClusterNamespaces(clusterId);
                setNamespaces(data || []);
            } catch (error) {
                console.error('Failed to load namespaces:', error);
            } finally {
                setLoading(false);
            }
        }

        loadNamespaces();
    }, [clusterId]);

    if (loading) {
        return (
            <div className="p-5 text-center">
                <div className="text-muted-foreground">Loading namespaces...</div>
            </div>
        );
    }

    if (namespaces.length === 0) {
        return (
            <div className="p-5 text-center">
                <div className="text-muted-foreground">No namespaces found in this cluster</div>
            </div>
        );
    }

    return (
        <div className="p-5">
            <TableSection
                columns={[
                    { key: 'namespace_name', label: 'Namespace' },
                    { key: 'status', label: 'Status' },
                    { key: 'labels', label: 'Labels', render: (value) => JSON.stringify(value || {}) },
                    { key: 'created_at', label: 'Created', render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A' },
                ]}
                data={namespaces}
                keyField="namespace_id"
                searchable={true}
            />
        </div>
    );
};

// Pods Tab Component
const PodsInventory = ({ clusterId }: { clusterId: number }) => {
    const [pods, setPods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPods() {
            try {
                const data = await getClusterPods(clusterId);
                setPods(data || []);
            } catch (error) {
                console.error('Failed to load pods:', error);
            } finally {
                setLoading(false);
            }
        }

        loadPods();
    }, [clusterId]);

    if (loading) {
        return (
            <div className="p-5 text-center">
                <div className="text-muted-foreground">Loading pods...</div>
            </div>
        );
    }

    if (pods.length === 0) {
        return (
            <div className="p-5 text-center">
                <div className="text-muted-foreground">No pods found in this cluster</div>
            </div>
        );
    }

    return (
        <div className="p-5">
            <TableSection
                columns={[
                    { key: 'pod_name', label: 'Pod Name' },
                    { key: 'namespace', label: 'Namespace' },
                    { key: 'status', label: 'Status' },
                    { key: 'node_name', label: 'Node' },
                    { key: 'created_at', label: 'Created', render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A' },
                ]}
                data={pods}
                keyField="pod_id"
                searchable={true}
            />
        </div>
    );
};

// Services Tab Component
const ServicesInventory = ({ clusterId }: { clusterId: number }) => {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadServices() {
            try {
                const data = await getClusterServices(clusterId);
                setServices(data || []);
            } catch (error) {
                console.error('Failed to load services:', error);
            } finally {
                setLoading(false);
            }
        }

        loadServices();
    }, [clusterId]);

    if (loading) {
        return (
            <div className="p-5 text-center">
                <div className="text-muted-foreground">Loading services...</div>
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <div className="p-5 text-center">
                <div className="text-muted-foreground">No services found in this cluster</div>
            </div>
        );
    }

    return (
        <div className="p-5">
            <TableSection
                columns={[
                    { key: 'service_name', label: 'Service Name' },
                    { key: 'namespace', label: 'Namespace' },
                    { key: 'service_type', label: 'Type' },
                    { key: 'cluster_ip', label: 'Cluster IP' },
                    { key: 'ports', label: 'Ports', render: (value) => JSON.stringify(value || []) },
                    { key: 'created_at', label: 'Created', render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A' },
                ]}
                data={services}
                keyField="service_id"
                searchable={true}
            />
        </div>
    );
};

// Workloads Tab Component
const WorkloadsInventory = ({ clusterId }: { clusterId: number }) => {
    const [workloads, setWorkloads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadWorkloads() {
            try {
                const data = await getClusterWorkloads(clusterId);
                setWorkloads(data || []);
            } catch (error) {
                console.error('Failed to load workloads:', error);
            } finally {
                setLoading(false);
            }
        }

        loadWorkloads();
    }, [clusterId]);

    if (loading) {
        return (
            <div className="p-5 text-center">
                <div className="text-muted-foreground">Loading workloads...</div>
            </div>
        );
    }

    if (workloads.length === 0) {
        return (
            <div className="p-5 text-center">
                <div className="text-muted-foreground">No workloads found in this cluster</div>
            </div>
        );
    }

    return (
        <div className="p-5">
            <TableSection
                columns={[
                    { key: 'workload_name', label: 'Workload Name' },
                    { key: 'workload_type', label: 'Type' },
                    { key: 'namespace', label: 'Namespace' },
                    { key: 'replicas', label: 'Replicas' },
                    { key: 'created_at', label: 'Created', render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A' },
                ]}
                data={workloads}
                keyField="workload_id"
                searchable={true}
            />
        </div>
    );
};

// Events Tab Component
const EventsInventory = ({ clusterId }: { clusterId: number }) => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadEvents() {
            try {
                const data = await getClusterEvents(clusterId);
                setEvents(data || []);
            } catch (error) {
                console.error('Failed to load events:', error);
            } finally {
                setLoading(false);
            }
        }

        loadEvents();
    }, [clusterId]);

    if (loading) {
        return (
            <div className="p-5 text-center">
                <div className="text-muted-foreground">Loading events...</div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="p-5 text-center">
                <div className="text-muted-foreground">No events found in this cluster</div>
            </div>
        );
    }

    return (
        <div className="p-5">
            <TableSection
                columns={[
                    { key: 'event_type', label: 'Type' },
                    { key: 'reason', label: 'Reason' },
                    { key: 'message', label: 'Message' },
                    { key: 'source', label: 'Source' },
                    { key: 'created_at', label: 'Time', render: (value) => value ? new Date(value).toLocaleString() : 'N/A' },
                ]}
                data={events}
                keyField="event_id"
                searchable={true}
            />
        </div>
    );
};

const resourceTabs: TabDefinition[] = [
    { id: "namespaces", label: "Namespaces", icon: "" },
    { id: "workloads", label: "Workloads", icon: "" },
    { id: "pods", label: "Pods", icon: "" },
    { id: "services", label: "Services", icon: "" },
    { id: "events", label: "Events", icon: "" },
];

const monitoringTabs: TabDefinition[] = [
    { id: "cluster-metrics", label: "Cluster Metrics", icon: "" },
    { id: "node-metrics", label: "Node Metrics", icon: "" },
    { id: "pod-metrics", label: "Pod Metrics", icon: "" },
    { id: "logs", label: "Logs", icon: "" }
];

const MonitoringTab = () => {
    return (
        <TabContainer
            tabs={monitoringTabs}
            defaultTab="cluster-metrics"
            content={{}}
        />
    );
};

export default function ClusterDetailPage() {
    const params = useParams();
    const clusterId = parseInt(params.cluster_id as string);
    const [clusterData, setClusterData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCluster() {
            try {
                const data = await getClusterById(clusterId);
                setClusterData(data);
            } catch (error) {
                console.error('Failed to load cluster:', error);
            } finally {
                setLoading(false);
            }
        }

        if (!isNaN(clusterId)) {
            loadCluster();
        } else {
            setLoading(false);
        }
    }, [clusterId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-muted-foreground">Loading cluster details...</div>
            </div>
        );
    }

    if (!clusterData) {
        return <p className="text-center p-8">Cluster data not found.</p>;
    }

    const cluster = Array.isArray(clusterData) ? clusterData[0] : clusterData;

    const renderDistributionIcon = () => {
        const distribution = cluster.distribution?.toLowerCase() || 'vanilla';
        const iconMap: Record<string, string> = {
            'k3s': '🐮',
            'k0s': '🔷',
            'rke': '🐮',
            'rke2': '🐮',
            'eks': '☁️',
            'aks': '☁️',
            'gke': '☁️',
            'openshift': '🔴',
            'rancher': '🐮',
            'microk8s': '🔶',
            'kubeadm': '☸️',
            'vanilla': '☸️',
        };
        return iconMap[distribution] || '☸️';
    };

    return (
        <div className="space-y-6">
            <Breadcrumb />

            {/* Main Content: Cluster Details */}
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Kubernetes Cluster Details</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Monitor and manage your Kubernetes cluster
                    </p>
                </div>

                {/* Cluster Information Card */}
                <div className="rounded-theme border border-island_border bg-island_background p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-island_border pb-4 mb-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-theme bg-primary/10">
                                <span className="text-2xl">{renderDistributionIcon()}</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mt-1">{cluster.cluster_name || 'Unknown Cluster'}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <StatusBadge status={cluster.cluster_status} />
                                    <span className="text-sm text-muted-foreground">•</span>
                                    <StateBadge state={cluster.cluster_state} />
                                    <span className="text-sm text-muted-foreground">•</span>
                                    <span className="text-sm text-muted-foreground">{cluster.distribution || 'Vanilla'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Two-column layout */}
                    <div className="grid grid-cols-2 gap-5">
                        {/* Left Column: Cluster Information */}
                        <div className="space-y-6">
                            <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
                                <div className="space-y-5 text-sm text-foreground font-mono">
                                    {/* Basic Information Section */}
                                    <FieldSection fields={[
                                        { label: 'Cluster ID', value: cluster.cluster_id, icon: '' },
                                        { label: 'Cluster Name', value: cluster.cluster_name, icon: '' },
                                        { label: 'Version', value: cluster.cluster_version, icon: '' },
                                        { label: 'Distribution', value: cluster.distribution, icon: '' },
                                        { label: 'State', value: cluster.cluster_state, icon: '' },
                                        { label: 'Status', value: cluster.cluster_status, icon: '' },
                                    ]} />

                                    {/* Separator Line */}
                                    <div className="border-t border-island_border my-3"></div>

                                    {/* API & Network Section */}
                                    <FieldSection fields={[
                                        { label: 'API Server', value: cluster.api_server_endpoint, icon: '' },
                                        { label: 'Network Plugin', value: cluster.network_plugin, icon: '' },
                                        { label: 'Storage Class', value: cluster.storage_class, icon: '' },
                                        { label: 'CNI Version', value: cluster.cni_version, icon: '' },
                                    ]} />

                                    {/* Separator Line */}
                                    <div className="border-t border-island_border my-3"></div>

                                    {/* Resource Counts */}
                                    <FieldSection fields={[
                                        { label: 'Control Plane Nodes', value: cluster.control_plane_count || '0', icon: '' },
                                        { label: 'Worker Nodes', value: cluster.worker_node_count || '0', icon: '' },
                                        { label: 'Total Pods', value: cluster.total_pods || '0', icon: '' },
                                        { label: 'Total Namespaces', value: cluster.total_namespaces || '0', icon: '' },
                                    ]} />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Configuration & Features */}
                        <div className="space-y-6">
                            <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
                                <div className="space-y-4 text-sm text-foreground font-mono">
                                    {/* Features Section */}
                                    <FieldSection fields={[
                                        { 
                                            label: 'Monitoring Enabled', 
                                            value: cluster.monitoring_enabled ? '✅ Yes' : '❌ No', 
                                            icon: '' 
                                        },
                                        { 
                                            label: 'Logging Enabled', 
                                            value: cluster.logging_enabled ? '✅ Yes' : '❌ No', 
                                            icon: '' 
                                        },
                                        { 
                                            label: 'Auto Scaling', 
                                            value: cluster.auto_scaling_enabled ? '✅ Yes' : '❌ No', 
                                            icon: '' 
                                        },
                                        { 
                                            label: 'High Availability', 
                                            value: cluster.ha_enabled ? '✅ Yes' : '❌ No', 
                                            icon: '' 
                                        },
                                    ]} />

                                    {/* Separator Line */}
                                    <div className="border-t border-island_border my-3"></div>

                                    {/* Location Section */}
                                    <FieldSection fields={[
                                        { label: 'Provider', value: cluster.provider, icon: '' },
                                        { label: 'Region', value: cluster.region, icon: '' },
                                        { label: 'Data Center', value: cluster.data_center_id || 'N/A', icon: '' },
                                    ]} />

                                    {/* Separator Line */}
                                    <div className="border-t border-island_border my-3"></div>

                                    {/* Metadata Section */}
                                    <FieldSection fields={[
                                        { label: 'Created', value: cluster.created_at ? new Date(cluster.created_at).toLocaleDateString() : 'N/A', icon: '' },
                                        { label: 'Updated', value: cluster.updated_at ? new Date(cluster.updated_at).toLocaleDateString() : 'N/A', icon: '' },
                                        { label: 'Last Inventory', value: cluster.last_inventory_at ? new Date(cluster.last_inventory_at).toLocaleDateString() : 'N/A', icon: '' },
                                    ]} />

                                    {/* Separator Line */}
                                    <div className="border-t border-island_border my-3"></div>

                                    {/* Description */}
                                    {cluster.description && (
                                        <div className="p-3">
                                            <div className="font-medium text-muted-foreground mb-2">Description:</div>
                                            <div className="text-foreground">{cluster.description}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resources & Monitoring Section */}
            <div>
                <div className="rounded-theme border border-island_border bg-island_background p-6 border-b border-island_border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📦</span>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Cluster Resources</h2>
                                <p className="text-sm text-muted-foreground">View and manage cluster resources and workloads</p>
                            </div>
                        </div>
                    </div>
                </div>
                <TabContainer
                    tabs={resourceTabs}
                    defaultTab="namespaces"
                    content={{
                        namespaces: <NamespacesInventory clusterId={clusterId} />,
                        workloads: <WorkloadsInventory clusterId={clusterId} />,
                        pods: <PodsInventory clusterId={clusterId} />,
                        services: <ServicesInventory clusterId={clusterId} />,
                        events: <EventsInventory clusterId={clusterId} />,
                    }}
                />
            </div>
        </div>
    );
}
