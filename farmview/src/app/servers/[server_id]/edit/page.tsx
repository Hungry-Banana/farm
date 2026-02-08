"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DefaultServerIcon } from "@/assets/icons";
import { getServerById, updateServer } from "@/lib/servers";
import { ServerWithAllComponents } from "@/types/server";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import EditableFieldSection from "@/components/ui/EditableFieldSection";
import { useNotification } from "@/contexts/NotificationContext";

export default function ServerEditPage() {
    const params = useParams();
    const router = useRouter();
    const { addNotification } = useNotification();
    const serverId = parseInt(params.server_id as string);
    const [serverData, setServerData] = useState<ServerWithAllComponents | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        async function loadServer() {
            try {
                const data = await getServerById(serverId);
                setServerData(data);
                
                // Initialize form data from server data
                const server = Array.isArray(data) ? data[0] : data;
                setFormData({
                    server_name: server.server_name || '',
                    status: server.status || 'INACTIVE',
                    state: server.state || 'UNKNOWN',
                    environment_type: server.environment_type || '',
                    stage: server.stage || '',
                    server_type: server.server_type || '',
                    data_center_id: server.data_center_id || 0,
                    cluster_id: server.cluster_id || 0,
                    rack_id: server.rack_id || 0,
                    sub_cluster_id: server.sub_cluster_id || 0,
                    rack_position_id: server.rack_position_id || 0,
                    manufacturer: server.manufacturer || '',
                    product_name: server.product_name || '',
                    serial_number: server.serial_number || '',
                    architecture: server.architecture || '',
                    chassis_serial_number: server.chassis_serial_number || '',
                    agent_version: server.agent_version || '',
                });
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

    const handleFieldChange = (name: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await updateServer(serverId, formData);
            
            if (result) {
                addNotification({
                    title: 'Success',
                    message: 'Server updated successfully',
                    type: 'success'
                });
                // Navigate back to server detail page after successful save
                router.push(`/servers/${serverId}`);
            } else {
                addNotification({
                    title: 'Error',
                    message: 'Failed to save changes - no response from server',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Failed to save server:', error);
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
        router.push(`/servers/${serverId}`);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Breadcrumb />
                <div className="rounded-theme border border-island_border bg-island_background p-6 text-center">
                    <div className="text-2xl mb-4">⏳</div>
                    <p className="text-foreground">Loading server data...</p>
                </div>
            </div>
        );
    }

    const server = Array.isArray(serverData) ? serverData[0] : serverData;

    if (!server) {
        return (
            <div className="space-y-6">
                <Breadcrumb />
                <div className="rounded-theme border border-island_border bg-island_background p-6 text-center">
                    <div className="text-4xl mb-4">❌</div>
                    <p className="text-foreground">Server not found</p>
                </div>
            </div>
        );
    }

    const statusOptions = [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
        { label: 'Maintenance', value: 'MAINTENANCE' },
        { label: 'RMA', value: 'RMA' },
        { label: 'Decommissioned', value: 'DECOMMISSIONED' }
    ];

    const stateOptions = [
        { label: 'New', value: 'NEW' },
        { label: 'Onboarding', value: 'ONBOARDING' },
        { label: 'Provisioning', value: 'PROVISIONING' },
        { label: 'Running', value: 'RUNNING' },
        { label: 'Suspended', value: 'SUSPENDED' },
        { label: 'Deprovisioning', value: 'DEPROVISIONING' },
        { label: 'Failed', value: 'FAILED' }
    ];

    const environmentTypeOptions = [
        { label: 'Production', value: 'PRODUCTION' },
        { label: 'Development', value: 'DEVELOPMENT' },
        { label: 'QA', value: 'QA' },
        { label: 'Staging', value: 'STAGING' },
        { label: 'Testing', value: 'TESTING' }
    ];

    const stageOptions = [
        { label: 'None', value: 'NONE' },
        { label: 'Discovery', value: 'DISCOVERY' },
        { label: 'Allocate Resources', value: 'ALLOCATE_RESOURCES' },
        { label: 'Install OS', value: 'INSTALL_OS' },
        { label: 'Configure Network', value: 'CONFIGURE_NETWORK' },
        { label: 'Wipe Disks', value: 'WIPE_DISKS' },
        { label: 'Wipe NIC Config', value: 'WIPE_NIC_CONFIG' },
        { label: 'Release IPs', value: 'RELEASE_IPS' },
        { label: 'Finalize', value: 'FINALIZE' }
    ];

    const serverTypeOptions = [
        { label: 'Bare Metal', value: 'BAREMETAL' },
        { label: 'Host', value: 'HOST' },
        { label: 'Storage', value: 'STORAGE' },
        { label: 'Compute', value: 'COMPUTE' }
    ];

    return (
        <div className="space-y-6">
            <Breadcrumb />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Edit Server</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Update server configuration and details
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
                        <DefaultServerIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">
                            {server.server_name || 'Unknown Server'}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Server ID: {server.server_id}
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
                                        label: 'Server ID', 
                                        value: server.server_id, 
                                        icon: '', 
                                        name: 'server_id',
                                        disabled: true
                                    },
                                    { 
                                        label: 'Status', 
                                        value: formData.status, 
                                        icon: '', 
                                        name: 'status',
                                        type: 'select',
                                        options: statusOptions
                                    },
                                    { 
                                        label: 'Server Name', 
                                        value: formData.server_name, 
                                        icon: '', 
                                        name: 'server_name',
                                        type: 'text',
                                        placeholder: 'Enter server name'
                                    },
                                    { 
                                        label: 'State', 
                                        value: formData.state, 
                                        icon: '', 
                                        name: 'state',
                                        type: 'select',
                                        options: stateOptions
                                    },
                                    { 
                                        label: 'Environment Type', 
                                        value: formData.environment_type, 
                                        icon: '', 
                                        name: 'environment_type',
                                        type: 'select',
                                        options: environmentTypeOptions
                                    },
                                    { 
                                        label: 'Stage', 
                                        value: formData.stage, 
                                        icon: '', 
                                        name: 'stage',
                                        type: 'select',
                                        options: stageOptions
                                    },
                                    { 
                                        label: 'Server Type', 
                                        value: formData.server_type, 
                                        icon: '', 
                                        name: 'server_type',
                                        type: 'select',
                                        options: serverTypeOptions
                                    }
                                ]}
                                onChange={handleFieldChange}
                            />
                        </div>
                    </div>

                    {/* Location & Placement Section */}
                    <div>
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                            Location & Cluster
                        </h3>
                        <div className="px-2 rounded-theme bg-accent/10">
                            <EditableFieldSection
                                fields={[
                                    { 
                                        label: 'Data Center ID', 
                                        value: formData.data_center_id, 
                                        icon: '', 
                                        name: 'data_center_id',
                                        type: 'number',
                                        placeholder: '0'
                                    },
                                    { 
                                        label: 'Cluster ID', 
                                        value: formData.cluster_id, 
                                        icon: '', 
                                        name: 'cluster_id',
                                        type: 'number',
                                        placeholder: '0'
                                    },
                                    { 
                                        label: 'Rack ID', 
                                        value: formData.rack_id, 
                                        icon: '', 
                                        name: 'rack_id',
                                        type: 'number',
                                        placeholder: '0'
                                    },
                                    { 
                                        label: 'Sub Cluster ID', 
                                        value: formData.sub_cluster_id, 
                                        icon: '', 
                                        name: 'sub_cluster_id',
                                        type: 'number',
                                        placeholder: '0'
                                    },
                                    { 
                                        label: 'Rack Position', 
                                        value: formData.rack_position_id, 
                                        icon: '', 
                                        name: 'rack_position_id',
                                        type: 'number',
                                        placeholder: '0'
                                    }
                                ]}
                                onChange={handleFieldChange}
                            />
                        </div>
                    </div>

                    {/* Hardware Details Section */}
                    <div>
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                            Hardware Details
                        </h3>
                        <div className="px-2 rounded-theme bg-accent/10">
                            <EditableFieldSection
                                fields={[
                                    { 
                                        label: 'Manufacturer', 
                                        value: formData.manufacturer, 
                                        icon: '', 
                                        name: 'manufacturer',
                                        type: 'text',
                                        placeholder: 'e.g., Dell, HP, Supermicro'
                                    },
                                    { 
                                        label: 'Product Name', 
                                        value: formData.product_name, 
                                        icon: '', 
                                        name: 'product_name',
                                        type: 'text',
                                        placeholder: 'Product model name'
                                    },
                                    { 
                                        label: 'Serial Number', 
                                        value: formData.serial_number, 
                                        icon: '', 
                                        name: 'serial_number',
                                        type: 'text',
                                        placeholder: 'Serial number'
                                    },
                                    { 
                                        label: 'Architecture', 
                                        value: formData.architecture, 
                                        icon: '', 
                                        name: 'architecture',
                                        type: 'text',
                                        placeholder: 'e.g., x86_64, ARM'
                                    },
                                    { 
                                        label: 'Chassis Serial', 
                                        value: formData.chassis_serial_number, 
                                        icon: '', 
                                        name: 'chassis_serial_number',
                                        type: 'text',
                                        placeholder: 'Chassis serial number'
                                    }
                                ]}
                                onChange={handleFieldChange}
                            />
                        </div>
                    </div>

                    {/* System Information Section */}
                    <div>
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                            Inventory Information
                        </h3>
                        <div className="px-2 rounded-theme">
                            <EditableFieldSection
                                fields={[
                                    { 
                                        label: 'Agent Version', 
                                        value: formData.agent_version, 
                                        icon: '', 
                                        name: 'agent_version',
                                        type: 'text',
                                        placeholder: 'Agent version'
                                    },
                                    { 
                                        label: 'Last Updated', 
                                        value: server.updated_at ? new Date(server.updated_at).toLocaleDateString() : 'N/A', 
                                        icon: '', 
                                        name: 'updated_at',
                                        disabled: true
                                    },
                                    { 
                                        label: 'Last Inventory', 
                                        value: server.last_inventory_at ? new Date(server.last_inventory_at).toLocaleDateString() : 'N/A', 
                                        icon: '', 
                                        name: 'last_inventory_at',
                                        disabled: true
                                    },
                                    { 
                                        label: 'Created Date', 
                                        value: server.created_at ? new Date(server.created_at).toLocaleDateString() : 'N/A', 
                                        icon: '', 
                                        name: 'created_at',
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
