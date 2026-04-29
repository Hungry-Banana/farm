"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import { getServers, getServerOverview } from "@/lib/servers";
import TableSection from "@/components/ui/table/TableSection";
import ServerCellContent from "@/components/ui/table/ServerCellContent";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList,
  ResponsiveContainer,
} from "recharts";

// ── Colour maps ───────────────────────────────────────────────────────────────
const STATUS_CSS: Record<string, string> = {
  ACTIVE:         "text-green-500 bg-green-500/10 border-green-500/20",
  INACTIVE:       "text-red-500 bg-red-500/10 border-red-500/20",
  MAINTENANCE:    "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  RMA:            "text-purple-500 bg-purple-500/10 border-purple-500/20",
  DECOMMISSIONED: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

const STATUS_CHART_COLORS: Record<string, string> = {
  ACTIVE: "#10B981", Active: "#10B981", active: "#10B981",
  INACTIVE: "#EF4444", Inactive: "#EF4444", inactive: "#EF4444",
  MAINTENANCE: "#F59E0B", Maintenance: "#F59E0B", maintenance: "#F59E0B",
  RMA: "#8B5CF6", Rma: "#8B5CF6", rma: "#8B5CF6",
  DECOMMISSIONED: "#6B7280", Decommissioned: "#6B7280",
};

const ENV_CHART_COLORS: Record<string, string> = {
  PRODUCTION: "#DC2626", Production: "#DC2626", production: "#DC2626",
  DEVELOPMENT: "#059669", Development: "#059669", development: "#059669",
  STAGING: "#F59E0B", Staging: "#F59E0B", staging: "#F59E0B",
  TESTING: "#7C3AED", Testing: "#7C3AED", testing: "#7C3AED",
  QA: "#2563EB", Qa: "#2563EB", qa: "#2563EB",
};

const TYPE_CHART_COLORS: Record<string, string> = {
  BAREMETAL: "#3B82F6", Baremetal: "#3B82F6",
  HOST: "#10B981", Host: "#10B981",
  STORAGE: "#F59E0B", Storage: "#F59E0B",
  COMPUTE: "#8B5CF6", Compute: "#8B5CF6",
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
            <Legend iconSize={10} formatter={(v) => <span className="text-xs text-foreground">{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Horizontal bar chart ──────────────────────────────────────────────────────
function HBarChart({ title, data, colors = CHART_COLORS }: { title: string; data: { name: string; value: number }[]; colors?: string[] }) {
  return (
    <div className="rounded-theme border border-island_border bg-island_background p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-3">{data.length} {data.length === 1 ? "category" : "categories"}</p>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-44 text-muted-foreground text-sm">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 40)}>
          <BarChart layout="vertical" data={data} margin={{ left: 4, right: 48, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,127,127,0.15)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "rgba(127,127,127,0.8)" }} allowDecimals={false} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "rgba(127,127,127,0.8)" }} width={100} axisLine={false} tickLine={false} />
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
export default function ServersOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [servers, setServers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [serversData, statsData] = await Promise.all([getServers(), getServerOverview()]);
        setServers(serversData || []);
        setStats(statsData || {});
      } catch (error) {
        console.error("Failed to load server overview:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Derived chart data ─────────────────────────────────────────────────────
  const byStatus  = normalize(stats.by_status ?? []);
  const byEnv     = normalize(stats.by_environment ?? []);
  const byType    = normalize(stats.by_server_type ?? []);

  const storageGb = stats.total_storage_gb ?? 0;
  const storageFmt = storageGb >= 1024
    ? `${(storageGb / 1024).toFixed(1)} TB`
    : `${Math.round(storageGb)} GB`;

  const recentServers = [...servers]
    .sort((a, b) => b.server_id - a.server_id)
    .slice(0, 12);

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Servers Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Health, capacity and inventory across all servers
          </p>
        </div>
        <Link href="/servers" className="text-sm text-primary hover:underline">
          View all servers →
        </Link>
      </div>

      {loading ? (
        <div className="rounded-theme border border-island_border bg-island_background p-16 text-center text-muted-foreground">
          Loading server overview…
        </div>
      ) : (
        <>
          {/* ── Hero stat cards ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Servers",  value: (stats.total_servers ?? servers.length).toLocaleString(), sub: `${stats.active_servers ?? 0} active`, subColor: "text-green-500" },
              { label: "Active",         value: (stats.active_servers ?? 0).toLocaleString(), sub: "running normally", subColor: "text-green-500" },
              { label: "Inactive",       value: (stats.inactive_servers ?? 0).toLocaleString(), sub: `${stats.maintenance_servers ?? 0} in maintenance`, subColor: "text-yellow-500" },
              { label: "CPU Cores",      value: (stats.total_cpu_cores ?? 0).toLocaleString(), sub: "across all servers" },
              { label: "Total RAM",      value: `${Math.round(stats.total_ram_gb ?? 0).toLocaleString()} GB`, sub: "installed memory" },
              { label: "Total Storage",  value: storageFmt, sub: "across all servers" },
            ].map(({ label, value, sub, subColor }) => (
              <div key={label} className="rounded-theme border border-island_border bg-island_background p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                {sub && <p className={`text-xs mt-2 ${subColor ?? "text-muted-foreground"}`}>{sub}</p>}
              </div>
            ))}
          </div>

          {/* ── Charts row ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DonutChart title="Server Status" data={byStatus} colorMap={STATUS_CHART_COLORS} />
            <DonutChart title="Environment Distribution" data={byEnv} colorMap={ENV_CHART_COLORS} />
            <HBarChart  title="Server Types" data={byType} colors={Object.values(TYPE_CHART_COLORS)} />
          </div>

          {/* ── Recent servers table ─────────────────────────────────────── */}
          <div className="rounded-theme border border-island_border bg-island_background">
            <div className="flex items-center justify-between p-5 border-b border-island_border">
              <h2 className="text-sm font-semibold text-foreground">Recent Servers</h2>
              <span className="text-xs text-muted-foreground">{servers.length} total</span>
            </div>
            <div className="p-5">
              <TableSection
                columns={[
                  { key: "server_name", label: "Server",      render: (v, item) => <ServerCellContent columnKey="server_name"      value={v}    item={item} /> },
                  { key: "manufacturer", label: "Manufacturer", render: (v, item) => <ServerCellContent columnKey="manufacturer"     value={v}    item={item} /> },
                  { key: "server_type",  label: "Type",         render: (v, item) => <ServerCellContent columnKey="server_type"      value={v}    item={item} /> },
                  { key: "status",       label: "Status",       render: (v, item) => <ServerCellContent columnKey="status"           value={v}    item={item} /> },
                  { key: "environment_type", label: "Environment", render: (v, item) => <ServerCellContent columnKey="environment_type" value={v} item={item} /> },
                  { key: "state",        label: "State",        render: (v, item) => <ServerCellContent columnKey="state"            value={v}    item={item} /> },
                ]}
                data={recentServers}
                keyField="server_id"
                searchable={false}
              />
            </div>
          </div>

          {/* ── Quick navigation ─────────────────────────────────────────── */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Access</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { title: "All Servers",    desc: "Browse the full server list",      icon: "🖥️", href: "/servers" },
                { title: "Virtual Machines", desc: "Manage VMs across hypervisors",  icon: "💻", href: "/servers/vms" },
                { title: "VM Overview",    desc: "VM analytics and breakdown",        icon: "📈", href: "/servers/vms/overview" },
                { title: "Clusters",       desc: "Server cluster groupings",          icon: "🗄️", href: "/clusters" },
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

