"use client";

import { useState, useEffect, useCallback } from "react";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import DBTableSection, { SearchCriteria } from "@/components/ui/table/DBTableSection";
import { getServersPaginated } from "@/lib/servers";
import ServerCellContent from "@/components/ui/table/ServerCellContent";


export default function ServerManagementPage() {
    const [servers, setServers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria[]>([]);
    const itemsPerPage = 15;

    // Reorder server object keys to control column display order
    const reorderServerKeys = (servers: any[], keyOrder: string[]) => {
        return servers.map(server => {
            const ordered: any = {};
            keyOrder.forEach(key => {
                if (key in server) ordered[key] = server[key];
            });
            // Add any remaining keys not in keyOrder
            Object.keys(server).forEach(key => {
                if (!(key in ordered)) ordered[key] = server[key];
            });
            return ordered;
        });
    };

    useEffect(() => {
        const fetchServers = async () => {
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
                
                const response = await getServersPaginated(currentPage, itemsPerPage, {}, formattedCriteria);
                
                // Define desired column order
                const desiredOrder = [
                    'server_id',
                    'server_name',
                    'status',
                    'state',
                    'stage',
                    'server_type',
                    'environment_type',
                    'manufacturer',
                    'product_name',
                    'serial_number',
                    'architecture',
                    'cluster_id',
                    'data_center_id',
                    'rack_id',
                    'rack_position_id',
                    'last_inventory_at',
                    'agent_version',
                    'created_at',
                    'updated_atasdfasd'
                ];
                
                // Extract and reorder the data array from the API response
                const orderedServers = reorderServerKeys(response.data || [], desiredOrder);
                setServers(orderedServers);
                setTotalItems(response.meta?.pagination?.total_count || 0);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch servers');
            } finally {
                setLoading(false);
                setInitialLoading(false);
            }
        };

        fetchServers();
    }, [currentPage, searchCriteria]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleSearch = useCallback((criteria: SearchCriteria[]) => {
        setSearchCriteria(criteria);
        setCurrentPage(1); // Reset to first page on new search
    }, []);
    
    return (
        <div>   
            <Breadcrumb />

            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-theme bg-primary/10">
                    <span className="text-2xl">🖥️</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Server Management</h1>
                    <p className="text-sm text-muted-foreground">Manage and monitor your physical server infrastructure</p>
                </div>
                </div>
            </div>

            {/* Server Table */}
            <div className="rounded-theme border border-island_border bg-island_background p-6">
                {initialLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-muted-foreground">Loading servers...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-red-500">Error: {error}</div>
                    </div>
                ) : (
                    <div className="relative">
                        {loading && (
                            <div className="absolute inset-0 bg-island_background/60 flex items-center justify-center z-10 rounded-theme">
                                <div className="text-muted-foreground text-sm">Loading...</div>
                            </div>
                        )}
                        <DBTableSection 
                            data={servers}
                            searchPlaceholder="Search servers..."
                            keyField="server_id"
                            cellContentRenderer={ServerCellContent}
                            totalItems={totalItems}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                            itemsPerPage={itemsPerPage}
                            onSearch={handleSearch}
                            activeCriteria={searchCriteria}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}