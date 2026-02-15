"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DefaultServerIcon } from "@/assets/icons";
import { getVMById, updateVM } from "@/lib/vms";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import EditableFieldSection from "@/components/ui/EditableFieldSection";
import { useNotification } from "@/contexts/NotificationContext";

export default function VMEditPage() {
    const params = useParams();
    const router = useRouter();
    const { addNotification } = useNotification();
    const vmId = parseInt(params.vm_id as string);
    const [vmData, setVMData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        async function loadVM() {
            try {
                const data = await getVMById(vmId);
                setVMData(data);
                
                // Initialize form data from VM data
                const vm = Array.isArray(data) ? data[0] : data;
                setFormData({
                    vm_name: vm.vm_name || '',
                    vm_state: vm.vm_state || 'unknown',
                    vm_status: vm.vm_status || 'unknown',
                    hypervisor_type: vm.hypervisor_type || '',
                    guest_os_family: vm.guest_os_family || '',
                    guest_os_version: vm.guest_os_version || '',
                    guest_os_distribution: vm.guest_os_distribution || '',
                    vcpu_count: vm.vcpu_count || 0,
                    memory_mb: vm.memory_mb || 0,
                    storage_gb: vm.storage_gb || 0,
                    enable_vnc: vm.enable_vnc || false,
                    vnc_port: vm.vnc_port || null,
                    vm_uuid: vm.vm_uuid || '',
                    instance_uuid: vm.instance_uuid || ''
                });
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

    const handleFieldChange = (name: string, value: any) => {
        // Convert string 'true'/'false' to boolean for enable_vnc
        let processedValue = value;
        if (name === 'enable_vnc') {
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
            const result = await updateVM(vmId, formData);
            
            if (result) {
                addNotification({
                    title: 'Success',
                    message: 'VM updated successfully',
                    type: 'success'
                });
                // Navigate back to VM detail page after successful save
                router.push(`/servers/vms/${vmId}`);
            } else {
                addNotification({
                    title: 'Error',
                    message: 'Failed to save changes - no response from server',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Failed to save VM:', error);
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
        router.push(`/servers/vms/${vmId}`);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Breadcrumb />
                <div className="rounded-theme border border-island_border bg-island_background p-6 text-center">
                    <div className="text-2xl mb-4">⏳</div>
                    <p className="text-foreground">Loading VM data...</p>
                </div>
            </div>
        );
    }

    const vm = Array.isArray(vmData) ? vmData[0] : vmData;

    if (!vm) {
        return (
            <div className="space-y-6">
                <Breadcrumb />
                <div className="rounded-theme border border-island_border bg-island_background p-6 text-center">
                    <div className="text-4xl mb-4">❌</div>
                    <p className="text-foreground">VM not found</p>
                </div>
            </div>
        );
    }

    const stateOptions = [
        { label: 'Running', value: 'running' },
        { label: 'Stopped', value: 'stopped' },
        { label: 'Paused', value: 'paused' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Unknown', value: 'unknown' }
    ];

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Error', value: 'error' },
        { label: 'Unknown', value: 'unknown' }
    ];

    const hypervisorOptions = [
        { label: 'KVM', value: 'kvm' },
        { label: 'VMware', value: 'vmware' },
        { label: 'Xen', value: 'xen' },
        { label: 'Hyper-V', value: 'hyperv' },
        { label: 'QEMU', value: 'qemu' },
        { label: 'Other', value: 'other' }
    ];

    const osOptions = [
        { label: 'Linux', value: 'linux' },
        { label: 'Windows', value: 'windows' },
        { label: 'FreeBSD', value: 'freebsd' },
        { label: 'Other', value: 'other' }
    ];

    return (
        <div className="space-y-6">
            <Breadcrumb />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Edit Virtual Machine</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Update VM configuration and details
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
                            {vm.vm_name || `VM ${vm.vm_id}`}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            VM ID: {vm.vm_id}
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
                                        label: 'VM ID', 
                                        value: vm.vm_id, 
                                        icon: '', 
                                        name: 'vm_id',
                                        disabled: true
                                    },
                                    { 
                                        label: 'VM Name', 
                                        value: formData.vm_name, 
                                        icon: '', 
                                        name: 'vm_name',
                                        type: 'text',
                                        placeholder: 'Enter VM name'
                                    },
                                    { 
                                        label: 'VM State', 
                                        value: formData.vm_state, 
                                        icon: '', 
                                        name: 'vm_state',
                                        type: 'select',
                                        options: stateOptions
                                    },
                                    { 
                                        label: 'VM Status', 
                                        value: formData.vm_status, 
                                        icon: '', 
                                        name: 'vm_status',
                                        type: 'select',
                                        options: statusOptions
                                    },
                                    { 
                                        label: 'Hypervisor Type', 
                                        value: formData.hypervisor_type, 
                                        icon: '', 
                                        name: 'hypervisor_type',
                                        type: 'select',
                                        options: hypervisorOptions
                                    },
                                    { 
                                        label: 'Server ID', 
                                        value: vm.server_id, 
                                        icon: '', 
                                        name: 'server_id',
                                        disabled: true
                                    }
                                ]}
                                onChange={handleFieldChange}
                            />
                        </div>
                    </div>

                    {/* Guest OS Section */}
                    <div>
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                            Guest Operating System
                        </h3>
                        <div className="px-2 rounded-theme bg-accent/10">
                            <EditableFieldSection
                                fields={[
                                    { 
                                        label: 'OS Family', 
                                        value: formData.guest_os_family, 
                                        icon: '', 
                                        name: 'guest_os_family',
                                        type: 'select',
                                        options: osOptions
                                    },
                                    { 
                                        label: 'OS Version', 
                                        value: formData.guest_os_version, 
                                        icon: '', 
                                        name: 'guest_os_version',
                                        type: 'text',
                                        placeholder: 'e.g., 22.04, Server 2019'
                                    },
                                    { 
                                        label: 'OS Distribution', 
                                        value: formData.guest_os_distribution, 
                                        icon: '', 
                                        name: 'guest_os_distribution',
                                        type: 'text',
                                        placeholder: 'e.g., Ubuntu, CentOS, Windows'
                                    }
                                ]}
                                onChange={handleFieldChange}
                            />
                        </div>
                    </div>

                    {/* Resource Configuration Section */}
                    <div>
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                            Resource Configuration
                        </h3>
                        <div className="px-2 rounded-theme bg-accent/10">
                            <EditableFieldSection
                                fields={[
                                    { 
                                        label: 'vCPU Count', 
                                        value: formData.vcpu_count, 
                                        icon: '', 
                                        name: 'vcpu_count',
                                        type: 'number',
                                        placeholder: '0'
                                    },
                                    { 
                                        label: 'Memory (MB)', 
                                        value: formData.memory_mb, 
                                        icon: '', 
                                        name: 'memory_mb',
                                        type: 'number',
                                        placeholder: '0'
                                    },
                                    { 
                                        label: 'Memory (GB)', 
                                        value: formData.memory_mb ? Math.round(formData.memory_mb / 1024) : 0, 
                                        icon: '', 
                                        name: 'memory_gb_display',
                                        disabled: true
                                    },
                                    { 
                                        label: 'Storage (GB)', 
                                        value: formData.storage_gb, 
                                        icon: '', 
                                        name: 'storage_gb',
                                        type: 'number',
                                        placeholder: '0'
                                    }
                                ]}
                                onChange={handleFieldChange}
                            />
                        </div>
                    </div>

                    {/* VNC Configuration Section */}
                    <div>
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                            VNC Configuration
                        </h3>
                        <div className="px-2 rounded-theme bg-accent/10">
                            <EditableFieldSection
                                fields={[
                                    { 
                                        label: 'Enable VNC', 
                                        value: formData.enable_vnc ? 'true' : 'false', 
                                        icon: '', 
                                        name: 'enable_vnc',
                                        type: 'select',
                                        options: [
                                            { label: 'Yes', value: 'true' },
                                            { label: 'No', value: 'false' }
                                        ]
                                    },
                                    { 
                                        label: 'VNC Port', 
                                        value: formData.vnc_port, 
                                        icon: '', 
                                        name: 'vnc_port',
                                        type: 'number',
                                        placeholder: 'VNC port number'
                                    }
                                ]}
                                onChange={handleFieldChange}
                            />
                        </div>
                    </div>

                    {/* VM Identification Section */}
                    <div>
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center gap-2">
                            VM Identification
                        </h3>
                        <div className="px-2 rounded-theme">
                            <EditableFieldSection
                                fields={[
                                    { 
                                        label: 'VM UUID', 
                                        value: formData.vm_uuid, 
                                        icon: '', 
                                        name: 'vm_uuid',
                                        type: 'text',
                                        placeholder: 'VM UUID'
                                    },
                                    { 
                                        label: 'Instance UUID', 
                                        value: formData.instance_uuid, 
                                        icon: '', 
                                        name: 'instance_uuid',
                                        type: 'text',
                                        placeholder: 'Instance UUID'
                                    },
                                    { 
                                        label: 'Created At', 
                                        value: vm.created_at ? new Date(vm.created_at).toLocaleString() : 'N/A', 
                                        icon: '', 
                                        name: 'created_at',
                                        disabled: true
                                    },
                                    { 
                                        label: 'Updated At', 
                                        value: vm.updated_at ? new Date(vm.updated_at).toLocaleString() : 'N/A', 
                                        icon: '', 
                                        name: 'updated_at',
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
