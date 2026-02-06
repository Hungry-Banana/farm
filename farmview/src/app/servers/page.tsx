"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import DBTableSection from "@/components/ui/table/DBTableSection";
import { getServersPaginated } from "@/lib/servers";
import ServerCellContent from "@/components/ui/table/ServerCellContent";


export default function ServerManagementPage() {
    const [servers, setServers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                const response = await getServersPaginated();
                
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
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch servers');
            } finally {
                setLoading(false);
            }
        };

        fetchServers();
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
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-muted-foreground">Loading servers...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-red-500">Error: {error}</div>
                    </div>
                ) : (
                    <DBTableSection 
                        data={servers}
                        searchPlaceholder="Search servers..."
                        keyField="server_id"
                        cellContentRenderer={ServerCellContent}
                    />
                )}
            </div>
        </div>
    );
}