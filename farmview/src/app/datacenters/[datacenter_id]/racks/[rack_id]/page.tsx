"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getRackById, getRackWithPositions, getRackUtilization } from "@/lib/datacenters";
import { getServersByRackId } from "@/lib/servers";
import { getSwitchesByRackId } from "@/lib/switches";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import FieldSection from "@/components/ui/FieldSection";
import TableSection from "@/components/ui/table/TableSection";
import { TabContainer, TabDefinition } from "@/components/ui/tab/TabContainer";
import RackActionsDropdown from "@/components/ui/Buttons/RackActionButton";

// Rack Positions inventory
const PositionsInventory = ({ positions }: { positions: any[] }) => {
  if (!positions || positions.length === 0) {
    return (
      <div className="p-5 text-center">
        <div className="text-muted-foreground">No positions found in this rack</div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <TableSection
        columns={[
          {
            key: "u_position",
            label: "U Position",
            render: (value, position) => {
              if (position._is_span) {
                return <span className="font-mono text-muted-foreground">U{value}</span>;
              }
              const height = position._server?.u_height ?? 1;
              const end = value + height - 1;
              const label = height > 1 ? `U${value}–U${end}` : `U${value}`;
              return <span className="font-mono font-semibold">{label}</span>;
            },
          },
          {
            key: "u_height",
            label: "U Size",
            render: (_value, position) => {
              if (position._is_span) {
                return <span className="text-muted-foreground text-xs">↑</span>;
              }
              const h = position._server?.u_height ?? 1;
              return <span className="font-mono">{h}U</span>;
            },
          },
          {
            key: "status",
            label: "Status",
            render: (value, position) => {
              if (position._is_span) return <span className="text-muted-foreground text-xs">↑</span>;
              // If a server is linked, treat as OCCUPIED regardless of stored status
              const effectiveStatus = position._server ? 'OCCUPIED' : (value || 'AVAILABLE');
              const statusColors: Record<string, string> = {
                AVAILABLE: "text-green-500 bg-green-500/10 border-green-500/20",
                OCCUPIED: "text-blue-500 bg-blue-500/10 border-blue-500/20",
                RESERVED: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
                BLOCKED: "text-red-500 bg-red-500/10 border-red-500/20",
              };
              const colorClass =
                statusColors[effectiveStatus.toUpperCase()] || "text-gray-500 bg-gray-500/10 border-gray-500/20";
              return (
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${colorClass}`}
                >
                  {effectiveStatus}
                </span>
              );
            },
          },
          {
            key: "device_type",
            label: "Device Type",
            render: (value, position) => {
              if (position._is_span) return <span className="text-muted-foreground text-xs">↑</span>;
              // If a server is linked but device_type wasn't set, show SERVER
              return value || (position._server ? "SERVER" : "—");
            },
          },
          {
            key: "server_id",
            label: "Device",
            render: (value, position) => {
              if (position._is_span) return <span className="text-muted-foreground text-xs">↑</span>;
              const deviceType = (position.device_type || "").toUpperCase();
              // Server
              const server = position._server;
              if (server) {
                return (
                  <Link
                    href={`/servers/${server.server_id}`}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <span className="text-sm">🖥️</span>
                    <span className="font-medium">{server.server_name || `Server ${server.server_id}`}</span>
                  </Link>
                );
              }
              // Switch / TOR
              const sw = position._switch;
              if (sw) {
                return (
                  <Link
                    href={`/networking/switches/${sw.switch_id}`}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <span className="text-sm">🔀</span>
                    <span className="font-medium">{sw.switch_name || `Switch ${sw.switch_id}`}</span>
                  </Link>
                );
              }
              // Fallback: bare server_id link for SERVER type
              if (value && (deviceType === "SERVER" || deviceType === "")) {
                return (
                  <Link
                    href={`/servers/${value}`}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <span className="text-sm">🖥️</span>
                    <span className="font-medium">Server {value}</span>
                  </Link>
                );
              }
              return <span className="text-muted-foreground">—</span>;
            },
          },
          {
            key: "reserved_for",
            label: "Reserved For",
            render: (value, position) => {
              if (position._is_span) return null;
              return value || "—";
            },
          },
          {
            key: "notes",
            label: "Notes",
            render: (value, position) => {
              if (position._is_span) return null;
              return value || "—";
            },
          },
        ]}
        data={positions}
        keyField="rack_position_id"
        searchable={true}
      />
    </div>
  );
};

// Rack Utilization Statistics
const RackUtilization = ({ utilization, rack }: { utilization: any; rack: any }) => {
  const totalU = rack?.rack_height_u ?? 0;
  const occupiedU = rack?.occupied_u ?? 0;
  const freeU = rack?.free_u ?? 0;
  const reservedU = rack?.reserved_u ?? 0;
  const powerCapacity = rack?.power_capacity_w;
  const powerUsage = rack?.power_usage_w;

  const utilizationPct = totalU > 0 ? Math.round((occupiedU / totalU) * 100) : 0;
  const powerPct =
    powerCapacity && powerUsage ? Math.round((powerUsage / powerCapacity) * 100) : null;

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* U Space */}
        <div className="p-4 rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📐</span>
            <h3 className="text-lg font-semibold">U Space</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">{totalU}U</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Occupied:</span>
              <span className="font-semibold text-blue-600">{occupiedU}U</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reserved:</span>
              <span className="font-semibold text-yellow-600">{reservedU}U</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Free:</span>
              <span className="font-semibold text-green-600">{freeU}U</span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Utilization</span>
                <span className="font-semibold">{utilizationPct}%</span>
              </div>
              <div className="w-full bg-accent/30 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${utilizationPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Power */}
        <div className="p-4 rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⚡</span>
            <h3 className="text-lg font-semibold">Power</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Capacity:</span>
              <span className="font-semibold">
                {powerCapacity ? `${powerCapacity.toLocaleString()} W` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usage:</span>
              <span className="font-semibold text-orange-600">
                {powerUsage ? `${powerUsage.toLocaleString()} W` : "N/A"}
              </span>
            </div>
            {powerPct !== null && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Load</span>
                  <span className="font-semibold">{powerPct}%</span>
                </div>
                <div className="w-full bg-accent/30 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      powerPct > 80 ? "bg-red-500" : powerPct > 60 ? "bg-orange-500" : "bg-green-500"
                    }`}
                    style={{ width: `${powerPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Physical Specs */}
        <div className="p-4 rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📏</span>
            <h3 className="text-lg font-semibold">Physical</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Height:</span>
              <span className="font-semibold">{rack?.rack_height_u ? `${rack.rack_height_u}U` : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Width:</span>
              <span className="font-semibold">
                {rack?.rack_width_mm ? `${rack.rack_width_mm} mm` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Depth:</span>
              <span className="font-semibold">
                {rack?.rack_depth_mm ? `${rack.rack_depth_mm} mm` : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const rackTabs: TabDefinition[] = [
  { id: "positions", label: "Positions", icon: "" },
  { id: "utilization", label: "Utilization", icon: "" },
];

export default function RackPage() {
  const params = useParams();
  const rackId = parseInt(params.rack_id as string);
  const datacenterId = parseInt(params.datacenter_id as string);

  const [rack, setRack] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [utilization, setUtilization] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRack() {
      try {
        const [rackData, rackWithPositions, rackUtil, rackServers, rackSwitches] = await Promise.all([
          getRackById(rackId),
          getRackWithPositions(rackId),
          getRackUtilization(rackId),
          getServersByRackId(rackId),
          getSwitchesByRackId(rackId),
        ]);

        const rackRecord = Array.isArray(rackData) ? rackData[0] : rackData;

        // Build a map from rack_position_id -> server AND server_id -> server
        const servers: any[] = Array.isArray(rackServers) ? rackServers : [];
        const serverByPositionId: Record<number, any> = {};
        const serverByServerId: Record<number, any> = {};
        for (const s of servers) {
          if (s.rack_position_id != null) serverByPositionId[s.rack_position_id] = s;
          if (s.server_id != null) serverByServerId[s.server_id] = s;
        }

        // Build a map from rack_position_id -> switch
        const switches: any[] = Array.isArray(rackSwitches) ? rackSwitches : [];
        const switchByPositionId: Record<number, any> = {};
        for (const sw of switches) {
          if (sw.rack_position_id != null) switchByPositionId[sw.rack_position_id] = sw;
        }

        // Enrich positions with _server and _switch lookups
        const rawPositions: any[] = rackWithPositions?.positions || [];
        const enriched = rawPositions.map((p: any) => ({
          ...p,
          _server:
            serverByPositionId[p.rack_position_id] ??
            (p.server_id != null ? serverByServerId[p.server_id] : null) ??
            null,
          _switch: switchByPositionId[p.rack_position_id] ?? null,
        }));

        // Build a set of U slots already covered by a DB position row
        const knownSlots = new Set(enriched.map((p: any) => p.u_position));

        // For each multi-U server, synthesise continuation rows for U+1..U+(height-1)
        const spanRows: any[] = [];
        for (const p of enriched) {
          const height: number = p._server?.u_height ?? 1;
          for (let offset = 1; offset < height; offset++) {
            const slot = p.u_position + offset;
            if (!knownSlots.has(slot)) {
              spanRows.push({
                rack_position_id: `${p.rack_position_id}_span_${offset}`,
                rack_id: p.rack_id,
                u_position: slot,
                status: p.status,
                device_type: p.device_type,
                server_id: p.server_id,
                reserved_for: p.reserved_for,
                notes: null,
                _server: p._server,
                _switch: p._switch,
                _is_span: true,
                _span_root: p.u_position,
              });
              knownSlots.add(slot);
            }
          }
        }

        // Fill empty U slots with phantom AVAILABLE rows
        const totalU: number = (Array.isArray(rackData) ? rackData[0] : rackData)?.rack_height_u ?? 0;
        const emptyRows: any[] = [];
        for (let u = 1; u <= totalU; u++) {
          if (!knownSlots.has(u)) {
            emptyRows.push({
              rack_position_id: `empty_${u}`,
              rack_id: rackId,
              u_position: u,
              status: "AVAILABLE",
              device_type: null,
              server_id: null,
              reserved_for: null,
              notes: null,
              _server: null,
              _switch: null,
              _is_span: false,
            });
          }
        }

        const enrichedPositions = [...enriched, ...spanRows, ...emptyRows].sort(
          (a, b) => a.u_position - b.u_position
        );

        setRack(rackRecord);
        setPositions(enrichedPositions);
        setUtilization(rackUtil);
      } catch (error) {
        console.error("Failed to load rack:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!isNaN(rackId)) {
      loadRack();
    } else {
      setLoading(false);
    }
  }, [rackId]);

  const statusConfig: { [key: string]: { color: string; bg: string; border: string; icon: string } } = {
    ACTIVE: { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", icon: "✅" },
    INACTIVE: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: "🔴" },
    MAINTENANCE: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "🔧" },
    RESERVED: { color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "🔒" },
    DECOMMISSIONED: { color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/20", icon: "⚫" },
    DEFAULT: { color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/20", icon: "❓" },
  };

  const coolingColors: Record<string, string> = {
    AIR: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    LIQUID: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    HYBRID: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    NONE: "text-gray-500 bg-gray-500/10 border-gray-500/20",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading rack...</div>
      </div>
    );
  }

  if (!rack) {
    return <p className="text-center p-8">Rack data not found.</p>;
  }

  const currentStatus = statusConfig[rack.status] || statusConfig["DEFAULT"];
  const coolingClass =
    coolingColors[rack.cooling_type?.toUpperCase()] || coolingColors.NONE;

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div className="grid grid-cols-1 gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rack Details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview and management of datacenter rack
          </p>
        </div>

        {/* Rack Information Card */}
        <div className="rounded-theme border border-island_border bg-island_background p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-island_border pb-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-theme bg-primary/10">
                <span className="text-2xl">🗄️</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mt-1">
                  {rack.rack_name || "Unknown Rack"}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-theme text-sm font-medium border ${currentStatus.color} ${currentStatus.bg} ${currentStatus.border}`}
                  >
                    <span className="mr-1">{currentStatus.icon}</span>
                    {rack.status || "Unknown"}
                  </span>
                  {rack.rack_code && (
                    <>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm font-mono bg-accent/20 px-2 py-1 rounded">
                        {rack.rack_code}
                      </span>
                    </>
                  )}
                  {rack.cooling_type && (
                    <>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-theme text-sm font-medium border ${coolingClass}`}
                      >
                        {rack.cooling_type}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <RackActionsDropdown rackId={rack.rack_id} datacenterId={rack.data_center_id} />
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
                      { label: "Rack ID", value: rack.rack_id, icon: "" },
                      { label: "Code", value: rack.rack_code, icon: "" },
                      { label: "Name", value: rack.rack_name, icon: "" },
                      { label: "Status", value: rack.status, icon: "" },
                    ]}
                  />

                  <div className="border-t border-island_border my-3"></div>

                  <FieldSection
                    fields={[
                      { label: "Height", value: rack.rack_height_u ? `${rack.rack_height_u}U` : "N/A", icon: "" },
                      { label: "Width", value: rack.rack_width_mm ? `${rack.rack_width_mm} mm` : "N/A", icon: "" },
                      { label: "Depth", value: rack.rack_depth_mm ? `${rack.rack_depth_mm} mm` : "N/A", icon: "" },
                    ]}
                  />

                  <div className="border-t border-island_border my-3"></div>

                  <FieldSection
                    fields={[
                      { label: "Total U Available", value: rack.total_u_available ?? "N/A", icon: "" },
                      { label: "Occupied U", value: rack.occupied_u ?? "0", icon: "" },
                      { label: "Reserved U", value: rack.reserved_u ?? "0", icon: "" },
                      { label: "Free U", value: rack.free_u ?? "N/A", icon: "" },
                    ]}
                  />

                  <div className="border-t border-island_border my-3"></div>

                  <FieldSection
                    fields={[
                      {
                        label: "📅 Created",
                        value: rack.created_at
                          ? new Date(rack.created_at).toLocaleDateString()
                          : "N/A",
                        icon: "",
                      },
                      {
                        label: "🔄 Updated",
                        value: rack.updated_at
                          ? new Date(rack.updated_at).toLocaleDateString()
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
                      { label: "Row", value: rack.row_name, icon: "" },
                      { label: "Aisle", value: rack.aisle_name, icon: "" },
                      { label: "Room", value: rack.room_name, icon: "" },
                      {
                        label: "Floor Level",
                        value: rack.floor_level !== null && rack.floor_level !== undefined
                          ? String(rack.floor_level)
                          : "N/A",
                        icon: "",
                      },
                    ]}
                  />

                  <div className="border-t border-island_border my-3"></div>

                  <FieldSection
                    fields={[
                      {
                        label: "Power Capacity",
                        value: rack.power_capacity_w
                          ? `${rack.power_capacity_w.toLocaleString()} W`
                          : "N/A",
                        icon: "",
                      },
                      {
                        label: "Power Usage",
                        value: rack.power_usage_w
                          ? `${rack.power_usage_w.toLocaleString()} W`
                          : "N/A",
                        icon: "",
                      },
                      { label: "Cooling Type", value: rack.cooling_type, icon: "" },
                      { label: "Network Zone", value: rack.network_zone, icon: "" },
                      { label: "Access Level", value: rack.access_level, icon: "" },
                    ]}
                  />

                  <div className="border-t border-island_border my-3"></div>

                  <FieldSection
                    fields={[
                      {
                        label: "Parent Datacenter",
                        value: rack.data_center_id ? String(rack.data_center_id) : "N/A",
                        icon: "",
                      },
                    ]}
                  />

                  {rack.data_center_id && (
                    <div className="px-4 pb-2">
                      <Link
                        href={`/datacenters/${rack.data_center_id}`}
                        className="text-primary hover:text-primary/80 text-sm transition-colors"
                      >
                        → View parent datacenter
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {rack.description && (
                <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{rack.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs: Positions & Utilization */}
        <div className="rounded-theme border border-island_border bg-island_background">
          <div className="p-5 border-b border-island_border">
            <h2 className="text-lg font-semibold text-foreground">Rack Resources</h2>
            <p className="text-sm text-muted-foreground">Positions, servers, and utilization</p>
          </div>
          <TabContainer
            tabs={rackTabs}
            defaultTab="positions"
            content={{
              positions: <PositionsInventory positions={positions} />,
              utilization: <RackUtilization utilization={utilization} rack={rack} />,
            }}
          />
        </div>
      </div>
    </div>
  );
}
