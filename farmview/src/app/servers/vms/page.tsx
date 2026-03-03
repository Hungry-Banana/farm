"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import DBTableSection, { SearchCriteria } from "@/components/ui/table/DBTableSection";
import VMCellContent from "@/components/ui/table/VMCellContent";
import { getVMsPaginated } from "@/lib/vms";

export default function VMManagementPage() {
    const [vms, setVMs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria[]>([]);
    const itemsPerPage = 15;

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
                
                // Convert SearchCriteria to the format expected by the API
                const formattedCriteria = searchCriteria.map((criterion, index) => ({
                    id: `search-${index}`,
                    column: criterion.column,
                    comparisonOperator: criterion.operator as any,
                    term: criterion.value,
                    operator: criterion.logicToNext || 'AND'
                }));
                
                const response = await getVMsPaginated(currentPage, itemsPerPage, {}, formattedCriteria);
                
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
                const orderedVMs = reorderVMKeys(response.data || [], desiredOrder);
                setVMs(orderedVMs);
                setTotalItems(response.total || 0);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch VMs');
            } finally {
                setLoading(false);
            }
        };

        fetchVMs();
    }, [currentPage, searchCriteria]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = (criteria: SearchCriteria[]) => {
        setSearchCriteria(criteria);
        setCurrentPage(1); // Reset to first page on new search
    };
    
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
                        cellContentRenderer={VMCellContent}
                        totalItems={totalItems}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        onSearch={handleSearch}
                        activeCriteria={searchCriteria}
                    />
                )}
            </div>
        </div>
    );
}