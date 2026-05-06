"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import { getSwitches, getSwitchStats } from "@/lib/switches";
import TableSection from "@/components/ui/table/TableSection";
import SwitchCellContent from "@/components/ui/table/SwitchCellContent";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList,
  ResponsiveContainer,
} from "recharts";

// ── Colour maps ───────────────────────────────────────────────────────────────
const STATUS_CHART_COLORS: Record<string, string> = {
  ACTIVE: "#10B981", Active: "#10B981", active: "#10B981",
  INACTIVE: "#EF4444", Inactive: "#EF4444", inactive: "#EF4444",
  MAINTENANCE: "#F59E0B", Maintenance: "#F59E0B", maintenance: "#F59E0B",
  NEW: "#3B82F6", New: "#3B82F6", new: "#3B82F6",
  RMA: "#8B5CF6", Rma: "#8B5CF6", rma: "#8B5CF6",
  DECOMMISSIONED: "#6B7280", Decommissioned: "#6B7280", decommissioned: "#6B7280",
};

const ROLE_CHART_COLORS: Record<string, string> = {
  CORE: "#7C3AED", Core: "#7C3AED", core: "#7C3AED",
  DISTRIBUTION: "#3B82F6", Distribution: "#3B82F6", distribution: "#3B82F6",
  ACCESS: "#06B6D4", Access: "#06B6D4", access: "#06B6D4",
  EDGE: "#F97316", Edge: "#F97316", edge: "#F97316",
  MANAGEMENT: "#10B981", Management: "#10B981", management: "#10B981",
  OOB: "#F59E0B", Oob: "#F59E0B", oob: "#F59E0B",
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
export default function SwitchesOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [switches, setSwitches] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [switchesData, statsData] = await Promise.all([getSwitches(), getSwitchStats()]);
        setSwitches(switchesData || []);
        setStats(statsData || {});
      } catch (error) {
        console.error("Failed to load networking overview:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Derived chart data ──────────────────────────────────────────────────────
  const byStatus = normalize(stats.by_status ?? []);
  const byRole   = normalize(stats.by_role   ?? []);

  // Environment distribution derived from switch list
  const byEnv = Object.entries(
    switches.reduce((acc: Record<string, number>, s) => {
      const e = s.environment_type ?? "UNKNOWN";
      acc[e] = (acc[e] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: value as number }));

  // OS type distribution
  const byOs = Object.entries(
    switches.reduce((acc: Record<string, number>, s) => {
      const o = s.os_type ?? "Unknown";
      acc[o] = (acc[o] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const totalSwitches = stats.total_switches ?? switches.length;
  const activeSwitches = byStatus.find((s) => s.name.toUpperCase() === "ACTIVE")?.value ?? 0;
  const totalPorts = stats.total_ports ?? 0;
  const upPorts    = stats.up_ports   ?? 0;
  const downPorts  = totalPorts - upPorts;
  const portUtilPct = totalPorts > 0 ? Math.round((upPorts / totalPorts) * 100) : 0;

  const recentSwitches = [...switches]
    .sort((a, b) => b.switch_id - a.switch_id)
    .slice(0, 12);

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Switches Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Port utilisation, role distribution and inventory across all network switches
          </p>
        </div>
        <Link href="/networking/switches" className="text-sm text-primary hover:underline">
          View all switches →
        </Link>
      </div>

      {loading ? (
        <div className="rounded-theme border border-island_border bg-island_background p-16 text-center text-muted-foreground">
          Loading switches overview…
        </div>
      ) : (
        <>
          {/* ── Hero stat cards ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Switches",  value: totalSwitches.toLocaleString(),    sub: `${activeSwitches} active`,              subColor: "text-green-500" },
              { label: "Active",          value: activeSwitches.toLocaleString(),   sub: "operational switches",                   subColor: "text-green-500" },
              { label: "Inactive",        value: (byStatus.find((s) => s.name.toUpperCase() === "INACTIVE")?.value ?? 0).toLocaleString(), sub: `${byStatus.find((s) => s.name.toUpperCase() === "MAINTENANCE")?.value ?? 0} in maintenance`, subColor: "text-yellow-500" },
              { label: "Total Ports",     value: totalPorts.toLocaleString(),        sub: `${upPorts.toLocaleString()} up` },
              { label: "Ports Up",        value: upPorts.toLocaleString(),           sub: `${portUtilPct}% utilisation`,           subColor: portUtilPct > 80 ? "text-green-500" : "text-muted-foreground" },
              { label: "Ports Down",      value: downPorts.toLocaleString(),         sub: `${100 - portUtilPct}% unused`,          subColor: downPorts > 0 ? "text-yellow-500" : "text-muted-foreground" },
            ].map(({ label, value, sub, subColor }) => (
              <div key={label} className="rounded-theme border border-island_border bg-island_background p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                {sub && <p className={`text-xs mt-2 ${subColor ?? "text-muted-foreground"}`}>{sub}</p>}
              </div>
            ))}
          </div>

          {/* ── Charts row 1: status + role + environment ────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DonutChart title="Switch Status"          data={byStatus} colorMap={STATUS_CHART_COLORS} />
            <DonutChart title="Switch Role Distribution" data={byRole} colorMap={ROLE_CHART_COLORS} />
            <DonutChart title="Environment Distribution" data={byEnv}  colorMap={ENV_CHART_COLORS} />
          </div>

          {/* ── Charts row 2: OS / port utilisation ─────────────────────── */}
          {byOs.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <HBarChart title="Switches by OS Type" data={byOs} />
              <div className="rounded-theme border border-island_border bg-island_background p-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">Port Utilisation</h3>
                <p className="text-xs text-muted-foreground mb-4">{totalPorts.toLocaleString()} total ports</p>
                {totalPorts === 0 ? (
                  <div className="flex items-center justify-center h-44 text-muted-foreground text-sm">No data</div>
                ) : (
                  <div className="space-y-6 mt-6">
                    {/* Big percentage */}
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-bold text-foreground">{portUtilPct}%</span>
                      <span className="text-sm text-muted-foreground mb-2">of ports active</span>
                    </div>
                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="h-3 rounded-full bg-accent/30 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{ width: `${portUtilPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="text-green-500">{upPorts.toLocaleString()} up</span>
                        <span className="text-red-400">{downPorts.toLocaleString()} down</span>
                      </div>
                    </div>
                    {/* Mini stat grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-theme bg-accent/10 p-3">
                        <p className="text-xs text-muted-foreground">Ports Up</p>
                        <p className="text-xl font-bold text-green-500">{upPorts.toLocaleString()}</p>
                      </div>
                      <div className="rounded-theme bg-accent/10 p-3">
                        <p className="text-xs text-muted-foreground">Ports Down</p>
                        <p className="text-xl font-bold text-red-400">{downPorts.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Recent switches table ────────────────────────────────────── */}
          <div className="rounded-theme border border-island_border bg-island_background">
            <div className="flex items-center justify-between p-5 border-b border-island_border">
              <h2 className="text-sm font-semibold text-foreground">Recent Switches</h2>
              <span className="text-xs text-muted-foreground">{switches.length} total</span>
            </div>
            <div className="p-5">
              <TableSection
                columns={[
                  { key: "switch_name",      label: "Switch",       render: (v, item) => <SwitchCellContent columnKey="switch_name"      value={v} item={item} /> },
                  { key: "switch_role",      label: "Role",         render: (v, item) => <SwitchCellContent columnKey="switch_role"      value={v} item={item} /> },
                  { key: "status",           label: "Status",       render: (v, item) => <SwitchCellContent columnKey="status"           value={v} item={item} /> },
                  { key: "environment_type", label: "Environment",  render: (v, item) => <SwitchCellContent columnKey="environment_type" value={v} item={item} /> },
                  { key: "mgmt_ip_address",  label: "Mgmt IP",      render: (v, item) => <SwitchCellContent columnKey="mgmt_ip_address"  value={v} item={item} /> },
                  { key: "os_type",          label: "OS",           render: (v, item) => <SwitchCellContent columnKey="os_type"          value={v} item={item} /> },
                ]}
                data={recentSwitches}
                keyField="switch_id"
                searchable={false}
              />
            </div>
          </div>

          {/* ── Quick navigation ─────────────────────────────────────────── */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Access</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { title: "All Switches",    desc: "Browse the full switch list",       icon: "🔀", href: "/networking/switches" },
                { title: "Servers",         desc: "Physical server inventory",          icon: "🖥️", href: "/servers" },
                { title: "Datacenters",     desc: "Datacenter and rack management",     icon: "🏢", href: "/datacenters" },
                { title: "Clusters",        desc: "Server cluster groupings",           icon: "🗄️", href: "/clusters" },
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
