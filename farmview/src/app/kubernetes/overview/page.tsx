"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import TableSection from "@/components/ui/table/TableSection";
import { getClusterOverview, getClustersPaginated } from "@/lib/kubernetes";

// Cluster status colors mapping
const statusColors = {
  active: "text-green-500 bg-green-500/10 border-green-500/20",
  provisioning: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  error: "text-red-500 bg-red-500/10 border-red-500/20",
  maintenance: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  inactive: "text-gray-500 bg-gray-500/10 border-gray-500/20"
};

interface ClusterOverviewStats {
  total_clusters: number;
  active_clusters: number;
  total_nodes: number;
  total_pods: number;
  by_status: Array<{ name: string; count: number }>;
  by_version: Array<{ name: string; count: number }>;
}

export default function KubernetesOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [clusters, setClusters] = useState<any[]>([]);
  const [overviewStats, setOverviewStats] = useState<ClusterOverviewStats>({
    total_clusters: 0,
    active_clusters: 0,
    total_nodes: 0,
    total_pods: 0,
    by_status: [],
    by_version: []
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, clustersData] = await Promise.all([
          getClusterOverview(),
          getClustersPaginated(1, 10)
        ]);
        
        if (statsData) {
          setOverviewStats({
            total_clusters: statsData.total_clusters || 0,
            active_clusters: statsData.active_clusters || 0,
            total_nodes: statsData.total_nodes || 0,
            total_pods: statsData.total_pods || 0,
            by_status: Array.isArray(statsData.by_status) 
              ? statsData.by_status.map((item: any) => ({ name: item[0] || item.name, count: item[1] || item.count }))
              : [],
            by_version: Array.isArray(statsData.by_version)
              ? statsData.by_version.map((item: any) => ({ name: item[0] || item.name, count: item[1] || item.count }))
              : []
          });
        }

        if (clustersData?.data) {
          setClusters(clustersData.data);
        }
      } catch (error) {
        console.error('Failed to load Kubernetes data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto">
        <Breadcrumb />
        <div className="rounded-theme border border-island_border bg-island_background p-6 text-center">
          <div className="text-2xl mb-4">⏳</div>
          <p className="text-foreground">Loading Kubernetes overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Breadcrumb />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Kubernetes Overview</h1>
        <p className="text-muted-foreground">Monitor and manage your Kubernetes clusters</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Clusters */}
        <div className="rounded-theme border border-island_border bg-island_background p-6">
          <h3 className="text-2xl font-bold text-foreground mb-1">
            {overviewStats.total_clusters}
          </h3>
          <p className="text-sm text-muted-foreground">Total Clusters</p>
          <p className="text-xs text-green-500 mt-2">
            {overviewStats.active_clusters} active
          </p>
        </div>

        {/* Total Nodes */}
        <div className="rounded-theme border border-island_border bg-island_background p-6">
          <h3 className="text-2xl font-bold text-foreground mb-1">
            {overviewStats.total_nodes}
          </h3>
          <p className="text-sm text-muted-foreground">Total Nodes</p>
        </div>

        {/* Total Pods */}
        <div className="rounded-theme border border-island_border bg-island_background p-6">
          <h3 className="text-2xl font-bold text-foreground mb-1">
            {overviewStats.total_pods}
          </h3>
          <p className="text-sm text-muted-foreground">Total Pods</p>
        </div>

        {/* Cluster Versions */}
        <div className="rounded-theme border border-island_border bg-island_background p-6">
          <h3 className="text-2xl font-bold text-foreground mb-1">
            {overviewStats.by_version.length}
          </h3>
          <p className="text-sm text-muted-foreground">Versions</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution */}
        <div className="rounded-theme border border-island_border bg-island_background p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Clusters by Status</h3>
          <div className="space-y-3">
            {overviewStats.by_status.map((status, index) => {
              const percentage = overviewStats.total_clusters > 0 
                ? (status.count / overviewStats.total_clusters * 100).toFixed(1) 
                : 0;
              const colorClass = statusColors[status.name.toLowerCase() as keyof typeof statusColors] 
                || statusColors.inactive;

              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-foreground capitalize">{status.name}</span>
                    <span className="text-sm font-medium text-foreground">{status.count}</span>
                  </div>
                  <div className="w-full bg-muted/20 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colorClass.split(' ')[0].replace('text-', 'bg-')}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Version Distribution */}
        <div className="rounded-theme border border-island_border bg-island_background p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Clusters by Version</h3>
          <div className="space-y-3">
            {overviewStats.by_version.map((version, index) => {
              const percentage = overviewStats.total_clusters > 0 
                ? (version.count / overviewStats.total_clusters * 100).toFixed(1) 
                : 0;

              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-foreground">{version.name}</span>
                    <span className="text-sm font-medium text-foreground">{version.count}</span>
                  </div>
                  <div className="w-full bg-muted/20 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Clusters */}
      <div className="mb-6">
        <div className="rounded-theme border border-island_border bg-island_background p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Clusters</h3>
          <TableSection 
            columns={[
              { key: 'cluster_name', label: 'Cluster Name' },
              { key: 'status', label: 'Status' },
              { key: 'version', label: 'Version' },
              { key: 'api_server_endpoint', label: 'API Server' }
            ]}
            data={clusters}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a 
          href="/kubernetes"
          className="rounded-theme border border-island_border bg-island_background p-6 hover:bg-island_background/80 transition-colors"
        >
          <h4 className="font-semibold text-foreground mb-3">Manage Clusters</h4>
          <p className="text-sm text-muted-foreground">
            View and manage all Kubernetes clusters
          </p>
        </a>

        <a 
          href="/kubernetes"
          className="rounded-theme border border-island_border bg-island_background p-6 hover:bg-island_background/80 transition-colors"
        >
          <h4 className="font-semibold text-foreground mb-3">View Workloads</h4>
          <p className="text-sm text-muted-foreground">
            Monitor deployments, pods, and services
          </p>
        </a>

        <a 
          href="/kubernetes"
          className="rounded-theme border border-island_border bg-island_background p-6 hover:bg-island_background/80 transition-colors"
        >
          <h4 className="font-semibold text-foreground mb-3">Monitor Resources</h4>
          <p className="text-sm text-muted-foreground">
            Check resource usage and health metrics
          </p>
        </a>
      </div>
    </div>
  );
}
