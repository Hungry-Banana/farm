"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import DBTableSection from "@/components/ui/table/DBTableSection";
import { getVMs } from "@/lib/vms";

export default function VMManagementPage() {
    const [vms, setVMs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Reorder VM object keys to control column display order
    const reorderVMKeys = (vms: any[], keyOrder: string[]) => {
        return vms.map(vm => {
            const ordered: any = {};
            keyOrder.forEach(key => {
                if (key in vm) ordered[key] = vm[key];
            });
            // Add any remaining keys not in keyOrder
            Object.keys(vm).forEach(key => {
                if (!(key in ordered)) ordered[key] = vm[key];
            });
            return ordered;
        });
    };

    useEffect(() => {
        const fetchVMs = async () => {
            try {
                setLoading(true);
                const response = await getVMs();
                
                // Define desired column order
                const desiredOrder = [
                    'vm_id',
                    'vm_name',
                    'server_id',
                    'vm_state',
                    'vm_status',
                    'hypervisor_type',
                    'guest_os_family',
                    'guest_os_version',
                    'vcpu_count',
                    'memory_mb',
                    'storage_gb',
                    'vm_uuid',
                    'enable_vnc',
                    'vnc_port',
                    'created_at',
                    'updated_at',
                    'started_at',
                    'stopped_at'
                ];
                
                // Extract and reorder the data array from the API response
                const orderedVMs = reorderVMKeys(response || [], desiredOrder);
                setVMs(orderedVMs);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch VMs');
            } finally {
                setLoading(false);
            }
        };

        fetchVMs();
    }, []);
    
    return (
        <div>   
            <Breadcrumb />

            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-theme bg-primary/10">
                    <span className="text-2xl">💻</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Virtual Machine Management</h1>
                    <p className="text-sm text-muted-foreground">Manage and monitor your virtual machine infrastructure</p>
                </div>
                </div>
            </div>

            {/* VM Table */}
            <div className="rounded-theme border border-island_border bg-island_background p-6">
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-muted-foreground">Loading virtual machines...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-red-500">Error: {error}</div>
                    </div>
                ) : (
                    <DBTableSection 
                        data={vms}
                        searchPlaceholder="Search virtual machines..."
                        keyField="vm_id"
                    />
                )}
            </div>
        </div>
    );
}