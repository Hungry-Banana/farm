"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";
import DBTableSection, { SearchCriteria } from "@/components/ui/table/DBTableSection";
import SwitchCellContent from "@/components/ui/table/SwitchCellContent";
import { getSwitchesPaginated, getSwitchStats } from "@/lib/switches";

export default function SwitchManagementPage() {
    const [switches, setSwitches] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria[]>([]);
    const itemsPerPage = 15;

    const reorderKeys = (items: any[], keyOrder: string[]) => {
        return items.map(item => {
            const ordered: any = {};
            keyOrder.forEach(key => {
                if (key in item) ordered[key] = item[key];
            });
            Object.keys(item).forEach(key => {
                if (!(key in ordered)) ordered[key] = item[key];
            });
            return ordered;
        });
    };

    useEffect(() => {
        const fetchSwitches = async () => {
            try {
                setLoading(true);

                const formattedCriteria = searchCriteria.map((criterion, index) => ({
                    id: `search-${index}`,
                    column: criterion.column,
                    comparisonOperator: criterion.operator as any,
                    term: criterion.value,
                    operator: criterion.logicToNext || 'AND',
                }));

                const [response, statsData] = await Promise.all([
                    getSwitchesPaginated(currentPage, itemsPerPage, {}, formattedCriteria),
                    currentPage === 1 ? getSwitchStats() : Promise.resolve(null),
                ]);

                const desiredOrder = [
                    'switch_id',
                    'switch_name',
                    'status',
                    'switch_role',
                    'environment_type',
                    'mgmt_ip_address',
                    'os_type',
                    'os_version',
                    'cluster_id',
                    'data_center_id',
                    'rack_id',
                    'last_poll_at',
                    'created_at',
                ];

                setSwitches(reorderKeys(response.data || [], desiredOrder));
                setTotalItems(response.total || 0);
                if (statsData) setStats(statsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch switches');
            } finally {
                setLoading(false);
            }
        };

        fetchSwitches();
    }, [currentPage, searchCriteria]);

    const handlePageChange = (page: number) => setCurrentPage(page);

    const handleSearch = (criteria: SearchCriteria[]) => {
        setSearchCriteria(criteria);
        setCurrentPage(1);
    };

    return (
        <div>
            <Breadcrumb />

            {/* Page Header */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-theme bg-primary/10">
                        <span className="text-2xl">🔀</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Switch Management</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage and monitor your network switch infrastructure
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="rounded-theme border border-island_border bg-island_background p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Switches</p>
                        <p className="text-2xl font-bold text-foreground">{stats.total_switches ?? '—'}</p>
                    </div>
                    <div className="rounded-theme border border-island_border bg-island_background p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Ports</p>
                        <p className="text-2xl font-bold text-foreground">{stats.total_ports ?? '—'}</p>
                    </div>
                    <div className="rounded-theme border border-island_border bg-island_background p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Ports Up</p>
                        <p className="text-2xl font-bold text-green-500">{stats.up_ports ?? '—'}</p>
                    </div>
                    <div className="rounded-theme border border-island_border bg-island_background p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Active Switches</p>
                        <p className="text-2xl font-bold text-primary">
                            {stats.by_status
                                ? (stats.by_status.find((s: any) => s[0] === 'ACTIVE')?.[1] ?? 0)
                                : '—'}
                        </p>
                    </div>
                </div>
            )}

            {/* Switch Table */}
            <div className="rounded-theme border border-island_border bg-island_background p-6">
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-muted-foreground">Loading switches...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-red-500">Error: {error}</div>
                    </div>
                ) : (
                    <DBTableSection
                        data={switches}
                        searchPlaceholder="Search switches..."
                        keyField="switch_id"
                        cellContentRenderer={SwitchCellContent}
                        totalItems={totalItems}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        onSearch={handleSearch}
                        activeCriteria={searchCriteria}
                        excludeColumns={[
                            'component_switch_id',
                            'serial_number',
                            'asset_tag',
                            'bootrom_version',
                            'mgmt_mac_address',
                            'mgmt_vlan_id',
                            'uptime_seconds',
                            'temperature_celsius',
                            'fan_status',
                            'power_consumption_watts',
                            'sub_cluster_id',
                            'rack_position_id',
                            'poll_interval_seconds',
                            'auth_method',
                            'auth_server_ip',
                            'auth_server_port',
                            'snmp_version',
                            'snmp_auth_protocol',
                            'snmp_priv_protocol',
                            'updated_at',
                        ]}
                    />
                )}
            </div>
        </div>
    );
}
