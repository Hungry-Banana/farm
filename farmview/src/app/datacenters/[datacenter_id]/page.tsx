"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getDatacenterById, getDatacenterWithRacks, getDatacenterStatsById } from "@/lib/datacenters";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import FieldSection from "@/components/ui/FieldSection";
import TableSection from "@/components/ui/table/TableSection";
import { TabContainer, TabDefinition } from "@/components/ui/tab/TabContainer";
import DatacenterActionsDropdown from "@/components/ui/Buttons/DatacenterActionButton";

// Datacenter Racks Component
const RacksInventory = ({ racks }: { racks: any[] }) => {
  if (!racks || racks.length === 0) {
    return (
      <div className="p-5 text-center">
        <div className="text-muted-foreground">No racks found in this datacenter</div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <TableSection
        columns={[
          {
            key: 'rack_name',
            label: 'Rack Name',
            render: (value, rack) => (
              <Link
                href={`/datacenters/${rack.data_center_id}/racks/${rack.rack_id}`}
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <span className="text-sm">🗄️</span>
                <span className="font-medium">{value || `Rack ${rack.rack_id}`}</span>
              </Link>
            )
          },
          { key: 'rack_code', label: 'Code' },
          { key: 'rack_height_u', label: 'Height (U)' },
          {
            key: 'power_capacity_w',
            label: 'Power (W)',
            render: (value) => value ? `${value} W` : 'N/A'
          },
          {
            key: 'power_usage_w',
            label: 'Usage (W)',
            render: (value) => value ? `${value} W` : 'N/A'
          },
          { key: 'row_name', label: 'Row' },
          { key: 'aisle_name', label: 'Aisle' },
          { key: 'room_name', label: 'Room' },
          {
            key: 'cooling_type',
            label: 'Cooling',
            render: (value) => {
              const coolingColors: Record<string, string> = {
                AIR: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
                LIQUID: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
                HYBRID: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
                NONE: 'text-gray-500 bg-gray-500/10 border-gray-500/20'
              };
              const colorClass = coolingColors[value?.toUpperCase()] || coolingColors.NONE;
              return (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${colorClass}`}>
                  {value || 'None'}
                </span>
              );
            }
          },
        ]}
        data={racks}
        keyField="rack_id"
        searchable={true}
      />
    </div>
  );
};

// Datacenter Statistics Component
const DatacenterStats = ({ stats }: { stats: any }) => {
  if (!stats) {
    return (
      <div className="p-5 text-center">
        <div className="text-muted-foreground">No statistics available</div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Racks Statistics */}
        <div className="p-4 rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🗄️</span>
            <h3 className="text-lg font-semibold">Racks</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">{stats.total_racks || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Occupied:</span>
              <span className="font-semibold text-green-600">{stats.occupied_racks || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available:</span>
              <span className="font-semibold text-blue-600">
                {(stats.total_racks || 0) - (stats.occupied_racks || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Servers Statistics */}
        <div className="p-4 rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🖥️</span>
            <h3 className="text-lg font-semibold">Servers</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">{stats.total_servers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active:</span>
              <span className="font-semibold text-green-600">{stats.active_servers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inactive:</span>
              <span className="font-semibold text-red-600">{stats.inactive_servers || 0}</span>
            </div>
          </div>
        </div>

        {/* Capacity Statistics */}
        <div className="p-4 rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⚡</span>
            <h3 className="text-lg font-semibold">Capacity</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Power (kW):</span>
              <span className="font-semibold">{stats.power_capacity_kw || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cooling (kW):</span>
              <span className="font-semibold">{stats.cooling_capacity_kw || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Floor (m²):</span>
              <span className="font-semibold">{stats.floor_space_sqm || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const datacenterTabs: TabDefinition[] = [
  { id: "racks", label: "Racks", icon: "" },
  { id: "statistics", label: "Statistics", icon: "" },
];

export default function DatacenterPage() {
  const params = useParams();
  const datacenterId = parseInt(params.datacenter_id as string);
  const [datacenterData, setDatacenterData] = useState<any>(null);
  const [datacenterWithRacks, setDatacenterWithRacks] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDatacenter() {
      try {
        const [dcData, dcWithRacks, dcStats] = await Promise.all([
          getDatacenterById(datacenterId),
          getDatacenterWithRacks(datacenterId),
          getDatacenterStatsById(datacenterId)
        ]);
        setDatacenterData(dcData);
        setDatacenterWithRacks(dcWithRacks);
        setStats(dcStats);
      } catch (error) {
        console.error('Failed to load datacenter:', error);
      } finally {
        setLoading(false);
      }
    }

    if (!isNaN(datacenterId)) {
      loadDatacenter();
    } else {
      setLoading(false);
    }
  }, [datacenterId]);

  const datacenter = Array.isArray(datacenterData) ? datacenterData[0] : datacenterData;

  const statusConfig: { [key: string]: { color: string; bg: string; border: string; icon: string } } = {
    'ACTIVE': { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: '✅' },
    'INACTIVE': { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: '🔴' },
    'MAINTENANCE': { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: '🔧' },
    'CONSTRUCTION': { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: '🏗️' },
    'DECOMMISSIONED': { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: '⚫' },
    'DEFAULT': { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: '❓' }
  };

  const tierConfig: { [key: string]: { color: string; bg: string; border: string } } = {
    'TIER_I': { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    'TIER_II': { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    'TIER_III': { color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    'TIER_IV': { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    'UNKNOWN': { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading datacenter...</div>
        </div>
      </div>
    );
  }

  if (!datacenter) {
    return <p className="text-center p-8">Datacenter data not found.</p>;
  }

  const currentStatus = statusConfig[datacenter.status] || statusConfig['DEFAULT'];
  const currentTier = tierConfig[datacenter.tier_level] || tierConfig['UNKNOWN'];

  return (
    <div className="space-y-6">
      <Breadcrumb />

      {/* Main Content: Datacenter Details */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Datacenter Details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview and management of datacenter facilities
          </p>
        </div>

        {/* Datacenter Information Card */}
        <div className="rounded-theme border border-island_border bg-island_background p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-island_border pb-4 mb-5">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mt-1">
                  {datacenter.data_center_name || 'Unknown Datacenter'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-theme text-sm font-medium border ${currentStatus.color} ${currentStatus.bg} ${currentStatus.border}`}>
                    <span className="mr-1">{currentStatus.icon}</span>
                    {datacenter.status || 'Unknown'}
                  </span>
                  {datacenter.tier_level && (
                    <>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-theme text-sm font-medium border ${currentTier.color} ${currentTier.bg} ${currentTier.border}`}>
                        {datacenter.tier_level.replace('_', ' ')}
                      </span>
                    </>
                  )}
                  {datacenter.data_center_code && (
                    <>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm font-mono bg-accent/20 px-2 py-1 rounded">
                        {datacenter.data_center_code}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <DatacenterActionsDropdown datacenterId={datacenter.data_center_id} />
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Column: Basic Information & Location */}
            <div className="space-y-6">
              <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
                <div className="space-y-5 text-sm text-foreground font-mono">
                  {/* Basic Information Section */}
                  <FieldSection fields={[
                    { label: 'Datacenter ID', value: datacenter.data_center_id, icon: '' },
                    { label: 'Code', value: datacenter.data_center_code, icon: '' },
                    { label: 'Name', value: datacenter.data_center_name, icon: '' },
                    { label: 'Status', value: datacenter.status, icon: '' },
                    { label: 'Tier Level', value: datacenter.tier_level?.replace('_', ' '), icon: '' },
                  ]} />

                  {/* Separator Line */}
                  <div className="border-t border-island_border my-3"></div>

                  {/* Capacity Tracking */}
                  <FieldSection fields={[
                    { label: 'Total Racks', value: datacenter.total_racks || '0', icon: '' },
                    { label: 'Occupied Racks', value: datacenter.occupied_racks || '0', icon: '' },
                    { label: 'Total Servers', value: datacenter.total_servers || '0', icon: '' },
                  ]} />

                  {/* Separator Line */}
                  <div className="border-t border-island_border my-3"></div>

                  {/* Facility Details */}
                  <FieldSection fields={[
                    { 
                      label: 'Floor Space', 
                      value: datacenter.total_floor_space_sqm 
                        ? `${parseFloat(datacenter.total_floor_space_sqm).toLocaleString()} m²` 
                        : 'N/A', 
                      icon: '' 
                    },
                    { 
                      label: 'Power Capacity', 
                      value: datacenter.power_capacity_kw 
                        ? `${parseFloat(datacenter.power_capacity_kw).toLocaleString()} kW` 
                        : 'N/A', 
                      icon: '' 
                    },
                    { 
                      label: 'Cooling Capacity', 
                      value: datacenter.cooling_capacity_kw 
                        ? `${parseFloat(datacenter.cooling_capacity_kw).toLocaleString()} kW` 
                        : 'N/A', 
                      icon: '' 
                    },
                  ]} />

                  {/* Separator Line */}
                  <div className="border-t border-island_border my-3"></div>

                  {/* Timestamps */}
                  <FieldSection fields={[
                    { 
                      label: '📅 Created', 
                      value: datacenter.created_at 
                        ? new Date(datacenter.created_at).toLocaleDateString() 
                        : 'N/A', 
                      icon: '' 
                    },
                    { 
                      label: '🔄 Updated', 
                      value: datacenter.updated_at 
                        ? new Date(datacenter.updated_at).toLocaleDateString() 
                        : 'N/A', 
                      icon: '' 
                    },
                  ]} />
                </div>
              </div>
            </div>

            {/* Right Column: Facility Details & Contact Information */}
            <div className="space-y-6">
              <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors">
                <div className="space-y-4 text-sm text-foreground font-mono">

                  {/* Address Section */}
                  <FieldSection fields={[
                    { label: 'Address', value: datacenter.address, icon: '' },
                    { label: 'City', value: datacenter.city, icon: '' },
                    { label: 'State/Province', value: datacenter.state_province, icon: '' },
                    { label: 'Country', value: datacenter.country, icon: '' },
                    { label: 'Postal Code', value: datacenter.postal_code, icon: '' },
                    { label: 'Region', value: datacenter.region, icon: '' },
                  ]} />

                  {/* Separator Line */}
                  <div className="border-t border-island_border my-3"></div>

                  {/* Geographic Coordinates */}
                  <FieldSection fields={[
                    { 
                      label: 'Latitude', 
                      value: datacenter.latitude ? parseFloat(datacenter.latitude).toFixed(6) : 'N/A', 
                      icon: '' 
                    },
                    { 
                      label: 'Longitude', 
                      value: datacenter.longitude ? parseFloat(datacenter.longitude).toFixed(6) : 'N/A', 
                      icon: '' 
                    },
                    { label: 'Timezone', value: datacenter.timezone, icon: '' },
                    { label: 'Operating Hours', value: datacenter.operating_hours, icon: '' },
                  ]} />

                  {/* Separator Line */}
                  <div className="border-t border-island_border my-3"></div>

                  {/* Contact Information */}
                  <FieldSection fields={[
                    { label: 'Provider', value: datacenter.provider, icon: '' },
                    { label: 'Facility ID', value: datacenter.provider_facility_id, icon: '' },
                    { label: 'Facility Manager', value: datacenter.facility_manager, icon: '' },
                    { label: 'Contact Phone', value: datacenter.contact_phone, icon: '' },
                    { 
                      label: 'Contact Email', 
                      value: datacenter.contact_email ? (
                        <a 
                          href={`mailto:${datacenter.contact_email}`}
                          className="text-primary hover:underline"
                        >
                          {datacenter.contact_email}
                        </a>
                      ) : 'N/A',
                      icon: '' 
                    },
                    { label: 'Emergency Contact', value: datacenter.emergency_contact, icon: '' },
                    { label: 'Emergency Phone', value: datacenter.emergency_phone, icon: '' },
                  ]} />
                </div>
              </div>
            </div>
          </div>

          {/* Description Section (full width) */}
          {datacenter.description && (
            <div className="mt-5 pt-5 border-t border-island_border">
              <div className="rounded-theme bg-accent/10 hover:bg-accent/20 transition-colors p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  Description
                </h3>
                <p className="text-sm text-muted-foreground">
                  {datacenter.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section: Racks & Statistics */}
      <div>
        <div className="rounded-theme border border-island_border bg-island_background p-6 border-b border-island_border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Datacenter Resources</h2>
                <p className="text-sm text-muted-foreground">Racks, statistics, and resource utilization</p>
              </div>
            </div>
          </div>
        </div>
        <TabContainer
          tabs={datacenterTabs}
          defaultTab="racks"
          content={{
            racks: <RacksInventory racks={datacenterWithRacks?.racks || []} />,
            statistics: <DatacenterStats stats={stats} />,
          }}
        />
      </div>
    </div>
  );
}
