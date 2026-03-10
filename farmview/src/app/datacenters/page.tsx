"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import DBTableSection, { SearchCriteria } from "@/components/ui/table/DBTableSection";
import { getDatacentersPaginated } from "@/lib/datacenters";
import DatacenterCellContent from "@/components/ui/table/DatacenterCellContent";


export default function DatacenterManagementPage() {
    const [datacenters, setDatacenters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria[]>([]);
    const itemsPerPage = 15;

    // Reorder datacenter object keys to control column display order
    const reorderDatacenterKeys = (datacenters: any[], keyOrder: string[]) => {
        return datacenters.map(datacenter => {
            const ordered: any = {};
            keyOrder.forEach(key => {
                if (key in datacenter) ordered[key] = datacenter[key];
            });
            // Add any remaining keys not in keyOrder
            Object.keys(datacenter).forEach(key => {
                if (!(key in ordered)) ordered[key] = datacenter[key];
            });
            return ordered;
        });
    };

    useEffect(() => {
        const fetchDatacenters = async () => {
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
                
                const response = await getDatacentersPaginated(currentPage, itemsPerPage, {}, formattedCriteria);
                
                // Define desired column order
                const desiredOrder = [
                    'data_center_id',
                    'data_center_name',
                    'data_center_code',
                    'status',
                    'tier_level',
                    'region',
                    'country',
                    'city',
                    'state_province',
                    'address',
                    'postal_code',
                    'provider',
                    'provider_facility_id',
                    'total_floor_space_sqm',
                    'power_capacity_kw',
                    'cooling_capacity_kw',
                    'facility_manager',
                    'contact_email',
                    'contact_phone',
                    'emergency_contact',
                    'emergency_phone',
                    'timezone',
                    'latitude',
                    'longitude',
                    'operating_hours',
                    'created_at',
                    'updated_at'
                ];
                
                // Extract and reorder the data array from the API response
                const orderedDatacenters = reorderDatacenterKeys(response.data || [], desiredOrder);
                setDatacenters(orderedDatacenters);
                setTotalItems(response.total || 0);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch datacenters');
            } finally {
                setLoading(false);
            }
        };

        fetchDatacenters();
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
                    <span className="text-2xl">🏢</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Datacenter Management</h1>
                    <p className="text-sm text-muted-foreground">Manage and monitor your datacenter facilities and infrastructure</p>
                </div>
                </div>
            </div>

            {/* Datacenter Table */}
            <div className="rounded-theme border border-island_border bg-island_background p-6">
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-muted-foreground">Loading datacenters...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-red-500">Error: {error}</div>
                    </div>
                ) : (
                    <DBTableSection 
                        data={datacenters}
                        searchPlaceholder="Search datacenters..."
                        keyField="data_center_id"
                        cellContentRenderer={DatacenterCellContent}
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
