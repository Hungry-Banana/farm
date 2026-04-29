"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import { getServerOverview } from "@/lib/servers";
import { getVMOverview } from "@/lib/vms";
import { getSwitchStats } from "@/lib/switches";
import { getClusterOverview } from "@/lib/kubernetes";
import { getDatacenters } from "@/lib/datacenters";
import { getClusters } from "@/lib/clusters";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";

// ── Color maps ──────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#10B981",
  active: "#10B981",
  Active: "#10B981",
  INACTIVE: "#EF4444",
  inactive: "#EF4444",
  Inactive: "#EF4444",
  MAINTENANCE: "#F59E0B",
  maintenance: "#F59E0B",
  Maintenance: "#F59E0B",
  NEW: "#3B82F6",
  new: "#3B82F6",
  New: "#3B82F6",
  RMA: "#8B5CF6",
};

const VM_STATE_COLORS: Record<string, string> = {
  Running: "#10B981",
  running: "#10B981",
  Stopped: "#EF4444",
  stopped: "#EF4444",
  Paused: "#F59E0B",
  paused: "#F59E0B",
  Suspended: "#3B82F6",
  suspended: "#3B82F6",
  Unknown: "#6B7280",
  unknown: "#6B7280",
};

const ENV_COLORS = ["#DC2626", "#F59E0B", "#059669", "#7C3AED", "#2563EB", "#6B7280"];
const CHART_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#EC4899"];

// ── Normalise data arrays that may be {name,count} objects or [name,count] tuples
function normalize(arr: any[]): { name: string; count: number }[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => ({
    name: (Array.isArray(item) ? item[0] : item.name) ?? "Unknown",
    count: (Array.isArray(item) ? item[1] : item.count) ?? 0,
  }));
}

// ── Shared tooltip style (explicit colours — CSS vars like --island-background
// resolve to near-transparent in this theme, so we use hardcoded values)
const tooltipStyle = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "6px",
  fontSize: "12px",
  color: "#f1f5f9",
};
const tooltipItemStyle = { color: "#f1f5f9" };
const tooltipLabelStyle = { color: "#cbd5e1" };

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  subColor = "text-muted-foreground",
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-theme border border-island_border bg-island_background p-5 hover:bg-accent/20 transition-colors h-full">
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className={`text-xs mt-2 ${subColor}`}>{sub}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}

// ── Donut / pie chart ─────────────────────────────────────────────────────────
function DonutChart({
  data,
  title,
  colorMap,
}: {
  data: { name: string; count: number }[];
  title: string;
  colorMap?: Record<string, string>;
}) {
  const pieData = data.map((d, i) => ({
    name: d.name,
    value: d.count,
    fill:
      colorMap?.[d.name] ??
      colorMap?.[d.name.toLowerCase()] ??
      colorMap?.[d.name.toUpperCase()] ??
      CHART_COLORS[i % CHART_COLORS.length],
  }));

  const total = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-theme border border-island_border bg-island_background p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4">Total: {total.toLocaleString()}</p>
      {total === 0 ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="45%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={tooltipItemStyle}
              labelStyle={tooltipLabelStyle}
              wrapperStyle={{ outline: 'none' }}
            />
            <Legend
              iconSize={10}
              formatter={(value) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Horizontal bar chart ──────────────────────────────────────────────────────
function HBarChart({
  data,
  title,
  colors = CHART_COLORS,
}: {
  data: { name: string; count: number }[];
  title: string;
  colors?: string[];
}) {
  return (
    <div className="rounded-theme border border-island_border bg-island_background p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4">
        {data.length} {data.length === 1 ? "category" : "categories"}
      </p>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 38)}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ left: 4, right: 48, top: 4, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(127,127,127,0.15)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "rgba(127,127,127,0.8)" }}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "rgba(127,127,127,0.8)" }}
              width={100}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={tooltipItemStyle}
              labelStyle={tooltipLabelStyle}
              wrapperStyle={{ outline: 'none' }}
              cursor={{ fill: 'rgba(148,163,184,0.08)' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              <LabelList
                dataKey="count"
                position="right"
                style={{ fontSize: 11, fill: "rgba(127,127,127,0.8)" }}
              />
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [serverStats, setServerStats] = useState<any>({});
  const [vmStats, setVmStats] = useState<any>({});
  const [switchStats, setSwitchStats] = useState<any>({});
  const [k8sStats, setK8sStats] = useState<any>({});
  const [datacenterCount, setDatacenterCount] = useState(0);
  const [clusterCount, setClusterCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [srv, vm, sw, k8s, dcs, cls] = await Promise.all([
          getServerOverview(),
          getVMOverview(),
          getSwitchStats(),
          getClusterOverview(),
          getDatacenters(),
          getClusters(),
        ]);
        setServerStats(srv ?? {});
        setVmStats(vm ?? {});
        setSwitchStats(sw ?? {});
        setK8sStats(k8s ?? {});
        setDatacenterCount(Array.isArray(dcs) ? dcs.length : 0);
        setClusterCount(Array.isArray(cls) ? cls.length : 0);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Derived chart data ──────────────────────────────────────────────────
  const serverByStatus = normalize(serverStats.by_status ?? []);
  const serverByEnv = normalize(serverStats.by_environment ?? []);
  const serverByType = normalize(serverStats.by_server_type ?? []);

  const vmByState = normalize(vmStats.by_state ?? []).map((d) => ({
    ...d,
    name: d.name.charAt(0).toUpperCase() + d.name.slice(1).toLowerCase(),
  }));
  const vmByHypervisor = normalize(vmStats.by_hypervisor ?? []);

  const switchByStatus = normalize(
    Array.isArray(switchStats.by_status)
      ? switchStats.by_status.map((s: any) =>
          Array.isArray(s) ? { name: s[0], count: s[1] } : s
        )
      : []
  );

  const activeSwitches =
    switchByStatus.find((s) => s.name.toUpperCase() === "ACTIVE")?.count ?? 0;

  const showK8sSnapshot =
    (k8sStats.total_clusters ?? 0) > 0 || (k8sStats.total_nodes ?? 0) > 0;

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Infrastructure Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          At-a-glance health and inventory of your farm
        </p>
      </div>

      {loading ? (
        <div className="rounded-theme border border-island_border bg-island_background p-16 text-center text-muted-foreground">
          Loading dashboard data…
        </div>
      ) : (
        <>
          {/* ── Hero stat cards ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              label="Servers"
              value={serverStats.total_servers ?? 0}
              sub={`${serverStats.active_servers ?? 0} active`}
              subColor="text-green-500"
              href="/servers/overview"
            />
            <StatCard
              label="Virtual Machines"
              value={vmStats.total_vms ?? 0}
              sub={`${vmStats.running_vms ?? 0} running`}
              subColor="text-green-500"
              href="/servers/vms/overview"
            />
            <StatCard
              label="Switches"
              value={switchStats.total_switches ?? 0}
              sub={`${activeSwitches} active`}
              subColor="text-green-500"
              href="/networking/switches"
            />
            <StatCard
              label="K8s Clusters"
              value={k8sStats.total_clusters ?? clusterCount}
              sub={`${k8sStats.active_clusters ?? 0} active`}
              subColor="text-green-500"
              href="/kubernetes/overview"
            />
            <StatCard
              label="Datacenters"
              value={datacenterCount}
              sub="physical locations"
              href="/datacenters"
            />
            <StatCard
              label="CPU Cores"
              value={(serverStats.total_cpu_cores ?? 0).toLocaleString()}
              sub={`${Math.round(serverStats.total_ram_gb ?? 0).toLocaleString()} GB RAM`}
            />
          </div>

          {/* ── Row 2: Server health + VM states + Servers by environment ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DonutChart
              title="Server Health"
              data={serverByStatus}
              colorMap={STATUS_COLORS}
            />
            <DonutChart
              title="VM States"
              data={vmByState}
              colorMap={VM_STATE_COLORS}
            />
            <HBarChart
              title="Servers by Environment"
              data={serverByEnv}
              colors={ENV_COLORS}
            />
          </div>

          {/* ── Row 3: Server type + VM hypervisor + Switch status ──────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <HBarChart
              title="Servers by Type"
              data={serverByType}
              colors={CHART_COLORS}
            />
            <HBarChart
              title="VMs by Hypervisor"
              data={vmByHypervisor}
              colors={CHART_COLORS}
            />
            <DonutChart
              title="Switch Status"
              data={switchByStatus}
              colorMap={STATUS_COLORS}
            />
          </div>

          {/* ── Row 4: Storage + ports summary ──────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Total Storage",
                value:
                  (serverStats.total_storage_gb ?? 0) >= 1024
                    ? `${((serverStats.total_storage_gb ?? 0) / 1024).toFixed(1)} TB`
                    : `${Math.round(serverStats.total_storage_gb ?? 0)} GB`,
                sub: "server inventory",
              },
              {
                label: "VM Storage",
                value:
                  (vmStats.total_storage_gb ?? 0) >= 1024
                    ? `${((vmStats.total_storage_gb ?? 0) / 1024).toFixed(1)} TB`
                    : `${Math.round(vmStats.total_storage_gb ?? 0)} GB`,
                sub: "allocated to VMs",
              },
              {
                label: "Switch Ports",
                value: (switchStats.total_ports ?? 0).toLocaleString(),
                sub: `${switchStats.up_ports ?? 0} up`,
                subColor: "text-green-500",
              },
              {
                label: "Total vCPUs",
                value: (vmStats.total_vcpus ?? 0).toLocaleString(),
                sub: `${Math.round((vmStats.total_memory_gb ?? 0))} GB vRAM`,
              },
            ].map(({ label, value, sub, subColor }) => (
              <div
                key={label}
                className="rounded-theme border border-island_border bg-island_background p-5"
              >
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  {label}
                </p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                {sub && (
                  <p className={`text-xs mt-2 ${subColor ?? "text-muted-foreground"}`}>
                    {sub}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* ── Row 5: Kubernetes snapshot (conditional) ────────────────────── */}
          {showK8sSnapshot && (
            <div className="rounded-theme border border-island_border bg-island_background p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">☸️</span>
                <h3 className="text-sm font-semibold text-foreground">
                  Kubernetes Snapshot
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Clusters", value: k8sStats.total_clusters ?? 0 },
                  { label: "Active Clusters", value: k8sStats.active_clusters ?? 0 },
                  { label: "Total Nodes", value: k8sStats.total_nodes ?? 0 },
                  { label: "Total Pods", value: k8sStats.total_pods ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 rounded-theme bg-accent/10">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      {label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {value.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Row 6: Quick navigation ────────────────────────────────────── */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Quick Access
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { title: "Servers", desc: "Physical server inventory", icon: "🖥️", href: "/servers" },
                { title: "Virtual Machines", desc: "Manage VMs across hypervisors", icon: "💻", href: "/servers/vms" },
                { title: "Networking", desc: "Switches, ports and VLANs", icon: "🔌", href: "/networking/switches" },
                { title: "Kubernetes", desc: "Cluster workloads and nodes", icon: "☸️", href: "/kubernetes/overview" },
                { title: "Datacenters", desc: "Locations, racks and positions", icon: "🏢", href: "/datacenters" },
                { title: "Clusters", desc: "Server cluster groupings", icon: "🗄️", href: "/clusters" },
                { title: "Server Analytics", desc: "Charts and server breakdown", icon: "📊", href: "/servers/overview" },
                { title: "VM Analytics", desc: "VM analytics and breakdown", icon: "📈", href: "/servers/vms/overview" },
              ].map(({ title, desc, icon, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-start gap-3 p-4 rounded-theme border border-island_border bg-island_background hover:bg-accent/30 transition-colors"
                >
                  <span className="text-xl mt-0.5 shrink-0">{icon}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}