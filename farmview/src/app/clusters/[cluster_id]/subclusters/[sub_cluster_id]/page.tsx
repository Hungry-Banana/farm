"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSubClusterById, getSubClusterStats, getSubClusterWithServers } from "@/lib/clusters";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import FieldSection from "@/components/ui/FieldSection";
import TableSection from "@/components/ui/table/TableSection";
import { TabContainer, TabDefinition } from "@/components/ui/tab/TabContainer";
import SubClusterActionsDropdown from "@/components/ui/Buttons/SubClusterActionButton";

// Servers in sub-cluster
const ServersInventory = ({ servers }: { servers: any[] }) => {
  if (!servers || servers.length === 0) {
    return (
      <div className="p-5 text-center">
        <div className="text-muted-foreground">No servers found in this sub-cluster</div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <TableSection
        columns={[
          {
            key: "server_name",
            label: "Server Name",
            render: (value, server) => (
              <Link
                href={`/servers/${server.server_id}`}
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <span className="text-sm">🖥️</span>
                <span className="font-medium">{value || `Server ${server.server_id}`}</span>
              </Link>
            ),
          },
          { key: "server_id", label: "ID" },
          {
            key: "status",
            label: "Status",
            render: (value) => {
              const statusColors: Record<string, string> = {
                ACTIVE: "text-green-500 bg-green-500/10 border-green-500/20",
                INACTIVE: "text-red-500 bg-red-500/10 border-red-500/20",
                MAINTENANCE: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
                NEW: "text-blue-500 bg-blue-500/10 border-blue-500/20",
              };
              const colorClass =
                statusColors[value?.toUpperCase()] || "text-gray-500 bg-gray-500/10 border-gray-500/20";
              return (
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${colorClass}`}
                >
                  {value || "Unknown"}
                </span>
              );
            },
          },
          { key: "server_type", label: "Type" },
          { key: "manufacturer", label: "Manufacturer" },
          { key: "product_name", label: "Model" },
          { key: "environment_type", label: "Environment" },
          { key: "rack_position_id", label: "Rack Position" },
        ]}
        data={servers}
        keyField="server_id"
        searchable={true}
      />
    </div>
  );
};

// Sub-cluster statistics
const SubClusterStats = ({ stats }: { stats: any }) => {
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
        <div className="p-4 rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🖥️</span>
            <h3 className="text-lg font-semibold">Servers</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">{stats.total_servers ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active:</span>
              <span className="font-semibold text-green-600">{stats.active_servers ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inactive:</span>
              <span className="font-semibold text-red-600">{stats.inactive_servers ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-semibold">Capacity</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Capacity:</span>
              <span className="font-semibold">{stats.max_capacity ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Utilization:</span>
              <span className="font-semibold text-blue-600">
                {stats.max_capacity
                  ? `${Math.round((stats.total_servers / stats.max_capacity) * 100)}%`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const subClusterTabs: TabDefinition[] = [
  { id: "servers", label: "Servers", icon: "" },
  { id: "statistics", label: "Statistics", icon: "" },
];

export default function SubClusterPage() {
  const params = useParams();
  const subClusterId = parseInt(params.sub_cluster_id as string);
  const [subCluster, setSubCluster] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubCluster() {
      try {
        const [scData, scStats] = await Promise.all([
          getSubClusterById(subClusterId),
          getSubClusterStats(subClusterId),
        ]);

        const sc = Array.isArray(scData) ? scData[0] : scData;
        setSubCluster(sc);
        setStats(scStats);

        if (sc?.cluster_id) {
          const scServers = await getSubClusterWithServers(subClusterId, sc.cluster_id);
          setServers(scServers || []);
        }
      } catch (error) {
        console.error("Failed to load sub-cluster:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!isNaN(subClusterId)) {
      loadSubCluster();
    } else {
      setLoading(false);
    }
  }, [subClusterId]);

  const statusConfig: { [key: string]: { color: string; bg: string; border: string; icon: string } } = {
    ACTIVE: { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", icon: "✅" },
    INACTIVE: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: "🔴" },
    MAINTENANCE: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "🔧" },
    DEFAULT: { color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/20", icon: "❓" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading sub-cluster...</div>
      </div>
    );
  }

  if (!subCluster) {
    return <p className="text-center p-8">Sub-cluster data not found.</p>;
  }

  const currentStatus = statusConfig[subCluster.status] || statusConfig["DEFAULT"];

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div className="grid grid-cols-1 gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sub-Cluster Details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview and management of server sub-cluster
          </p>
        </div>

        {/* Sub-Cluster Information Card */}
        <div className="rounded-theme border border-island_border bg-island_background p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-island_border pb-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-theme bg-primary/10">
                <span className="text-2xl">📁</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mt-1">
                  {subCluster.sub_cluster_name || "Unknown Sub-Cluster"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-theme text-sm font-medium border ${currentStatus.color} ${currentStatus.bg} ${currentStatus.border}`}
                  >
                    <span className="mr-1">{currentStatus.icon}</span>
                    {subCluster.status || "Unknown"}
                  </span>
                  {subCluster.sub_cluster_code && (
                    <>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm font-mono bg-accent/20 px-2 py-1 rounded">
                        {subCluster.sub_cluster_code}
                      </span>
                    </>
                  )}
                  {subCluster.environment_type && (
                    <>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{subCluster.environment_type}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <SubClusterActionsDropdown
                subClusterId={subCluster.sub_cluster_id}
                clusterId={subCluster.cluster_id}
              />
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
                <div className="space-y-5 text-sm text-foreground font-mono">
                  <FieldSection
                    fields={[
                      { label: "Sub-Cluster ID", value: subCluster.sub_cluster_id, icon: "" },
                      { label: "Code", value: subCluster.sub_cluster_code, icon: "" },
                      { label: "Name", value: subCluster.sub_cluster_name, icon: "" },
                      { label: "Status", value: subCluster.status, icon: "" },
                      { label: "Type", value: subCluster.sub_cluster_type, icon: "" },
                      { label: "Environment", value: subCluster.environment_type, icon: "" },
                    ]}
                  />

                  <div className="border-t border-island_border my-3"></div>

                  <FieldSection
                    fields={[
                      { label: "Total Servers", value: subCluster.total_servers ?? "0", icon: "" },
                      { label: "Active Servers", value: subCluster.active_servers ?? "0", icon: "" },
                    ]}
                  />

                  <div className="border-t border-island_border my-3"></div>

                  <FieldSection
                    fields={[
                      {
                        label: "📅 Created",
                        value: subCluster.created_at
                          ? new Date(subCluster.created_at).toLocaleDateString()
                          : "N/A",
                        icon: "",
                      },
                      {
                        label: "🔄 Updated",
                        value: subCluster.updated_at
                          ? new Date(subCluster.updated_at).toLocaleDateString()
                          : "N/A",
                        icon: "",
                      },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
                <div className="space-y-4 text-sm text-foreground font-mono">
                  <FieldSection
                    fields={[
                      {
                        label: "Parent Cluster",
                        value: subCluster.cluster_id
                          ? String(subCluster.cluster_id)
                          : "N/A",
                        icon: "",
                      },
                    ]}
                  />

                  {subCluster.cluster_id && (
                    <div className="px-4 pb-2">
                      <Link
                        href={`/clusters/${subCluster.cluster_id}`}
                        className="text-primary hover:text-primary/80 text-sm transition-colors"
                      >
                        → View parent cluster
                      </Link>
                    </div>
                  )}

                  {subCluster.description && (
                    <>
                      <div className="border-t border-island_border my-3"></div>
                      <div className="space-y-2 px-4 pb-3">
                        <div className="font-medium text-muted-foreground">Description:</div>
                        <div className="text-foreground bg-accent/20 p-3 rounded-theme">
                          {subCluster.description}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-theme border border-island_border bg-island_background">
          <TabContainer
            tabs={subClusterTabs}
            defaultTab="servers"
            content={{
              servers: <ServersInventory servers={servers} />,
              statistics: <SubClusterStats stats={stats} />,
            }}
          />
        </div>
      </div>
    </div>
  );
}

