"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getClusterById, updateCluster } from "@/lib/kubernetes";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import EditableFieldSection from "@/components/ui/EditableFieldSection";
import { useNotification } from "@/contexts/NotificationContext";

export default function ClusterEditPage() {
    const params = useParams();
    const router = useRouter();
    const { addNotification } = useNotification();
    const clusterId = parseInt(params.cluster_id as string);
    const [clusterData, setClusterData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        async function loadCluster() {
            try {
                const data = await getClusterById(clusterId);
                setClusterData(data);
                
                // Initialize form data from cluster data
                const cluster = Array.isArray(data) ? data[0] : data;
                setFormData({
                    cluster_name: cluster.cluster_name || '',
                    cluster_status: cluster.cluster_status || 'INACTIVE',
                    cluster_state: cluster.cluster_state || 'UNKNOWN',
                    cluster_version: cluster.cluster_version || '',
                    distribution: cluster.distribution || 'vanilla',
                    provider: cluster.provider || '',
                    region: cluster.region || '',
                    data_center_id: cluster.data_center_id || 0,
                    api_server_endpoint: cluster.api_server_endpoint || '',
                    network_plugin: cluster.network_plugin || '',
                    storage_class: cluster.storage_class || '',
                    cni_version: cluster.cni_version || '',
                    control_plane_count: cluster.control_plane_count || 0,
                    worker_node_count: cluster.worker_node_count || 0,
                    monitoring_enabled: cluster.monitoring_enabled || false,
                    logging_enabled: cluster.logging_enabled || false,
                    auto_scaling_enabled: cluster.auto_scaling_enabled || false,
                    ha_enabled: cluster.ha_enabled || false,
                    description: cluster.description || '',
                });
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

    const handleFieldChange = (name: string, value: any) => {
        // Convert string 'true'/'false' to boolean for boolean fields
        const booleanFields = ['monitoring_enabled', 'logging_enabled', 'auto_scaling_enabled', 'ha_enabled'];
        let processedValue = value;
        
        if (booleanFields.includes(name)) {
            processedValue = value === 'true';
        }
        
        setFormData((prev: any) => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await updateCluster(clusterId, formData);
            
            if (result) {
                addNotification({
                    title: 'Success',
                    message: 'Cluster updated successfully',
                    type: 'success'
                });
                // Navigate back to cluster detail page after successful save
                router.push(`/kubernetes/${clusterId}`);
            } else {
                addNotification({
                    title: 'Error',
                    message: 'Failed to save changes - no response from server',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Failed to save cluster:', error);
            addNotification({
                title: 'Error',
                message: 'Failed to save changes. Please try again.',
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.push(`/kubernetes/${clusterId}`);
    };

    const renderDistributionIcon = () => {
        const distribution = formData.distribution?.toLowerCase() || 'vanilla';
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

    if (loading) {
        return (
            <div className="space-y-6">
                <Breadcrumb />
                <div className="rounded-theme border border-island_border bg-island_background p-6 text-center">
                    <div className="text-2xl mb-4">⏳</div>
                    <p className="text-foreground">Loading cluster data...</p>
                </div>
            </div>
        );
    }

    const cluster = Array.isArray(clusterData) ? clusterData[0] : clusterData;

    if (!cluster) {
        return (
            <div className="space-y-6">
                <Breadcrumb />
                <div className="rounded-theme border border-island_border bg-island_background p-6 text-center">
                    <div className="text-4xl mb-4">❌</div>
                    <p className="text-foreground">Cluster not found</p>
                </div>
            </div>
        );
    }

    const statusOptions = [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
        { label: 'Maintenance', value: 'MAINTENANCE' },
        { label: 'Archived', value: 'ARCHIVED' }
    ];

    const stateOptions = [
        { label: 'Ready', value: 'READY' },
        { label: 'Degraded', value: 'DEGRADED' },
        { label: 'Initializing', value: 'INITIALIZING' },
        { label: 'Upgrading', value: 'UPGRADING' },
        { label: 'Offline', value: 'OFFLINE' },
        { label: 'Error', value: 'ERROR' },
        { label: 'Maintenance', value: 'MAINTENANCE' }
    ];

    const distributionOptions = [
        { label: 'Vanilla', value: 'vanilla' },
        { label: 'K3s', value: 'k3s' },
        { label: 'K0s', value: 'k0s' },
        { label: 'RKE', value: 'rke' },
        { label: 'RKE2', value: 'rke2' },
        { label: 'EKS', value: 'eks' },
        { label: 'AKS', value: 'aks' },
        { label: 'GKE', value: 'gke' },
        { label: 'OpenShift', value: 'openshift' },
        { label: 'Rancher', value: 'rancher' },
        { label: 'MicroK8s', value: 'microk8s' },
        { label: 'Kubeadm', value: 'kubeadm' }
    ];

    const providerOptions = [
        { label: 'On-Premise', value: 'on-premise' },
        { label: 'AWS', value: 'aws' },
        { label: 'Azure', value: 'azure' },
        { label: 'GCP', value: 'gcp' },
        { label: 'Digital Ocean', value: 'digitalocean' },
        { label: 'Linode', value: 'linode' },
        { label: 'Other', value: 'other' }
    ];

    const networkPluginOptions = [
        { label: 'Calico', value: 'calico' },
        { label: 'Flannel', value: 'flannel' },
        { label: 'Cilium', value: 'cilium' },
        { label: 'Weave Net', value: 'weave' },
        { label: 'Canal', value: 'canal' },
        { label: 'Kube-router', value: 'kube-router' }
    ];

    return (
        <div className="space-y-6">
            <Breadcrumb />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Edit Kubernetes Cluster</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Update cluster configuration and settings
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-theme border border-island_border bg-island_background text-foreground hover:bg-accent/20 transition-colors"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-theme bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Main Edit Form */}
            <div className="rounded-theme border border-island_border bg-island_background p-6">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-island_border">
                    <div className="flex h-12 w-12 items-center justify-center rounded-theme bg-primary/10">
                        <span className="text-2xl">{renderDistributionIcon()}</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">
                            {cluster.cluster_name || 'Unknown Cluster'}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Cluster ID: {cluster.cluster_id}
                        </p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Basic Information Section */}
                    <div>
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                            Basic Information
                        </h3>
                        <div className="px-2 rounded-theme bg-accent/10">
                            <EditableFieldSection
                                fields={[
                                    { 
                                        label: 'Cluster ID', 
                                        value: cluster.cluster_id, 
                                        icon: '', 
                                        name: 'cluster_id',
                                        disabled: true
                                    },
                                    { 
                                        label: 'Cluster Name', 
                                        value: formData.cluster_name, 
                                        icon: '', 
                                        name: 'cluster_name',
                                        type: 'text',
                                        placeholder: 'Enter cluster name'
                                    },
                                    { 
                                        label: 'Status', 
                                        value: formData.cluster_status, 
                                        icon: '', 
                                        name: 'cluster_status',
                                        type: 'select',
                                        options: statusOptions
                                    },
                                    { 
                                        label: 'State', 
                                        value: formData.cluster_state, 
                                        icon: '', 
                                        name: 'cluster_state',
                                        type: 'select',
                                        options: stateOptions
                                    },
                                    { 
                                        label: 'Version', 
                                        value: formData.cluster_version, 
                                        icon: '', 
                                        name: 'cluster_version',
                                        type: 'text',
                                        placeholder: 'e.g., v1.28.0'
                                    },
                                    { 
                                        label: 'Distribution', 
                                        value: formData.distribution, 
                                        icon: '', 
                                        name: 'distribution',
                                        type: 'select',
                                        options: distributionOptions
                                    }
                                ]}
                                onChange={handleFieldChange}
                            />
                        </div>
                    </div>

                    {/* Provider & Location Section */}
                    <div>
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                            Provider & Location
                        </h3>
                        <div className="px-2 rounded-theme bg-accent/10">
                            <EditableFieldSection
                                fields={[
                                    { 
                                        label: 'Provider', 
                                        value: formData.provider, 
                                        icon: '', 
                                        name: 'provider',
                                        type: 'select',
                                        options: providerOptions
                                    },
                                    { 
                                        label: 'Region', 
                                        value: formData.region, 
                                        icon: '', 
                                        name: 'region',
                                        type: 'text',
                                        placeholder: 'e.g., us-east-1'
                                    },
                                    { 
                                        label: 'Data Center ID', 
                                        value: formData.data_center_id, 
                                        icon: '', 
                                        name: 'data_center_id',
                                        type: 'number',
                                        placeholder: '0'
                                    }
                                ]}
                                onChange={handleFieldChange}
                            />
                        </div>
                    </div>

                    {/* Network Configuration Section */}
                    <div>
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                            Network Configuration
                        </h3>
                        <div className="px-2 rounded-theme bg-accent/10">
                            <EditableFieldSection
                                fields={[
                                    { 
                                        label: 'API Server', 
                                        value: formData.api_server_endpoint, 
                                        icon: '', 
                                        name: 'api_server_endpoint',
                                        type: 'text',
                                        placeholder: 'https://api.cluster.example.com:6443'
                                    },
                                    { 
                                        label: 'Network Plugin', 
                                        value: formData.network_plugin, 
                                        icon: '', 
                                        name: 'network_plugin',
                                        type: 'select',
                                        options: networkPluginOptions
                                    },
                                    { 
                                        label: 'CNI Version', 
                                        value: formData.cni_version, 
                                        icon: '', 
                                        name: 'cni_version',
                                        type: 'text',
                                        placeholder: 'CNI version'
                                    },
                                    { 
                                        label: 'Storage Class', 
                                        value: formData.storage_class, 
                                        icon: '', 
                                        name: 'storage_class',
                                        type: 'text',
                                        placeholder: 'Storage class name'
                                    }
                                ]}
                                onChange={handleFieldChange}
                            />
                        </div>
                    </div>

                    {/* Node Configuration Section */}
                    <div>
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                            Node Configuration
                        </h3>
                        <div className="px-2 rounded-theme bg-accent/10">
                            <EditableFieldSection
                                fields={[
                                    { 
                                        label: 'Control Plane Nodes', 
                                        value: formData.control_plane_count, 
                                        icon: '', 
                                        name: 'control_plane_count',
                                        type: 'number',
                                        placeholder: '0'
                                    },
                                    { 
                                        label: 'Worker Nodes', 
                                        value: formData.worker_node_count, 
                                        icon: '', 
                                        name: 'worker_node_count',
                                        type: 'number',
                                        placeholder: '0'
                                    }
                                ]}
                                onChange={handleFieldChange}
                            />
                        </div>
                    </div>

                    {/* Features Section */}
                    <div>
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                            Cluster Features
                        </h3>
                        <div className="px-2 rounded-theme bg-accent/10">
                            <EditableFieldSection
                                fields={[
                                    { 
                                        label: 'Monitoring Enabled', 
                                        value: formData.monitoring_enabled ? 'true' : 'false', 
                                        icon: '', 
                                        name: 'monitoring_enabled',
                                        type: 'select',
                                        options: [
                                            { label: 'Yes', value: 'true' },
                                            { label: 'No', value: 'false' }
                                        ]
                                    },
                                    { 
                                        label: 'Logging Enabled', 
                                        value: formData.logging_enabled ? 'true' : 'false', 
                                        icon: '', 
                                        name: 'logging_enabled',
                                        type: 'select',
                                        options: [
                                            { label: 'Yes', value: 'true' },
                                            { label: 'No', value: 'false' }
                                        ]
                                    },
                                    { 
                                        label: 'Auto Scaling', 
                                        value: formData.auto_scaling_enabled ? 'true' : 'false', 
                                        icon: '', 
                                        name: 'auto_scaling_enabled',
                                        type: 'select',
                                        options: [
                                            { label: 'Yes', value: 'true' },
                                            { label: 'No', value: 'false' }
                                        ]
                                    },
                                    { 
                                        label: 'High Availability', 
                                        value: formData.ha_enabled ? 'true' : 'false', 
                                        icon: '', 
                                        name: 'ha_enabled',
                                        type: 'select',
                                        options: [
                                            { label: 'Yes', value: 'true' },
                                            { label: 'No', value: 'false' }
                                        ]
                                    }
                                ]}
                                onChange={handleFieldChange}
                            />
                        </div>
                    </div>

                    {/* Description Section */}
                    <div>
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                            Description
                        </h3>
                        <div className="px-2 rounded-theme bg-accent/10">
                            <EditableFieldSection
                                fields={[
                                    { 
                                        label: 'Description', 
                                        value: formData.description, 
                                        icon: '', 
                                        name: 'description',
                                        type: 'textarea',
                                        placeholder: 'Cluster description...'
                                    }
                                ]}
                                onChange={handleFieldChange}
                            />
                        </div>
                    </div>

                    {/* System Information Section (Read-only) */}
                    <div>
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                            System Information
                        </h3>
                        <div className="px-2 rounded-theme">
                            <EditableFieldSection
                                fields={[
                                    { 
                                        label: 'Created', 
                                        value: cluster.created_at ? new Date(cluster.created_at).toLocaleDateString() : 'N/A', 
                                        icon: '', 
                                        name: 'created_at',
                                        disabled: true
                                    },
                                    { 
                                        label: 'Last Updated', 
                                        value: cluster.updated_at ? new Date(cluster.updated_at).toLocaleDateString() : 'N/A', 
                                        icon: '', 
                                        name: 'updated_at',
                                        disabled: true
                                    },
                                    { 
                                        label: 'Last Inventory', 
                                        value: cluster.last_inventory_at ? new Date(cluster.last_inventory_at).toLocaleDateString() : 'N/A', 
                                        icon: '', 
                                        name: 'last_inventory_at',
                                        disabled: true
                                    },
                                    { 
                                        label: 'Total Pods', 
                                        value: cluster.total_pods || '0', 
                                        icon: '', 
                                        name: 'total_pods',
                                        disabled: true
                                    },
                                    { 
                                        label: 'Total Namespaces', 
                                        value: cluster.total_namespaces || '0', 
                                        icon: '', 
                                        name: 'total_namespaces',
                                        disabled: true
                                    }
                                ]}
                                onChange={handleFieldChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
