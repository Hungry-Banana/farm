"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getClusterById, getClusterWithSubClusters, getClusterWithServers, getClusterStatsById } from "@/lib/clusters";
import { getSwitchesByCluster } from "@/lib/switches";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import FieldSection from "@/components/ui/FieldSection";
import TableSection from "@/components/ui/table/TableSection";
import { TabContainer, TabDefinition } from "@/components/ui/tab/TabContainer";
import ClusterActionsDropdown from "@/components/ui/Buttons/ClusterActionButton";

// Cluster Servers Component
const ServersInventory = ({ servers }: { servers: any[] }) => {
  if (!servers || servers.length === 0) {
    return (
      <div className="p-5 text-center">
        <div className="text-muted-foreground">No servers found in this cluster</div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <TableSection
        columns={[
          {
            key: 'server_name',
            label: 'Server Name',
            render: (value, server) => (
              <Link 
                href={`/servers/${server.server_id}`}
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <span className="text-sm">🖥️</span>
                <span className="font-medium">{value || `Server ${server.server_id}`}</span>
              </Link>
            )
          },
          { key: 'server_id', label: 'ID' },
          {
            key: 'status',
            label: 'Status',
            render: (value) => {
              const statusColors: Record<string, string> = {
                ACTIVE: 'text-green-500 bg-green-500/10 border-green-500/20',
                INACTIVE: 'text-red-500 bg-red-500/10 border-red-500/20',
                MAINTENANCE: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
                NEW: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
              };
              const colorClass = statusColors[value?.toUpperCase()] || 'text-gray-500 bg-gray-500/10 border-gray-500/20';
              return (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${colorClass}`}>
                  {value || 'Unknown'}
                </span>
              );
            }
          },
          { key: 'server_type', label: 'Type' },
          { key: 'manufacturer', label: 'Manufacturer' },
          { key: 'product_name', label: 'Model' },
          { key: 'environment_type', label: 'Environment' },
          { key: 'rack_position_id', label: 'Rack Position' },
        ]}
        data={servers}
        keyField="server_id"
        searchable={true}
      />
    </div>
  );
};

// Cluster Switches Component
const SwitchesInventory = ({ switches }: { switches: any[] }) => {
  if (!switches || switches.length === 0) {
    return (
      <div className="p-5 text-center">
        <div className="text-muted-foreground">No switches found in this cluster</div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <TableSection
        columns={[
          {
            key: 'switch_name',
            label: 'Switch Name',
            render: (value, sw) => (
              <Link
                href={`/networking/switches/${sw.switch_id}`}
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <span className="text-sm">🔀</span>
                <span className="font-medium">{value || `Switch ${sw.switch_id}`}</span>
              </Link>
            )
          },
          { key: 'switch_id', label: 'ID' },
          {
            key: 'status',
            label: 'Status',
            render: (value) => {
              const statusColors: Record<string, string> = {
                ACTIVE: 'text-green-500 bg-green-500/10 border-green-500/20',
                INACTIVE: 'text-red-500 bg-red-500/10 border-red-500/20',
                MAINTENANCE: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
                NEW: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
              };
              const colorClass = statusColors[value?.toUpperCase()] || 'text-gray-500 bg-gray-500/10 border-gray-500/20';
              return (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${colorClass}`}>
                  {value || 'Unknown'}
                </span>
              );
            }
          },
          { key: 'switch_role', label: 'Role' },
          { key: 'mgmt_ip_address', label: 'Mgmt IP' },
          { key: 'os_type', label: 'OS' },
          { key: 'environment_type', label: 'Environment' },
        ]}
        data={switches}
        keyField="switch_id"
        searchable={true}
      />
    </div>
  );
};

// Cluster Sub-Clusters Component
const SubClustersInventory = ({ subClusters }: { subClusters: any[] }) => {
  if (!subClusters || subClusters.length === 0) {
    return (
      <div className="p-5 text-center">
        <div className="text-muted-foreground">No sub-clusters found in this cluster</div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <TableSection
        columns={[
          {
            key: 'sub_cluster_name',
            label: 'Sub-Cluster Name',
            render: (value, subCluster) => (
              <Link 
                href={`/clusters/subclusters/${subCluster.sub_cluster_id}`}
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <span className="text-sm">📁</span>
                <span className="font-medium">{value || `Sub-Cluster ${subCluster.sub_cluster_id}`}</span>
              </Link>
            )
          },
          { key: 'sub_cluster_id', label: 'ID' },
          { key: 'sub_cluster_code', label: 'Code' },
          {
            key: 'status',
            label: 'Status',
            render: (value) => {
              const statusColors: Record<string, string> = {
                ACTIVE: 'text-green-500 bg-green-500/10 border-green-500/20',
                INACTIVE: 'text-red-500 bg-red-500/10 border-red-500/20',
                MAINTENANCE: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
              };
              const colorClass = statusColors[value?.toUpperCase()] || 'text-gray-500 bg-gray-500/10 border-gray-500/20';
              return (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${colorClass}`}>
                  {value || 'Unknown'}
                </span>
              );
            }
          },
          { key: 'sub_cluster_type', label: 'Type' },
          { key: 'total_servers', label: 'Total Servers' },
          { key: 'active_servers', label: 'Active Servers' },
          { key: 'description', label: 'Description' },
        ]}
        data={subClusters}
        keyField="sub_cluster_id"
        searchable={true}
      />
    </div>
  );
};

// Cluster Statistics Component
const ClusterStats = ({ stats }: { stats: any }) => {
  if (!stats) {
    return (
      <div className="p-5 text-center">
        <div className="text-muted-foreground">No statistics available</div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Servers Statistics */}
        <div className="p-4 rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🖥️</span>
            <h3 className="text-lg font-semibold">Servers</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">{stats.total_servers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active:</span>
              <span className="font-semibold text-green-600">{stats.active_servers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inactive:</span>
              <span className="font-semibold text-red-600">{stats.inactive_servers || 0}</span>
            </div>
          </div>
        </div>

        {/* Sub-Clusters Statistics */}
        <div className="p-4 rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📁</span>
            <h3 className="text-lg font-semibold">Sub-Clusters</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">{stats.total_sub_clusters || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active:</span>
              <span className="font-semibold text-green-600">{stats.active_sub_clusters || 0}</span>
            </div>
          </div>
        </div>

        {/* Capacity Statistics */}
        <div className="p-4 rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-semibold">Capacity</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Capacity:</span>
              <span className="font-semibold">{stats.max_capacity || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Utilization:</span>
              <span className="font-semibold text-blue-600">
                {stats.max_capacity 
                  ? `${Math.round((stats.total_servers / stats.max_capacity) * 100)}%`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const clusterTabs: TabDefinition[] = [
  { id: "servers", label: "Servers", icon: "" },
  { id: "switches", label: "Switches", icon: "" },
  { id: "sub-clusters", label: "Sub-Clusters", icon: "" },
  { id: "statistics", label: "Statistics", icon: "" },
];

export default function ClusterPage() {
  const params = useParams();
  const clusterId = parseInt(params.cluster_id as string);
  const [clusterData, setClusterData] = useState<any>(null);
  const [clusterWithServers, setClusterWithServers] = useState<any>(null);
  const [clusterWithSubClusters, setClusterWithSubClusters] = useState<any>(null);
  const [clusterSwitches, setClusterSwitches] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCluster() {
      try {
        const [clData, clWithServers, clWithSubClusters, clStats, clSwitches] = await Promise.all([
          getClusterById(clusterId),
          getClusterWithServers(clusterId),
          getClusterWithSubClusters(clusterId),
          getClusterStatsById(clusterId),
          getSwitchesByCluster(clusterId),
        ]);
        setClusterData(clData);
        setClusterWithServers(clWithServers);
        setClusterWithSubClusters(clWithSubClusters);
        setClusterSwitches(clSwitches || []);
        setStats(clStats);
      } catch (error) {
        console.error('Failed to load cluster:', error);
      } finally {
        setLoading(false);
      }
    }

    if (!isNaN(clusterId)) {
      loadCluster();
    } else {
      setLoading(false);
    }
  }, [clusterId]);

  const cluster = Array.isArray(clusterData) ? clusterData[0] : clusterData;

  const statusConfig: { [key: string]: { color: string; bg: string; border: string; icon: string } } = {
    'ACTIVE': { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: '✅' },
    'INACTIVE': { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: '🔴' },
    'MAINTENANCE': { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: '🔧' },
    'CONSTRUCTION': { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: '🏗️' },
    'DECOMMISSIONED': { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: '⚫' },
    'DEFAULT': { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: '❓' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading cluster...</div>
        </div>
      </div>
    );
  }

  if (!cluster) {
    return <p className="text-center p-8">Cluster data not found.</p>;
  }

  const currentStatus = statusConfig[cluster.status] || statusConfig['DEFAULT'];

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Main Content: Cluster Details */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cluster Details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview and management of server cluster
          </p>
        </div>

        {/* Cluster Information Card */}
        <div className="rounded-theme border border-island_border bg-island_background p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-island_border pb-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-theme bg-primary/10">
                <span className="text-2xl">🗂️</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mt-1">
                  {cluster.cluster_name || 'Unknown Cluster'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-theme text-sm font-medium border ${currentStatus.color} ${currentStatus.bg} ${currentStatus.border}`}>
                    <span className="mr-1">{currentStatus.icon}</span>
                    {cluster.status || 'Unknown'}
                  </span>
                  {cluster.cluster_code && (
                    <>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm font-mono bg-accent/20 px-2 py-1 rounded">
                        {cluster.cluster_code}
                      </span>
                    </>
                  )}
                  {cluster.environment_type && (
                    <>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{cluster.environment_type}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <ClusterActionsDropdown clusterId={cluster.cluster_id} />
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Column: Basic Information */}
            <div className="space-y-6">
              <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
                <div className="space-y-5 text-sm text-foreground font-mono">
                  {/* Basic Information Section */}
                  <FieldSection fields={[
                    { label: 'Cluster ID', value: cluster.cluster_id, icon: '' },
                    { label: 'Code', value: cluster.cluster_code, icon: '' },
                    { label: 'Name', value: cluster.cluster_name, icon: '' },
                    { label: 'Status', value: cluster.status, icon: '' },
                    { label: 'Environment', value: cluster.environment_type, icon: '' },
                  ]} />

                  {/* Separator Line */}
                  <div className="border-t border-island_border my-3"></div>

                  {/* Capacity & Servers */}
                  <FieldSection fields={[
                    { label: 'Max Capacity', value: cluster.max_capacity || 'N/A', icon: '' },
                    { label: 'Total Servers', value: cluster.total_servers || '0', icon: '' },
                    { label: 'Active Servers', value: cluster.active_servers || '0', icon: '' },
                  ]} />

                  {/* Separator Line */}
                  <div className="border-t border-island_border my-3"></div>

                  {/* Location Information */}
                  <FieldSection fields={[
                    { label: 'Datacenter ID', value: cluster.data_center_id || 'N/A', icon: '' },
                    { label: 'Region', value: cluster.region, icon: '' },
                    { label: 'Availability Zone', value: cluster.availability_zone, icon: '' },
                  ]} />

                  {/* Separator Line */}
                  <div className="border-t border-island_border my-3"></div>

                  {/* Timestamps */}
                  <FieldSection fields={[
                    { 
                      label: '📅 Created', 
                      value: cluster.created_at 
                        ? new Date(cluster.created_at).toLocaleDateString() 
                        : 'N/A', 
                      icon: '' 
                    },
                    { 
                      label: '🔄 Updated', 
                      value: cluster.updated_at 
                        ? new Date(cluster.updated_at).toLocaleDateString() 
                        : 'N/A', 
                      icon: '' 
                    },
                  ]} />
                </div>
              </div>
            </div>

            {/* Right Column: Contact & Additional Information */}
            <div className="space-y-6">
              <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
                <div className="space-y-4 text-sm text-foreground font-mono">

                  {/* Contact Information */}
                  <FieldSection fields={[
                    { label: 'Owner', value: cluster.owner, icon: '' },
                    { label: 'Contact Email', value: cluster.contact_email, icon: '' },
                  ]} />

                  {/* Separator Line */}
                  <div className="border-t border-island_border my-3"></div>

                  {/* Description */}
                  {cluster.description && (
                    <>
                      <div className="space-y-2">
                        <div className="font-medium text-muted-foreground">Description:</div>
                        <div className="text-foreground bg-accent/20 p-3 rounded-theme">
                          {cluster.description}
                        </div>
                      </div>
                      <div className="border-t border-island_border my-3"></div>
                    </>
                  )}

                  {/* Additional Metadata */}
                  <FieldSection fields={[
                    { label: 'Cluster Type', value: cluster.cluster_type || 'N/A', icon: '' },
                    { label: 'Network Zone', value: cluster.network_zone || 'N/A', icon: '' },
                  ]} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Servers, Sub-Clusters, and Statistics */}
        <div className="rounded-theme border border-island_border bg-island_background">
          <TabContainer
            tabs={clusterTabs}
            defaultTab="servers"
            content={{
              "servers": <ServersInventory servers={clusterWithServers?.servers || []} />,
              "switches": <SwitchesInventory switches={clusterSwitches} />,
              "sub-clusters": <SubClustersInventory subClusters={clusterWithSubClusters?.sub_clusters || []} />,
              "statistics": <ClusterStats stats={stats} />,
            }}
          />
        </div>
      </div>
    </div>
  );
}
