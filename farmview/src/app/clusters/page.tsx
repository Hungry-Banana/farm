"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import DBTableSection, { SearchCriteria } from "@/components/ui/table/DBTableSection";
import { getClustersPaginated } from "@/lib/clusters";
import ClusterCellContent from "@/components/ui/table/ClusterCellContent";


export default function ClusterManagementPage() {
    const [clusters, setClusters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria[]>([]);
    const itemsPerPage = 15;

    // Reorder cluster object keys to control column display order
    const reorderClusterKeys = (clusters: any[], keyOrder: string[]) => {
        return clusters.map(cluster => {
            const ordered: any = {};
            keyOrder.forEach(key => {
                if (key in cluster) ordered[key] = cluster[key];
            });
            // Add any remaining keys not in keyOrder
            Object.keys(cluster).forEach(key => {
                if (!(key in ordered)) ordered[key] = cluster[key];
            });
            return ordered;
        });
    };

    useEffect(() => {
        const fetchClusters = async () => {
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
                
                const response = await getClustersPaginated(currentPage, itemsPerPage, {}, formattedCriteria);
                
                // Define desired column order
                const desiredOrder = [
                    'cluster_id',
                    'cluster_name',
                    'cluster_code',
                    'status',
                    'environment_type',
                    'data_center_id',
                    'region',
                    'availability_zone',
                    'max_capacity',
                    'total_servers',
                    'active_servers',
                    'owner',
                    'contact_email',
                    'description',
                    'created_at',
                    'updated_at'
                ];
                
                // Extract and reorder the data array from the API response
                const orderedClusters = reorderClusterKeys(response.data || [], desiredOrder);
                setClusters(orderedClusters);
                setTotalItems(response.total || 0);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch clusters');
            } finally {
                setLoading(false);
            }
        };

        fetchClusters();
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
                    <span className="text-2xl">🗂️</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Cluster Management</h1>
                    <p className="text-sm text-muted-foreground">Manage and monitor your server clusters and sub-clusters</p>
                </div>
                </div>
            </div>

            {/* Cluster Table */}
            <div className="rounded-theme border border-island_border bg-island_background p-6">
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-muted-foreground">Loading clusters...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-red-500">Error: {error}</div>
                    </div>
                ) : (
                    <DBTableSection 
                        data={clusters}
                        searchPlaceholder="Search clusters..."
                        keyField="cluster_id"
                        cellContentRenderer={ClusterCellContent}
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
