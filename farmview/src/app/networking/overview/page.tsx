"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import { getSwitches, getSwitchStats } from "@/lib/switches";
import {
  PieChart, Pie, Cell,
  Tooltip, Legend,
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

const CHART_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#EC4899"];

// ── Tooltip styles ────────────────────────────────────────────────────────────
const tooltipStyle      = { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "6px", fontSize: "12px", color: "#f1f5f9" };
const tooltipItemStyle  = { color: "#f1f5f9" };
const tooltipLabelStyle = { color: "#cbd5e1" };

// ── Normalise data arrays ─────────────────────────────────────────────────────
function normalize(arr: any[]): { name: string; value: number }[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => ({
    name:  (Array.isArray(item) ? item[0] : item.name)  ?? "Unknown",
    value: (Array.isArray(item) ? item[1] : item.count) ?? 0,
  }));
}

// ── Mini donut ────────────────────────────────────────────────────────────────
function MiniDonut({ data, colorMap }: { data: { name: string; value: number }[]; colorMap?: Record<string, string> }) {
  const filled = data.map((d, i) => ({
    ...d,
    fill: colorMap?.[d.name] ?? colorMap?.[d.name.toUpperCase()] ?? CHART_COLORS[i % CHART_COLORS.length],
  }));
  return (
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie data={filled} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
          {filled.map((entry, i) => <Cell key={i} fill={entry.fill} strokeWidth={0} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} wrapperStyle={{ outline: "none" }} />
        <Legend iconSize={8} formatter={(v) => <span className="text-xs text-foreground">{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NetworkingOverviewPage() {
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

  // ── Derived data ──────────────────────────────────────────────────────────
  const byStatus = normalize(stats.by_status ?? []);
  const byRole   = normalize(stats.by_role   ?? []);

  const totalSwitches       = stats.total_switches ?? switches.length;
  const activeSwitches      = byStatus.find((s) => s.name.toUpperCase() === "ACTIVE")?.value ?? 0;
  const inactiveSwitches    = byStatus.find((s) => s.name.toUpperCase() === "INACTIVE")?.value ?? 0;
  const maintenanceSwitches = byStatus.find((s) => s.name.toUpperCase() === "MAINTENANCE")?.value ?? 0;
  const totalPorts          = stats.total_ports ?? 0;
  const upPorts             = stats.up_ports    ?? 0;
  const downPorts           = totalPorts - upPorts;
  const portUtilPct         = totalPorts > 0 ? Math.round((upPorts / totalPorts) * 100) : 0;

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Networking Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Infrastructure-wide network health, device inventory and connectivity summary
        </p>
      </div>

      {loading ? (
        <div className="rounded-theme border border-island_border bg-island_background p-16 text-center text-muted-foreground">
          Loading networking overview...
        </div>
      ) : (
        <>
          {/* Hero stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Switches", value: totalSwitches.toLocaleString(),   sub: `${activeSwitches} active`,             subColor: "text-green-500" },
              { label: "Active",         value: activeSwitches.toLocaleString(),  sub: "operational",                           subColor: "text-green-500" },
              { label: "Inactive",       value: inactiveSwitches.toLocaleString(),sub: `${maintenanceSwitches} in maintenance`, subColor: inactiveSwitches > 0 ? "text-red-400" : "text-muted-foreground" },
              { label: "Total Ports",    value: totalPorts.toLocaleString(),      sub: "across all switches" },
              { label: "Ports Up",       value: upPorts.toLocaleString(),         sub: `${portUtilPct}% utilisation`,          subColor: "text-green-500" },
              { label: "Ports Down",     value: downPorts.toLocaleString(),       sub: "unused / offline",                     subColor: downPorts > 0 ? "text-yellow-500" : "text-muted-foreground" },
            ].map(({ label, value, sub, subColor }) => (
              <div key={label} className="rounded-theme border border-island_border bg-island_background p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                {sub && <p className={`text-xs mt-2 ${subColor ?? "text-muted-foreground"}`}>{sub}</p>}
              </div>
            ))}
          </div>

          {/* Device category cards */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Network Devices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

              {/* Switches card */}
              <div className="rounded-theme border border-island_border bg-island_background p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Switches</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Layer 2 / Layer 3 switching fabric</p>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{totalSwitches}</span>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Port utilisation</span>
                    <span>{upPorts.toLocaleString()} / {totalPorts.toLocaleString()} ({portUtilPct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-accent/30 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${portUtilPct}%`,
                        backgroundColor: portUtilPct > 85 ? "#EF4444" : portUtilPct > 60 ? "#F59E0B" : "#10B981",
                      }}
                    />
                  </div>
                </div>

                {byRole.length > 0 && <MiniDonut data={byRole} colorMap={ROLE_CHART_COLORS} />}

                <div className="mt-3 pt-3 border-t border-island_border flex gap-3 text-xs">
                  <Link href="/networking/switches/overview" className="text-primary hover:underline">Switches overview &rarr;</Link>
                  <Link href="/networking/switches" className="text-primary hover:underline">All switches &rarr;</Link>
                </div>
              </div>

              {/* Placeholder: Routers */}
              <div className="rounded-theme border border-island_border border-dashed bg-island_background/50 p-5 flex flex-col items-center justify-center gap-2 text-center min-h-[220px]">
                <span className="text-3xl">&#x1F500;</span>
                <p className="text-sm font-medium text-foreground">Routers</p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>

              {/* Placeholder: Firewalls */}
              <div className="rounded-theme border border-island_border border-dashed bg-island_background/50 p-5 flex flex-col items-center justify-center gap-2 text-center min-h-[220px]">
                <span className="text-3xl">&#x1F6E1;&#xFE0F;</span>
                <p className="text-sm font-medium text-foreground">Firewalls</p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </div>

          {/* Status + port utilisation row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-theme border border-island_border bg-island_background p-5">
              <h3 className="text-sm font-semibold text-foreground mb-1">Switch Status</h3>
              <p className="text-xs text-muted-foreground mb-3">Total: {totalSwitches.toLocaleString()}</p>
              {byStatus.length === 0 ? (
                <div className="flex items-center justify-center h-44 text-muted-foreground text-sm">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={byStatus.map((d, i) => ({
                        ...d,
                        fill: STATUS_CHART_COLORS[d.name] ?? STATUS_CHART_COLORS[d.name.toUpperCase()] ?? CHART_COLORS[i % CHART_COLORS.length],
                      }))}
                      cx="50%" cy="45%" innerRadius={50} outerRadius={76} paddingAngle={2} dataKey="value"
                    >
                      {byStatus.map((d, i) => (
                        <Cell key={i} fill={STATUS_CHART_COLORS[d.name] ?? STATUS_CHART_COLORS[d.name.toUpperCase()] ?? CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} wrapperStyle={{ outline: "none" }} />
                    <Legend iconSize={10} formatter={(v) => <span className="text-xs text-foreground">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-theme border border-island_border bg-island_background p-5">
              <h3 className="text-sm font-semibold text-foreground mb-1">Port Utilisation</h3>
              <p className="text-xs text-muted-foreground mb-4">{totalPorts.toLocaleString()} total ports across all switches</p>
              {totalPorts === 0 ? (
                <div className="flex items-center justify-center h-44 text-muted-foreground text-sm">No data</div>
              ) : (
                <div className="space-y-6 mt-6">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-foreground">{portUtilPct}%</span>
                    <span className="text-sm text-muted-foreground mb-2">of ports active</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 rounded-full bg-accent/30 overflow-hidden">
                      <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${portUtilPct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="text-green-500">{upPorts.toLocaleString()} up</span>
                      <span className="text-red-400">{downPorts.toLocaleString()} down</span>
                    </div>
                  </div>
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

          {/* Quick navigation */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Access</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { title: "Switches Overview", desc: "Switch-level analytics and breakdown", icon: "\uD83D\uDCCA", href: "/networking/switches/overview" },
                { title: "All Switches",       desc: "Browse the full switch list",          icon: "\uD83D\uDD00", href: "/networking/switches" },
                { title: "Servers",            desc: "Physical server inventory",             icon: "\uD83D\uDDA5\uFE0F", href: "/servers" },
                { title: "Datacenters",        desc: "Datacenter and rack management",        icon: "\uD83C\uDFE2", href: "/datacenters" },
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
