"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import { getClusters, getClusterStats } from "@/lib/clusters";
import TableSection from "@/components/ui/table/TableSection";
import ClusterCellContent from "@/components/ui/table/ClusterCellContent";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList,
  ResponsiveContainer,
} from "recharts";

// ── Chart colours ─────────────────────────────────────────────────────────────
const STATUS_CHART_COLORS: Record<string, string> = {
  ACTIVE: "#10B981", Active: "#10B981", active: "#10B981", OPERATIONAL: "#10B981",
  INACTIVE: "#EF4444", Inactive: "#EF4444", inactive: "#EF4444",
  MAINTENANCE: "#F59E0B", Maintenance: "#F59E0B", maintenance: "#F59E0B", UNDER_MAINTENANCE: "#F59E0B",
  DECOMMISSIONED: "#6B7280", Decommissioned: "#6B7280", decommissioned: "#6B7280",
};

const ENV_CHART_COLORS: Record<string, string> = {
  PRODUCTION: "#DC2626", Production: "#DC2626", production: "#DC2626",
  DEVELOPMENT: "#059669", Development: "#059669", development: "#059669",
  STAGING: "#F59E0B", Staging: "#F59E0B", staging: "#F59E0B",
  TESTING: "#7C3AED", Testing: "#7C3AED", testing: "#7C3AED",
  QA: "#2563EB", Qa: "#2563EB", qa: "#2563EB",
};

const CHART_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#EC4899"];

// ── Tooltip styles ────────────────────────────────────────────────────────────
const tooltipStyle      = { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "6px", fontSize: "12px", color: "#f1f5f9" };
const tooltipItemStyle  = { color: "#f1f5f9" };
const tooltipLabelStyle = { color: "#cbd5e1" };

// ── Normalise data arrays (objects or [name,count] tuples) ────────────────────
function normalize(arr: any[]): { name: string; value: number }[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => ({
    name:  (Array.isArray(item) ? item[0] : item.name)  ?? "Unknown",
    value: (Array.isArray(item) ? item[1] : item.count) ?? 0,
  }));
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function DonutChart({ title, data, colorMap }: { title: string; data: { name: string; value: number }[]; colorMap?: Record<string, string> }) {
  const filled = data.map((d, i) => ({
    ...d,
    fill: colorMap?.[d.name] ?? colorMap?.[d.name.toUpperCase()] ?? colorMap?.[d.name.toLowerCase()] ?? CHART_COLORS[i % CHART_COLORS.length],
  }));
  const total = filled.reduce((s, d) => s + d.value, 0);
  return (
    <div className="rounded-theme border border-island_border bg-island_background p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-3">Total: {total.toLocaleString()}</p>
      {total === 0 ? (
        <div className="flex items-center justify-center h-44 text-muted-foreground text-sm">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie data={filled} cx="50%" cy="45%" innerRadius={50} outerRadius={76} paddingAngle={2} dataKey="value">
              {filled.map((entry, i) => <Cell key={i} fill={entry.fill} strokeWidth={0} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} wrapperStyle={{ outline: "none" }} />
            <text x="50%" y="43%" dominantBaseline="middle" textAnchor="middle" fontSize={22} fontWeight="bold" fill="#f1f5f9">{total}</text>
            {/* recharts Legend */}
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Horizontal bar chart ──────────────────────────────────────────────────────
function HBarChart({ title, data, subtitle, colors = CHART_COLORS }: { title: string; data: { name: string; value: number }[]; subtitle?: string; colors?: string[] }) {
  return (
    <div className="rounded-theme border border-island_border bg-island_background p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-3">{subtitle ?? `${data.length} ${data.length === 1 ? "entry" : "entries"}`}</p>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-44 text-muted-foreground text-sm">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 40)}>
          <BarChart layout="vertical" data={data} margin={{ left: 4, right: 48, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,127,127,0.15)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "rgba(127,127,127,0.8)" }} allowDecimals={false} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "rgba(127,127,127,0.8)" }} width={110} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} wrapperStyle={{ outline: "none" }} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              <LabelList dataKey="value" position="right" style={{ fontSize: 11, fill: "rgba(127,127,127,0.8)" }} />
              {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ClustersOverviewPage() {
  const [loading, setLoading]   = useState(true);
  const [clusters, setClusters] = useState<any[]>([]);
  const [stats, setStats]       = useState<any>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [clustersData, statsData] = await Promise.all([getClusters(), getClusterStats()]);
        setClusters(clustersData || []);
        setStats(statsData || {});
      } catch (err) {
        console.error("Failed to load cluster overview:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Derived chart data ──────────────────────────────────────────────────────
  const byStatus  = normalize(stats.by_status      ?? []);
  const byEnv     = normalize(stats.by_environment ?? []);

  // Servers per cluster (top 10 by total_servers desc)
  const serversByCluster = [...clusters]
    .filter((c) => (c.total_servers ?? 0) > 0)
    .sort((a, b) => (b.total_servers ?? 0) - (a.total_servers ?? 0))
    .slice(0, 10)
    .map((c) => ({ name: c.cluster_name ?? `Cluster ${c.cluster_id}`, value: c.total_servers ?? 0 }));

  // Capacity utilization per cluster (top 10 with a max_capacity set)
  const capacityData = [...clusters]
    .filter((c) => c.max_capacity && c.max_capacity > 0)
    .sort((a, b) => (b.total_servers ?? 0) / b.max_capacity - (a.total_servers ?? 0) / a.max_capacity)
    .slice(0, 10)
    .map((c) => ({
      name:  c.cluster_name ?? `Cluster ${c.cluster_id}`,
      value: Math.round(((c.total_servers ?? 0) / c.max_capacity) * 100),
    }));

  const recentClusters = [...clusters]
    .sort((a, b) => b.cluster_id - a.cluster_id)
    .slice(0, 15);

  const activeCount  = stats.active_clusters   ?? clusters.filter((c) => c.status?.toUpperCase() === "ACTIVE").length;
  const inactiveCount = (stats.total_clusters ?? clusters.length) - activeCount;

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clusters Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Health, capacity and inventory across all server clusters
          </p>
        </div>
        <Link href="/clusters" className="text-sm text-primary hover:underline">
          View all clusters →
        </Link>
      </div>

      {loading ? (
        <div className="rounded-theme border border-island_border bg-island_background p-16 text-center text-muted-foreground">
          Loading cluster overview…
        </div>
      ) : (
        <>
          {/* ── Hero stat cards ───────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Clusters",    value: (stats.total_clusters    ?? clusters.length).toLocaleString(),          sub: `${activeCount} active`,        subColor: "text-green-500" },
              { label: "Active",            value: activeCount.toLocaleString(),                                            sub: "operational clusters",          subColor: "text-green-500" },
              { label: "Inactive",          value: inactiveCount.toLocaleString(),                                          sub: `${byStatus.find(s => s.name.toUpperCase() === "MAINTENANCE")?.value ?? 0} in maintenance`, subColor: "text-yellow-500" },
              { label: "Sub-Clusters",      value: (stats.total_sub_clusters ?? 0).toLocaleString(),                       sub: "across all clusters" },
              { label: "Total Servers",     value: (stats.total_servers     ?? 0).toLocaleString(),                        sub: "in clusters" },
              { label: "Active Servers",    value: (stats.active_servers    ?? 0).toLocaleString(),                        sub: "running normally",              subColor: "text-green-500" },
            ].map(({ label, value, sub, subColor }) => (
              <div key={label} className="rounded-theme border border-island_border bg-island_background p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                {sub && <p className={`text-xs mt-2 ${subColor ?? "text-muted-foreground"}`}>{sub}</p>}
              </div>
            ))}
          </div>

          {/* ── Charts row ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DonutChart title="Cluster Status"      data={byStatus} colorMap={STATUS_CHART_COLORS} />
            <DonutChart title="Environment Distribution" data={byEnv} colorMap={ENV_CHART_COLORS} />
            {serversByCluster.length > 0 ? (
              <HBarChart title="Servers per Cluster" data={serversByCluster} subtitle="Top 10 by server count" />
            ) : capacityData.length > 0 ? (
              <HBarChart title="Capacity Utilization (%)" data={capacityData} subtitle="Top 10 clusters" />
            ) : (
              <HBarChart title="Servers per Cluster" data={[]} />
            )}
          </div>

          {/* ── Clusters table ────────────────────────────────────────────── */}
          <div className="rounded-theme border border-island_border bg-island_background">
            <div className="flex items-center justify-between p-5 border-b border-island_border">
              <h2 className="text-sm font-semibold text-foreground">All Clusters</h2>
              <span className="text-xs text-muted-foreground">{clusters.length} total</span>
            </div>
            <div className="p-5">
              <TableSection
                columns={[
                  { key: "cluster_name",     label: "Cluster",     render: (v, item) => <ClusterCellContent columnKey="cluster_name"     value={v} item={item} /> },
                  { key: "cluster_code",     label: "Code",        render: (v, item) => <ClusterCellContent columnKey="cluster_code"     value={v} item={item} /> },
                  { key: "status",           label: "Status",      render: (v, item) => <ClusterCellContent columnKey="status"           value={v} item={item} /> },
                  { key: "environment_type", label: "Environment", render: (v, item) => <ClusterCellContent columnKey="environment_type" value={v} item={item} /> },
                  { key: "total_servers",    label: "Servers",     render: (v, item) => <ClusterCellContent columnKey="total_servers"    value={v} item={item} /> },
                  { key: "active_servers",   label: "Active",      render: (v, item) => <ClusterCellContent columnKey="active_servers"   value={v} item={item} /> },
                  { key: "region",           label: "Region",      render: (v, item) => <ClusterCellContent columnKey="region"           value={v} item={item} /> },
                  { key: "owner",            label: "Owner",       render: (v, item) => <ClusterCellContent columnKey="owner"            value={v} item={item} /> },
                ]}
                data={recentClusters}
                keyField="cluster_id"
                searchable={true}
              />
            </div>
          </div>

          {/* ── Quick navigation ──────────────────────────────────────────── */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Access</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { title: "All Clusters",    desc: "Browse the full cluster list",         icon: "🗂️", href: "/clusters" },
                { title: "Servers",         desc: "Physical server inventory",             icon: "🖥️", href: "/servers" },
                { title: "Server Overview", desc: "Server analytics and breakdown",        icon: "📊", href: "/servers/overview" },
                { title: "Datacenters",     desc: "Datacenter and rack management",        icon: "🏢", href: "/datacenters" },
              ].map(({ title, desc, icon, href }) => (
                <Link key={href} href={href}
                  className="flex items-start gap-3 p-4 rounded-theme border border-island_border bg-island_background hover:bg-accent/30 transition-colors">
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
