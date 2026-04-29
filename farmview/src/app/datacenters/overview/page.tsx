"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import { getDatacenters, getDatacenterStats } from "@/lib/datacenters";
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

// ── Colour maps ───────────────────────────────────────────────────────────────
const STATUS_CSS: Record<string, string> = {
  ACTIVE:         "text-green-500 bg-green-500/10 border-green-500/20",
  INACTIVE:       "text-red-500 bg-red-500/10 border-red-500/20",
  MAINTENANCE:    "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  CONSTRUCTION:   "text-blue-500 bg-blue-500/10 border-blue-500/20",
  DECOMMISSIONED: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

const STATUS_CHART_COLORS: Record<string, string> = {
  ACTIVE:         "#10B981",
  Active:         "#10B981",
  active:         "#10B981",
  INACTIVE:       "#EF4444",
  Inactive:       "#EF4444",
  inactive:       "#EF4444",
  MAINTENANCE:    "#F59E0B",
  Maintenance:    "#F59E0B",
  maintenance:    "#F59E0B",
  CONSTRUCTION:   "#3B82F6",
  Construction:   "#3B82F6",
  construction:   "#3B82F6",
  DECOMMISSIONED: "#6B7280",
  Decommissioned: "#6B7280",
  decommissioned: "#6B7280",
};

const TIER_COLORS: Record<string, string> = {
  TIER_I:   "#8B5CF6",
  TIER_II:  "#3B82F6",
  TIER_III: "#06B6D4",
  TIER_IV:  "#10B981",
  UNKNOWN:  "#6B7280",
};

const CHART_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#EC4899"];

// ── Tooltip styles ────────────────────────────────────────────────────────────
const tooltipStyle      = { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "6px", fontSize: "12px", color: "#f1f5f9" };
const tooltipItemStyle  = { color: "#f1f5f9" };
const tooltipLabelStyle = { color: "#cbd5e1" };

// ── Normalise API arrays (may be {name,count} objects or [name,count] tuples)
function normalize(arr: any[]): { name: string; value: number }[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => ({
    name:  (Array.isArray(item) ? item[0] : item.name)  ?? "Unknown",
    value: (Array.isArray(item) ? item[1] : item.count) ?? 0,
  }));
}

// ── Capacity bar (used for rack utilisation) ──────────────────────────────────
function CapacityBar({ used, total, color = "#10B981" }: { used: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-accent/40 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
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
      <p className="text-xs text-muted-foreground mb-3">{data.length} {data.length === 1 ? "item" : "items"}</p>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-44 text-muted-foreground text-sm">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 40)}>
          <BarChart layout="vertical" data={data} margin={{ left: 4, right: 48, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,127,127,0.15)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "rgba(127,127,127,0.8)" }} allowDecimals={false} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "rgba(127,127,127,0.8)" }} width={90} axisLine={false} tickLine={false} />
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
export default function DatacenterOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [datacenters, setDatacenters] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState<any>({});

  useEffect(() => {
    async function load() {
      try {
        const [dcs, stats] = await Promise.all([getDatacenters(), getDatacenterStats()]);
        setDatacenters(Array.isArray(dcs) ? dcs : []);
        setGlobalStats(stats ?? {});
      } catch (err) {
        console.error("Failed to load datacenter overview:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Derived rolls ─────────────────────────────────────────────────────────
  const totalDCs   = datacenters.length;
  const activeDCs  = datacenters.filter((d) => d.status?.toUpperCase() === "ACTIVE").length;
  // Use live counts from the stats API (COUNT(*) from datacenter_racks / servers tables)
  // rather than the denormalized counter columns on each datacenter row.
  const totalRacks   = globalStats.total_racks   ?? datacenters.reduce((s, d) => s + (d.total_racks ?? 0), 0);
  const totalServers = globalStats.total_servers ?? datacenters.reduce((s, d) => s + (d.total_servers ?? 0), 0);
  const usedRacks    = datacenters.reduce((s, d) => s + (d.occupied_racks ?? 0), 0);

  const totalPowerKw   = datacenters.reduce((s, d) => s + parseFloat(d.power_capacity_kw ?? 0), 0);
  const totalCoolingKw = datacenters.reduce((s, d) => s + parseFloat(d.cooling_capacity_kw ?? 0), 0);
  const totalFloorSqm  = datacenters.reduce((s, d) => s + parseFloat(d.total_floor_space_sqm ?? 0), 0);

  // Status distribution for chart
  const byStatus = Object.entries(
    datacenters.reduce((acc: Record<string, number>, d) => {
      const s = d.status ?? "UNKNOWN";
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Tier distribution
  const byTier = Object.entries(
    datacenters.reduce((acc: Record<string, number>, d) => {
      const t = d.tier_level ?? "UNKNOWN";
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: value as number }));

  // Servers per datacenter (top 10)
  const serversByDC = [...datacenters]
    .filter((d) => (d.total_servers ?? 0) > 0)
    .sort((a, b) => (b.total_servers ?? 0) - (a.total_servers ?? 0))
    .slice(0, 10)
    .map((d) => ({ name: d.data_center_name ?? `DC ${d.data_center_id}`, value: d.total_servers ?? 0 }));

  // Racks per datacenter (top 10)
  const racksByDC = [...datacenters]
    .filter((d) => (d.total_racks ?? 0) > 0)
    .sort((a, b) => (b.total_racks ?? 0) - (a.total_racks ?? 0))
    .slice(0, 10)
    .map((d) => ({ name: d.data_center_name ?? `DC ${d.data_center_id}`, value: d.total_racks ?? 0 }));

  // Country distribution
  const byCountry = Object.entries(
    datacenters.reduce((acc: Record<string, number>, d) => {
      const c = d.country ?? "Unknown";
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: value as number }));

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Datacenter Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Facility capacity, status and inventory across all datacenters
          </p>
        </div>
        <Link
          href="/datacenters"
          className="text-sm text-primary hover:underline"
        >
          View all datacenters →
        </Link>
      </div>

      {loading ? (
        <div className="rounded-theme border border-island_border bg-island_background p-16 text-center text-muted-foreground">
          Loading datacenter overview…
        </div>
      ) : (
        <>
          {/* ── Hero stat cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Datacenters",      value: totalDCs,                          sub: `${activeDCs} active`,              subColor: "text-green-500" },
              { label: "Total Racks",      value: totalRacks.toLocaleString(),        sub: `${usedRacks} occupied`,            subColor: usedRacks > 0 ? "text-yellow-500" : "text-muted-foreground" },
              { label: "Total Servers",    value: totalServers.toLocaleString(),      sub: "across all DCs" },
              { label: "Power Capacity",   value: totalPowerKw >= 1000 ? `${(totalPowerKw/1000).toFixed(1)} MW` : `${Math.round(totalPowerKw)} kW`, sub: "installed capacity" },
              { label: "Cooling Capacity", value: totalCoolingKw >= 1000 ? `${(totalCoolingKw/1000).toFixed(1)} MW` : `${Math.round(totalCoolingKw)} kW`, sub: "installed capacity" },
              { label: "Floor Space",      value: totalFloorSqm >= 10000 ? `${(totalFloorSqm/10000).toFixed(2)} ha` : `${Math.round(totalFloorSqm).toLocaleString()} m²`, sub: "total area" },
            ].map(({ label, value, sub, subColor }) => (
              <div key={label} className="rounded-theme border border-island_border bg-island_background p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                {sub && <p className={`text-xs mt-2 ${subColor ?? "text-muted-foreground"}`}>{sub}</p>}
              </div>
            ))}
          </div>

          {/* ── Charts row 1: status + tier + country ───────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <DonutChart title="Datacenter Status" data={byStatus} colorMap={STATUS_CHART_COLORS} />
            <DonutChart title="Tier Level Distribution" data={byTier} colorMap={TIER_COLORS} />
            <HBarChart title="Datacenters by Country / Region" data={byCountry} />
          </div>

          {/* ── Charts row 2: servers by DC + racks by DC ───────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HBarChart title="Servers per Datacenter" data={serversByDC} colors={CHART_COLORS} />
            <HBarChart title="Racks per Datacenter"   data={racksByDC}   colors={["#06B6D4", "#8B5CF6", "#F59E0B", "#EC4899", "#10B981", "#6366F1"]} />
          </div>

          {/* ── Datacenter cards ─────────────────────────────────────────────── */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              All Datacenters
            </h2>
            {datacenters.length === 0 ? (
              <div className="rounded-theme border border-island_border bg-island_background p-12 text-center text-muted-foreground">
                No datacenters found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {datacenters.map((dc) => {
                  const totalR   = dc.total_racks    ?? 0;
                  const usedR    = dc.occupied_racks ?? 0;
                  const rackPct  = totalR > 0 ? Math.round((usedR / totalR) * 100) : 0;
                  const statusCss = STATUS_CSS[dc.status?.toUpperCase()] ?? "text-gray-500 bg-gray-500/10 border-gray-500/20";

                  return (
                    <Link
                      key={dc.data_center_id}
                      href={`/datacenters/${dc.data_center_id}`}
                      className="block rounded-theme border border-island_border bg-island_background p-5 hover:bg-accent/20 transition-colors"
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {dc.data_center_name ?? `DC ${dc.data_center_id}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {[dc.city, dc.country].filter(Boolean).join(", ") || "Location unknown"}
                          </p>
                        </div>
                        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-theme text-xs font-medium border ${statusCss}`}>
                          {dc.status ?? "Unknown"}
                        </span>
                      </div>

                      {/* Key metrics */}
                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div className="rounded-theme bg-accent/10 py-2">
                          <p className="text-xs text-muted-foreground">Racks</p>
                          <p className="text-lg font-bold text-foreground">{totalR}</p>
                        </div>
                        <div className="rounded-theme bg-accent/10 py-2">
                          <p className="text-xs text-muted-foreground">Servers</p>
                          <p className="text-lg font-bold text-foreground">{dc.total_servers ?? 0}</p>
                        </div>
                        <div className="rounded-theme bg-accent/10 py-2">
                          <p className="text-xs text-muted-foreground">
                            {dc.tier_level ? dc.tier_level.replace("_", " ") : "Tier"}
                          </p>
                          <p className="text-lg font-bold text-foreground">—</p>
                        </div>
                      </div>

                      {/* Rack utilisation bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Rack utilisation</span>
                          <span>{usedR} / {totalR} ({rackPct}%)</span>
                        </div>
                        <CapacityBar
                          used={usedR}
                          total={totalR}
                          color={rackPct > 85 ? "#EF4444" : rackPct > 60 ? "#F59E0B" : "#10B981"}
                        />
                      </div>

                      {/* Footer: power / cooling */}
                      {(dc.power_capacity_kw || dc.cooling_capacity_kw) && (
                        <div className="mt-3 pt-3 border-t border-island_border grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          {dc.power_capacity_kw && (
                            <span>⚡ {parseFloat(dc.power_capacity_kw).toLocaleString()} kW</span>
                          )}
                          {dc.cooling_capacity_kw && (
                            <span>❄️ {parseFloat(dc.cooling_capacity_kw).toLocaleString()} kW</span>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
