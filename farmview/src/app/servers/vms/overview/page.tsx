"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import TableSection from "@/components/ui/table/TableSection";
import { getVMOverview } from "@/lib/vms";

// VM State colors mapping
const stateColors = {
  running: "text-green-500 bg-green-500/10 border-green-500/20",
  stopped: "text-red-500 bg-red-500/10 border-red-500/20",
  paused: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  suspended: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  crashed: "text-red-700 bg-red-700/10 border-red-700/20",
  unknown: "text-gray-500 bg-gray-500/10 border-gray-500/20"
};

// VM Status colors mapping
const statusColors = {
  active: "text-green-500 bg-green-500/10 border-green-500/20",
  inactive: "text-gray-500 bg-gray-500/10 border-gray-500/20",
  maintenance: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  migrating: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  backup: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  error: "text-red-500 bg-red-500/10 border-red-500/20"
};

interface VMOverviewStats {
  total_vms: number;
  running_vms: number;
  stopped_vms: number;
  paused_vms: number;
  by_hypervisor: Array<{ name: string; count: number }>;
  by_state: Array<{ name: string; count: number }>;
  by_os_family: Array<{ name: string; count: number }>;
  total_vcpus?: number;
  total_memory_mb?: number;
  total_storage_gb?: number;
}

export default function VMOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [vms, setVMs] = useState<any[]>([]);
  const [overviewStats, setOverviewStats] = useState<VMOverviewStats>({
    total_vms: 0,
    running_vms: 0,
    stopped_vms: 0,
    paused_vms: 0,
    by_hypervisor: [],
    by_state: [],
    by_os_family: [],
    total_vcpus: 0,
    total_memory_mb: 0,
    total_storage_gb: 0
  });

  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await getVMOverview();
        
        if (statsData) {
          // Transform the API response to match our component's expected format
          setOverviewStats({
            total_vms: statsData.total_vms || 0,
            running_vms: statsData.running_vms || 0,
            stopped_vms: statsData.stopped_vms || 0,
            paused_vms: 0, // Not in API response
            by_hypervisor: Array.isArray(statsData.by_hypervisor) 
              ? statsData.by_hypervisor.map((item: any) => ({ name: item[0] || item.name, count: item[1] || item.count }))
              : [],
            by_state: Array.isArray(statsData.by_state)
              ? statsData.by_state.map((item: any) => ({ name: item[0] || item.name, count: item[1] || item.count }))
              : [],
            by_os_family: [], // Not in current API response
            total_vcpus: statsData.total_vcpus || 0,
            total_memory_mb: statsData.total_memory_gb ? statsData.total_memory_gb * 1024 : 0,
            total_storage_gb: statsData.total_storage_gb || 0
          });
        }
      } catch (error) {
        console.error('Failed to load VM data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto ">
        <Breadcrumb />
        <div className="rounded-theme border border-island_border bg-island_background p-6 text-center">
          <div className="text-2xl mb-4">⏳</div>
          <p className="text-foreground">Loading VM overview...</p>
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
            <h1 className="text-2xl font-bold text-foreground">Virtual Machines Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor and manage your virtual machine infrastructure
            </p>
          </div>
        </div>

        {/* VM Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-theme border border-island_border bg-island_background p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total VMs</p>
                <p className="text-2xl font-bold text-foreground">
                  {overviewStats.total_vms || vms.length}
                </p>
              </div>
              <div className="text-2xl">💻</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {overviewStats.running_vms || vms.filter(v => v.vm_state?.toLowerCase() === 'running').length} running
            </p>
          </div>

          <div className="rounded-theme border border-island_border bg-island_background p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total vCPUs</p>
                <p className="text-2xl font-bold text-foreground">
                  {overviewStats.total_vcpus || 0}
                </p>
              </div>
              <div className="text-2xl">🧠</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Across all VMs</p>
          </div>

          <div className="rounded-theme border border-island_border bg-island_background p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Memory</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round((overviewStats.total_memory_mb || 0) / 1024)} GB
                </p>
              </div>
              <div className="text-2xl">💾</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Allocated memory</p>
          </div>

          <div className="rounded-theme border border-island_border bg-island_background p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Storage</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round((overviewStats.total_storage_gb || 0))} GB
                </p>
              </div>
              <div className="text-2xl">🗄️</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Allocated storage</p>
          </div>
        </div>

        {/* VMs Table */}
        <div className="rounded-theme border border-island_border bg-island_background p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Virtual Machines</h2>
            <span className="text-sm text-muted-foreground">
              {vms.length} VMs found
            </span>
          </div>

          {vms.length > 0 ? (
            <TableSection
              columns={[
                {
                  key: 'vm',
                  label: 'Virtual Machine',
                  render: (value, vm) => (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💻</span>
                      <div>
                        <p className="font-medium text-foreground">
                          {vm.vm_name || `VM ${vm.vm_id}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {vm.vm_id}
                        </p>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'hypervisor_type',
                  label: 'Hypervisor',
                  render: (value) => (
                    <span className="font-mono text-sm text-foreground">
                      {value || 'N/A'}
                    </span>
                  )
                },
                {
                  key: 'vm_state',
                  label: 'State',
                  render: (value) => (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${stateColors[value as keyof typeof stateColors] || stateColors.unknown}`}>
                      {value || 'unknown'}
                    </span>
                  )
                },
                {
                  key: 'guest_os_family',
                  label: 'OS',
                  render: (value, vm) => (
                    <span className="text-sm text-foreground">
                      {value || 'Unknown'} {vm.guest_os_version && `(${vm.guest_os_version})`}
                    </span>
                  )
                },
                {
                  key: 'vcpu_count',
                  label: 'vCPUs',
                  render: (value) => (
                    <span className="text-sm text-foreground">
                      {value || 0}
                    </span>
                  )
                },
                {
                  key: 'memory_mb',
                  label: 'Memory',
                  render: (value) => (
                    <span className="text-sm text-foreground">
                      {Math.round((value || 0) / 1024)} GB
                    </span>
                  )
                },
              ]}
              data={vms.slice(0, 10)}
              keyField="vm_id"
              searchable={false}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">💻</div>
              <p>No virtual machines found</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-theme border border-island_border bg-island_background p-4 hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">💻</span>
              <h3 className="font-medium text-foreground">Manage VMs</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Create, configure, and manage virtual machines
            </p>
          </div>

          <div className="rounded-theme border border-island_border bg-island_background p-4 hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📸</span>
              <h3 className="font-medium text-foreground">Snapshots</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage VM snapshots and restore points
            </p>
          </div>

          <div className="rounded-theme border border-island_border bg-island_background p-4 hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔄</span>
              <h3 className="font-medium text-foreground">Migration</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Migrate VMs between host servers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
