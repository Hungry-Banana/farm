"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { SwitchIcon } from "@/assets/icons";
import { getSwitchById, getSwitchStatById, getPortsBySwitch, getVlansBySwitch } from "@/lib/switches";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import FieldSection from "@/components/ui/FieldSection";
import TableSection from "@/components/ui/table/TableSection";
import { TabContainer, TabDefinition } from "@/components/ui/tab/TabContainer";
import SwitchActionsDropdown from "@/components/ui/Buttons/SwitchActionButton";

// -------------------------------------------------------
// Status / role colour helpers
// -------------------------------------------------------
const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':       return 'text-green-500 bg-green-500/10 border-green-500/20';
    case 'INACTIVE':     return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'MAINTENANCE':  return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'NEW':          return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    case 'RMA':          return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
    case 'DECOMMISSIONED': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    default:             return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  }
};

const getOperStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'UP':      return 'text-green-500 bg-green-500/10 border-green-500/20';
    case 'DOWN':    return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'TESTING': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    default:        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  }
};

// -------------------------------------------------------
// Ports tab
// -------------------------------------------------------
const PortsTab = ({ switchId }: { switchId: number }) => {
  const [ports, setPorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPortsBySwitch(switchId).then(data => {
      setPorts(data || []);
      setLoading(false);
    });
  }, [switchId]);

  if (loading) return <div className="p-5 text-muted-foreground text-center">Loading ports…</div>;
  if (!ports.length) return <div className="p-5 text-muted-foreground text-center">No ports found.</div>;

  return (
    <div className="p-5">
      <TableSection
        keyField="switch_port_id"
        searchable={false}
        data={ports}
        columns={[
          { key: 'name', label: 'Port' },
          { key: 'port_type', label: 'Type' },
          {
            key: 'admin_status',
            label: 'Admin',
            render: (v) => (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-theme text-xs font-medium border ${getOperStatusColor(v)}`}>
                {v || '—'}
              </span>
            ),
          },
          {
            key: 'oper_status',
            label: 'Oper',
            render: (v) => (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-theme text-xs font-medium border ${getOperStatusColor(v)}`}>
                {v || '—'}
              </span>
            ),
          },
          {
            key: 'speed_mbps',
            label: 'Speed',
            render: (v) => {
              if (!v) return '—';
              if (v >= 100000) return `${v / 1000}G`;
              if (v >= 1000) return `${v / 1000}G`;
              return `${v}M`;
            },
          },
          { key: 'port_mode', label: 'Mode' },
          { key: 'access_vlan_id', label: 'VLAN' },
          { key: 'connected_device_name', label: 'Connected Device' },
          { key: 'connected_device_ip', label: 'Device IP' },
          { key: 'description', label: 'Description' },
        ]}
      />
    </div>
  );
};

// -------------------------------------------------------
// VLANs tab
// -------------------------------------------------------
const VlansTab = ({ switchId }: { switchId: number }) => {
  const [vlans, setVlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVlansBySwitch(switchId).then(data => {
      setVlans(data || []);
      setLoading(false);
    });
  }, [switchId]);

  if (loading) return <div className="p-5 text-muted-foreground text-center">Loading VLANs…</div>;
  if (!vlans.length) return <div className="p-5 text-muted-foreground text-center">No VLANs configured.</div>;

  return (
    <div className="p-5">
      <TableSection
        keyField="vlan_db_id"
        searchable={false}
        data={vlans}
        columns={[
          { key: 'vlan_id', label: 'VLAN ID' },
          { key: 'vlan_name', label: 'Name' },
          {
            key: 'vlan_status',
            label: 'Status',
            render: (v) => (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-theme text-xs font-medium border ${
                v === 'ACTIVE'
                  ? 'text-green-500 bg-green-500/10 border-green-500/20'
                  : 'text-red-500 bg-red-500/10 border-red-500/20'
              }`}>
                {v || '—'}
              </span>
            ),
          },
          {
            key: 'created_at',
            label: 'Created',
            render: (v) => v ? new Date(v).toLocaleDateString() : '—',
          },
        ]}
      />
    </div>
  );
};

// -------------------------------------------------------
// Stats tab
// -------------------------------------------------------
const StatsTab = ({ switchId }: { switchId: number }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSwitchStatById(switchId).then(data => {
      setStats(data);
      setLoading(false);
    });
  }, [switchId]);

  if (loading) return <div className="p-5 text-muted-foreground text-center">Loading statistics…</div>;
  if (!stats) return <div className="p-5 text-muted-foreground text-center">No statistics available.</div>;

  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-theme border border-island_border bg-accent/10 p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Ports</p>
          <p className="text-2xl font-bold text-foreground">{stats.total_ports ?? '—'}</p>
        </div>
        <div className="rounded-theme border border-island_border bg-accent/10 p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Ports Up</p>
          <p className="text-2xl font-bold text-green-500">{stats.up_ports ?? '—'}</p>
        </div>
        <div className="rounded-theme border border-island_border bg-accent/10 p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Ports Down</p>
          <p className="text-2xl font-bold text-red-500">{stats.down_ports ?? '—'}</p>
        </div>
        <div className="rounded-theme border border-island_border bg-accent/10 p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Utilization</p>
          <p className="text-2xl font-bold text-primary">
            {stats.port_utilization_pct != null ? `${Math.round(stats.port_utilization_pct)}%` : '—'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-theme border border-island_border bg-accent/10 p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">VLANs</p>
          <p className="text-2xl font-bold text-foreground">{stats.total_vlans ?? '—'}</p>
        </div>
        {stats.ports_by_type?.length > 0 && (
          <div className="rounded-theme border border-island_border bg-accent/10 p-4 col-span-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Ports by Type</p>
            <div className="flex flex-wrap gap-2">
              {stats.ports_by_type.map(([type, count]: [string, number]) => (
                <span key={type} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-theme text-xs bg-primary/10 text-primary border border-primary/20">
                  {type}: <strong>{count}</strong>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------
// Main page
// -------------------------------------------------------
const detailTabs: TabDefinition[] = [
  { id: 'ports', label: 'Ports', icon: '' },
  { id: 'vlans', label: 'VLANs', icon: '' },
  { id: 'stats', label: 'Statistics', icon: '' },
];

export default function SwitchDetailPage() {
  const params = useParams();
  const switchId = parseInt(params.switch_id as string);

  const [sw, setSw] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isNaN(switchId)) { setLoading(false); return; }
    getSwitchById(switchId).then(data => {
      // getSwitchById returns SwitchWithPorts (switch + ports + vlans)
      setSw(data);
      setLoading(false);
    });
  }, [switchId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-muted-foreground">Loading switch…</div>
      </div>
    );
  }

  // The backend returns {switch: {...}, ports: [...], vlans: [...]} via SwitchWithPorts
  // getSwitchById calls GET /switches/{id} which returns SwitchWithPorts flattened via #[serde(flatten)]
  // so top-level fields ARE the switch fields, with extra 'ports' and 'vlans' arrays.
  const switchData = sw;

  if (!switchData) {
    return <p className="text-center p-8 text-muted-foreground">Switch not found.</p>;
  }

  const statusCss = getStatusColor(switchData.status);

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Switch Details</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor and manage this network switch</p>
      </div>

      {/* Main info card */}
      <div className="rounded-theme border border-island_border bg-island_background p-5">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-island_border pb-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-theme bg-primary/10">
              <SwitchIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{switchData.switch_name || 'Unknown Switch'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-theme text-sm font-medium border ${statusCss}`}>
                  {switchData.status || 'Unknown'}
                </span>
                {switchData.switch_role && (
                  <>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{switchData.switch_role}</span>
                  </>
                )}
                {switchData.environment_type && (
                  <>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{switchData.environment_type}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div>
            <SwitchActionsDropdown switchId={switchId} />
          </div>
        </div>

        {/* Two-column detail layout mirroring server page */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Left: Identity & Location */}
          <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors p-4 space-y-5 text-sm font-mono">
            <FieldSection fields={[
              { label: 'Switch ID',    value: switchData.switch_id,        icon: '' },
              { label: 'Switch Name',  value: switchData.switch_name,      icon: '' },
              { label: 'Role',         value: switchData.switch_role,      icon: '' },
              { label: 'Status',       value: switchData.status,           icon: '' },
              { label: 'Environment',  value: switchData.environment_type, icon: '' },
              { label: 'Serial No.',   value: switchData.serial_number,    icon: '' },
              { label: 'Asset Tag',    value: switchData.asset_tag,        icon: '' },
            ]} />

            <div className="border-t border-island_border" />

            <FieldSection fields={[
              { label: 'Data Center',  value: switchData.data_center_id  || '—', icon: '' },
              { label: 'Cluster',      value: switchData.cluster_id      || '—', icon: '' },
              { label: 'Sub-Cluster',  value: switchData.sub_cluster_id  || '—', icon: '' },
              { label: 'Rack',         value: switchData.rack_id         || '—', icon: '' },
              { label: 'Rack Position',value: switchData.rack_position_id|| '—', icon: '' },
            ]} />
          </div>

          {/* Right: Network & Firmware */}
          <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors p-4 space-y-5 text-sm font-mono">
            <FieldSection fields={[
              { label: 'Mgmt IP',      value: switchData.mgmt_ip_address  || '—', icon: '' },
              { label: 'Mgmt MAC',     value: switchData.mgmt_mac_address || '—', icon: '' },
              { label: 'Mgmt VLAN',    value: switchData.mgmt_vlan_id     || '—', icon: '' },
            ]} />

            <div className="border-t border-island_border" />

            <FieldSection fields={[
              { label: 'OS Type',      value: switchData.os_type         || '—', icon: '' },
              { label: 'OS Version',   value: switchData.os_version      || '—', icon: '' },
              { label: 'Boot ROM',     value: switchData.bootrom_version || '—', icon: '' },
            ]} />

            <div className="border-t border-island_border" />

            <FieldSection fields={[
              { label: 'Auth Method',  value: switchData.auth_method     || '—', icon: '' },
              { label: 'SNMP Version', value: switchData.snmp_version    || '—', icon: '' },
              { label: 'Poll Interval',value: switchData.poll_interval_seconds ? `${switchData.poll_interval_seconds}s` : '—', icon: '' },
              { label: 'Last Poll',    value: switchData.last_poll_at    ? new Date(switchData.last_poll_at).toLocaleString() : '—', icon: '' },
            ]} />

            <div className="border-t border-island_border" />

            <FieldSection fields={[
              { label: 'Temperature',  value: switchData.temperature_celsius != null ? `${switchData.temperature_celsius}°C` : '—', icon: '' },
              { label: 'Fan Status',   value: switchData.fan_status      || '—', icon: '' },
              { label: 'Power (W)',    value: switchData.power_consumption_watts != null ? `${switchData.power_consumption_watts}W` : '—', icon: '' },
              { label: 'Uptime',       value: switchData.uptime_seconds  != null
                ? (() => {
                    const d = Math.floor(switchData.uptime_seconds / 86400);
                    const h = Math.floor((switchData.uptime_seconds % 86400) / 3600);
                    return `${d}d ${h}h`;
                  })()
                : '—', icon: '' },
              { label: 'Created',      value: switchData.created_at ? new Date(switchData.created_at).toLocaleDateString() : '—', icon: '' },
              { label: 'Updated',      value: switchData.updated_at ? new Date(switchData.updated_at).toLocaleDateString() : '—', icon: '' },
            ]} />
          </div>
        </div>
      </div>

      {/* Ports / VLANs / Stats tabs */}
      <div>
        <div className="rounded-theme border border-island_border bg-island_background p-6 border-b-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔌</span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Ports, VLANs &amp; Statistics</h2>
              <p className="text-sm text-muted-foreground">Port inventory, VLAN database, and utilisation metrics</p>
            </div>
          </div>
        </div>
        <TabContainer
          tabs={detailTabs}
          defaultTab="ports"
          content={{
            ports: <PortsTab switchId={switchId} />,
            vlans: <VlansTab switchId={switchId} />,
            stats: <StatsTab switchId={switchId} />,
          }}
        />
      </div>
    </div>
  );
}
