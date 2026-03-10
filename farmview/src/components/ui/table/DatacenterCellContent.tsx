"use client";
import Link from "next/link";

interface DatacenterCellContentProps {
  columnKey: string;
  value: any;
  item: any;
  entityName?: string;
}

const DatacenterCellContent: React.FC<DatacenterCellContentProps> = ({ columnKey, value, item, entityName }) => {
  
  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'operational':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'inactive':
      case 'offline':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'maintenance':
      case 'under_maintenance':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'construction':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'decommissioned':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTierColor = (tier: string): string => {
    switch (tier?.toLowerCase()) {
      case 'tier_iv':
      case 'tier_4':
        return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'tier_iii':
      case 'tier_3':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'tier_ii':
      case 'tier_2':
        return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
      case 'tier_i':
      case 'tier_1':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatArea = (area: any) => {
    if (!area) return '-';
    const num = parseFloat(area);
    if (isNaN(num)) return area;
    return `${num.toLocaleString()} m²`;
  };

  const formatPower = (power: any) => {
    if (!power) return '-';
    const num = parseFloat(power);
    if (isNaN(num)) return power;
    return `${num.toLocaleString()} kW`;
  };

  const formatCoordinates = (coord: any) => {
    if (!coord) return '-';
    const num = parseFloat(coord);
    if (isNaN(num)) return coord;
    return num.toFixed(6);
  };

  // Handle special datacenter column rendering
  switch (columnKey.toLowerCase()) {
    case 'data_center_name':
    case 'datacenter_name':
    case 'name':
      return (
        <div className="flex items-center gap-3">
          <span className="text-lg">🏢</span>
          <Link 
            href={`/datacenters/${item.data_center_id || item.datacenter_id || item.id}`}
            className="font-medium text-primary hover:text-primary/80 hover:underline"
          >
            {value || '-'}
          </Link>
        </div>
      );

    case 'data_center_code':
    case 'datacenter_code':
    case 'code':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🔖</span>
          <span className="font-mono text-sm font-medium bg-accent/20 px-2 py-1 rounded">
            {value || '-'}
          </span>
        </div>
      );

    case 'status':
    case 'datacenter_status':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${getStatusColor(value || 'unknown')}`}>
          {value?.replace('_', ' ') || 'Unknown'}
        </span>
      );

    case 'tier_level':
    case 'tier':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${getTierColor(value || 'unknown')}`}>
          {value?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
        </span>
      );

    case 'country':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🌍</span>
          <span className="font-medium text-sm">{value || '-'}</span>
        </div>
      );

    case 'region':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">📍</span>
          <span className="text-sm">{value || '-'}</span>
        </div>
      );

    case 'city':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🏙️</span>
          <span className="text-sm">{value || '-'}</span>
        </div>
      );

    case 'state_province':
    case 'state':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🗺️</span>
          <span className="text-sm">{value || '-'}</span>
        </div>
      );

    case 'address':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">📮</span>
          <span className="text-sm text-muted-foreground truncate max-w-xs" title={value}>
            {value || '-'}
          </span>
        </div>
      );

    case 'postal_code':
    case 'zip_code':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">✉️</span>
          <span className="font-mono text-sm">{value || '-'}</span>
        </div>
      );

    case 'latitude':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🧭</span>
          <span className="font-mono text-xs text-muted-foreground">
            {formatCoordinates(value)}
          </span>
        </div>
      );

    case 'longitude':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🧭</span>
          <span className="font-mono text-xs text-muted-foreground">
            {formatCoordinates(value)}
          </span>
        </div>
      );

    case 'provider':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🏢</span>
          <span className="font-medium text-sm">{value || '-'}</span>
        </div>
      );

    case 'provider_facility_id':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🔢</span>
          <span className="font-mono text-xs bg-accent/20 px-2 py-1 rounded">
            {value || '-'}
          </span>
        </div>
      );

    case 'total_floor_space_sqm':
    case 'floor_space':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">📐</span>
          <span className="font-mono text-sm">
            {formatArea(value)}
          </span>
        </div>
      );

    case 'power_capacity_kw':
    case 'power_capacity':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">⚡</span>
          <span className="font-mono text-sm text-yellow-600 dark:text-yellow-400">
            {formatPower(value)}
          </span>
        </div>
      );

    case 'cooling_capacity_kw':
    case 'cooling_capacity':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">❄️</span>
          <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
            {formatPower(value)}
          </span>
        </div>
      );

    case 'total_racks':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🗄️</span>
          <span className="font-mono text-sm font-medium">
            {value || '0'}
          </span>
        </div>
      );

    case 'occupied_racks':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">📦</span>
          <span className="font-mono text-sm">
            {value || '0'}
          </span>
        </div>
      );

    case 'total_servers':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🖥️</span>
          <span className="font-mono text-sm font-medium">
            {value || '0'}
          </span>
        </div>
      );

    case 'facility_manager':
    case 'manager':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">👤</span>
          <span className="font-medium text-sm">{value || '-'}</span>
        </div>
      );

    case 'contact_email':
    case 'email':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">📧</span>
          <a 
            href={`mailto:${value}`} 
            className="text-sm text-primary hover:underline"
          >
            {value || '-'}
          </a>
        </div>
      );

    case 'contact_phone':
    case 'phone':
    case 'emergency_phone':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">📞</span>
          <span className="font-mono text-sm">{value || '-'}</span>
        </div>
      );

    case 'emergency_contact':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🚨</span>
          <span className="font-medium text-sm">{value || '-'}</span>
        </div>
      );

    case 'timezone':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🕐</span>
          <span className="font-mono text-sm">{value || '-'}</span>
        </div>
      );

    case 'operating_hours':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">⏰</span>
          <span className="text-sm">{value || '-'}</span>
        </div>
      );

    case 'created_at':
    case 'updated_at':
    case 'last_seen':
      return (
        <div className="text-sm text-muted-foreground">
          {value ? new Date(value).toLocaleDateString() : '-'}
        </div>
      );

    default:
      // Default rendering for other columns
      return (
        <div className="text-left">
          {value !== null && value !== undefined ? String(value) : '-'}
        </div>
      );
  }
};

export default DatacenterCellContent;
