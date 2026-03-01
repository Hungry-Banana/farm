"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import DBTableSection from "@/components/ui/table/DBTableSection";
import { getClustersPaginated } from "@/lib/kubernetes";
import KubernetesCellContent from "@/components/ui/table/KubernetesCellContent";


export default function KubernetesManagementPage() {
    const [clusters, setClusters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                const response = await getClustersPaginated();
                
                // Define desired column order
                const desiredOrder = [
                    'cluster_id',
                    'cluster_name',
                    'cluster_version',
                    'cluster_state',
                    'cluster_status',
                    'api_server_endpoint',
                    'control_plane_count',
                    'worker_node_count',
                    'total_pods',
                    'total_namespaces',
                    'network_plugin',
                    'storage_class',
                    'monitoring_enabled',
                    'logging_enabled',
                    'auto_scaling_enabled',
                    'description',
                    'created_at',
                    'updated_at'
                ];
                
                // Extract and reorder the data array from the API response
                const orderedClusters = reorderClusterKeys(response.data || [], desiredOrder);
                setClusters(orderedClusters);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch clusters');
            } finally {
                setLoading(false);
            }
        };

        fetchClusters();
    }, []);
    
    return (
        <div>   
            <Breadcrumb />

            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-theme bg-primary/10">
                    <span className="text-2xl">☸️</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Kubernetes Cluster Management</h1>
                    <p className="text-sm text-muted-foreground">Manage and monitor your Kubernetes cluster infrastructure</p>
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
                        cellContentRenderer={KubernetesCellContent}
                    />
                )}
            </div>
        </div>
    );
}
