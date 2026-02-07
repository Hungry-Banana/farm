"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import TableSection from "@/components/ui/table/TableSection";
import { getServers, getServerOverview } from "@/lib/servers";

// Status colors mapping
const statusColors = {
  ACTIVE: "text-green-500 bg-green-500/10 border-green-500/20",
  MAINTENANCE: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", 
  INACTIVE: "text-red-500 bg-red-500/10 border-red-500/20",
  OFFLINE: "text-gray-500 bg-gray-500/10 border-gray-500/20"
};

// Environment colors mapping
const environmentColors = {
  production: "text-red-500 bg-red-500/10 border-red-500/20",
  prod: "text-red-500 bg-red-500/10 border-red-500/20",
  staging: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  stage: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  development: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  dev: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  testing: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  test: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  integration: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  unknown: "text-gray-500 bg-gray-500/10 border-gray-500/20"
};

interface ServerOverviewStats {
  total_servers: number;
  active_servers: number;
  inactive_servers: number;
  maintenance_servers: number;
  by_server_type: Array<{ name: string; count: number }>;
  by_status: Array<{ name: string; count: number }>;
  by_environment: Array<{ name: string; count: number }>;
  total_cpu_cores?: number;
  total_ram_gb?: number;
  total_storage_gb?: number;
}

export default function ServersOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [servers, setServers] = useState<any[]>([]);
  const [overviewStats, setOverviewStats] = useState<ServerOverviewStats>({
    total_servers: 0,
    active_servers: 0,
    inactive_servers: 0,
    maintenance_servers: 0,
    by_server_type: [],
    by_status: [],
    by_environment: [],
    total_cpu_cores: 0,
    total_ram_gb: 0,
    total_storage_gb: 0
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [serversData, statsData] = await Promise.all([
          getServers(),
          getServerOverview()
        ]);
        
        setServers(serversData || []);
        setOverviewStats(statsData || {
          total_servers: 0,
          active_servers: 0,
          inactive_servers: 0,
          maintenance_servers: 0,
          by_server_type: [],
          by_status: [],
          by_environment: [],
          total_cpu_cores: 0,
          total_ram_gb: 0,
          total_storage_gb: 0
        });
      } catch (error) {
        console.error('Failed to load server data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Prepare pie chart data from server status distribution
  const preparePieChartData = () => {
    if (overviewStats.by_status && overviewStats.by_status.length > 0) {
      return overviewStats.by_status.map((item) => {
        let color = '#6B7280'; // default gray
        switch (item.name.toLowerCase()) {
          case 'active':
            color = '#10B981'; // green
            break;
          case 'maintenance':
            color = '#F59E0B'; // yellow
            break;
          case 'inactive':
          case 'offline':
            color = '#EF4444'; // red
            break;
        }
        
        return {
          name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
          value: item.count,
          color: color
        };
      });
    }

    // Fallback to calculate from servers array if no by_status data
    const statusCounts = servers.reduce((acc: any, server: any) => {
      const status = server.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => {
      let color = '#6B7280';
      switch (status.toLowerCase()) {
        case 'active':
          color = '#10B981';
          break;
        case 'maintenance':
          color = '#F59E0B';
          break;
        case 'inactive':
        case 'offline':
          color = '#EF4444';
          break;
      }
      
      return {
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count as number,
        color: color
      };
    });
  };

  // Prepare environment pie chart data
  const prepareEnvironmentPieChartData = () => {
    if (overviewStats.by_environment && overviewStats.by_environment.length > 0) {
      return overviewStats.by_environment.map((item) => {
        let color = '#6B7280'; // default gray
        switch (item.name.toLowerCase()) {
          case 'production':
          case 'prod':
            color = '#DC2626'; // red for production
            break;
          case 'staging':
          case 'stage':
            color = '#F59E0B'; // amber for staging
            break;
          case 'development':
          case 'dev':
            color = '#059669'; // emerald for dev
            break;
          case 'testing':
          case 'test':
            color = '#7C3AED'; // purple for testing
            break;
          case 'integration':
            color = '#2563EB'; // blue for integration
            break;
          default:
            color = '#6B7280'; // gray for others
        }
        
        return {
          name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
          value: item.count,
          color: color
        };
      });
    }

    // Fallback to calculate from servers array if no by_environment data
    const environmentCounts = servers.reduce((acc: any, server: any) => {
      const environment = server.environment_type || 'unknown';
      acc[environment] = (acc[environment] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(environmentCounts).map(([environment, count]) => {
      let color = '#6B7280';
      switch (environment.toLowerCase()) {
        case 'production':
        case 'prod':
          color = '#DC2626';
          break;
        case 'staging':
        case 'stage':
          color = '#F59E0B';
          break;
        case 'development':
        case 'dev':
          color = '#059669';
          break;
        case 'testing':
        case 'test':
          color = '#7C3AED';
          break;
        case 'integration':
          color = '#2563EB';
          break;
        default:
          color = '#6B7280';
      }
      
      return {
        name: environment.charAt(0).toUpperCase() + environment.slice(1),
        value: count as number,
        color: color
      };
    });
  };

  // Prepare server type pie chart data
  const prepareServerTypePieChartData = () => {
    if (overviewStats.by_server_type && overviewStats.by_server_type.length > 0) {
      return overviewStats.by_server_type.map((item) => {
        let color = '#6B7280';
        switch (item.name.toUpperCase()) {
          case 'BAREMETAL':
            color = '#3B82F6'; // blue
            break;
          case 'HOST':
            color = '#10B981'; // green
            break;
          case 'STORAGE':
            color = '#F59E0B'; // amber
            break;
          case 'COMPUTE':
            color = '#8B5CF6'; // purple
            break;
          default:
            color = '#6B7280'; // gray for unknown
        }
        
        return {
          name: item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase(),
          value: item.count,
          color: color
        };
      });
    }

    // Fallback to calculate from servers array
    const typeCounts = servers.reduce((acc: any, server: any) => {
      const serverType = server.server_type || 'unknown';
      acc[serverType] = (acc[serverType] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(typeCounts).map(([type, count]) => {
      let color = '#6B7280';
      switch (type.toUpperCase()) {
        case 'BAREMETAL':
          color = '#3B82F6'; // blue
          break;
        case 'HOST':
          color = '#10B981'; // green
          break;
        case 'STORAGE':
          color = '#F59E0B'; // amber
          break;
        case 'COMPUTE':
          color = '#8B5CF6'; // purple
          break;
        default:
          color = '#6B7280'; // gray for unknown
      }
      
      return {
        name: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
        value: count as number,
        color: color
      };
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto ">
        <Breadcrumb />
        <div className="rounded-theme border border-island_border bg-island_background p-6 text-center">
          <div className="text-2xl mb-4">⏳</div>
          <p className="text-foreground">Loading server overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto ">
      <Breadcrumb />
      
      <div className="grid gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Servers Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor and manage your server infrastructure
            </p>
          </div>
        </div>

        {/* Server Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-theme border border-island_border bg-island_background p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Servers</p>
                <p className="text-2xl font-bold text-foreground">
                  {overviewStats.total_servers || servers.length}
                </p>
              </div>
              <div className="text-2xl">🖥️</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {overviewStats.active_servers || servers.filter(s => s.status?.toLowerCase() === 'active').length} active
            </p>
          </div>

          <div className="rounded-theme border border-island_border bg-island_background p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total CPU Cores</p>
                <p className="text-2xl font-bold text-foreground">
                  {overviewStats.total_cpu_cores || 0}
                </p>
              </div>
              <div className="text-2xl">🧠</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Across all servers</p>
          </div>

          <div className="rounded-theme border border-island_border bg-island_background p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total RAM</p>
                <p className="text-2xl font-bold text-foreground">
                  {overviewStats.total_ram_gb || 0} GB
                </p>
              </div>
              <div className="text-2xl">💾</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Across all servers</p>
          </div>

          <div className="rounded-theme border border-island_border bg-island_background p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Storage</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round((overviewStats.total_storage_gb || 0) / 1024)} TB
                </p>
              </div>
              <div className="text-2xl">🗄️</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Across all servers</p>
          </div>
        </div>

        {/* Servers Table */}
        <div className="rounded-theme border border-island_border bg-island_background p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Servers</h2>
            <span className="text-sm text-muted-foreground">
              {servers.length} servers found
            </span>
          </div>

          {servers.length > 0 ? (
            <TableSection
              columns={[
                {
                  key: 'server',
                  label: 'Server',
                  render: (value, server) => (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🖥️</span>
                      <div>
                        <p className="font-medium text-foreground">
                          {server.server_name || `Server ${server.server_id}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {server.server_id}
                        </p>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'manufacturer',
                  label: 'Manufacturer',
                  render: (value) => (
                    <span className="font-mono text-sm text-foreground">
                      {value || 'N/A'}
                    </span>
                  )
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (value) => (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${statusColors[value as keyof typeof statusColors] || 'text-gray-500 bg-gray-500/10 border-gray-500/20'}`}>
                      {value || 'unknown'}
                    </span>
                  )
                },
                {
                  key: 'environment_type',
                  label: 'Environment',
                  render: (value) => (
                    <span className={`inline-flex items-center px-2 py-1 rounded-theme text-xs font-medium border ${environmentColors[value?.toLowerCase() as keyof typeof environmentColors] || environmentColors.unknown}`}>
                      {value || 'Unknown'}
                    </span>
                  )
                },
              ]}
              data={servers.slice(0, 10)}
              keyField="server_id"
              searchable={false}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">�️</div>
              <p>No servers found</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-theme border border-island_border bg-island_background p-4 hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🖥️</span>
              <h3 className="font-medium text-foreground">Manage Servers</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure server settings, resources, and maintenance
            </p>
          </div>

          <div className="rounded-theme border border-island_border bg-island_background p-4 hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🗄️</span>
              <h3 className="font-medium text-foreground">Storage Management</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage disks, backups, and storage allocation
            </p>
          </div>

          <div className="rounded-theme border border-island_border bg-island_background p-4 hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">💾</span>
              <h3 className="font-medium text-foreground">Resource Monitoring</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              View real-time CPU, RAM, and storage usage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}