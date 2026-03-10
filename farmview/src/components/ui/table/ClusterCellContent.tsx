"use client";
import Link from "next/link";

interface ClusterCellContentProps {
  columnKey: string;
  value: any;
  item: any;
  entityName?: string;
}

const ClusterCellContent: React.FC<ClusterCellContentProps> = ({ columnKey, value, item, entityName }) => {
  
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
      case 'decommissioned':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getEnvironmentColor = (env: string): string => {
    switch (env?.toLowerCase()) {
      case 'production':
      case 'prod':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'staging':
      case 'stage':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'qa':
      case 'testing':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'development':
      case 'dev':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatCapacity = (current: any, max: any) => {
    if (!current && !max) return '-';
    if (!max) return String(current || '0');
    const currentNum = parseInt(current) || 0;
    const maxNum = parseInt(max) || 0;
    const percentage = maxNum > 0 ? Math.round((currentNum / maxNum) * 100) : 0;
    return `${currentNum}/${maxNum} (${percentage}%)`;
  };

  // Handle special cluster column rendering
  switch (columnKey.toLowerCase()) {
    case 'cluster_name':
    case 'name':
      return (
        <div className="flex items-center gap-3">
          <span className="text-lg">🗂️</span>
          <Link 
            href={`/clusters/${item.cluster_id || item.id}`}
            className="font-medium text-primary hover:text-primary/80 hover:underline"
          >
            {value || '-'}
          </Link>
        </div>
      );

    case 'cluster_code':
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
    case 'cluster_status':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${getStatusColor(value || 'unknown')}`}>
          {value?.replace('_', ' ') || 'Unknown'}
        </span>
      );

    case 'environment_type':
    case 'environment':
    case 'env':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${getEnvironmentColor(value || 'unknown')}`}>
          {value?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
        </span>
      );

    case 'data_center_id':
    case 'datacenter_id':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🏢</span>
          <Link 
            href={`/datacenters/${value}`}
            className="text-sm text-primary hover:underline"
          >
            DC-{value || '-'}
          </Link>
        </div>
      );

    case 'region':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🌍</span>
          <span className="text-sm">{value || '-'}</span>
        </div>
      );

    case 'availability_zone':
    case 'zone':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">📍</span>
          <span className="font-mono text-sm">{value || '-'}</span>
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

    case 'active_servers':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">✅</span>
          <span className="font-mono text-sm text-green-600 dark:text-green-400 font-medium">
            {value || '0'}
          </span>
        </div>
      );

    case 'max_capacity':
    case 'capacity':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">📊</span>
          <span className="font-mono text-sm">
            {value || '-'}
          </span>
        </div>
      );

    case 'owner':
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

    case 'description':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">📝</span>
          <span className="text-sm text-muted-foreground truncate max-w-xs" title={value}>
            {value || '-'}
          </span>
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

    // Sub-cluster specific fields
    case 'sub_cluster_name':
      return (
        <div className="flex items-center gap-3">
          <span className="text-lg">📁</span>
          <Link 
            href={`/clusters/sub-clusters/${item.sub_cluster_id || item.id}`}
            className="font-medium text-primary hover:text-primary/80 hover:underline"
          >
            {value || '-'}
          </Link>
        </div>
      );

    case 'sub_cluster_code':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🏷️</span>
          <span className="font-mono text-sm font-medium bg-accent/20 px-2 py-1 rounded">
            {value || '-'}
          </span>
        </div>
      );

    case 'sub_cluster_type':
    case 'type':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">⚙️</span>
          <span className="text-sm font-medium">
            {value?.replace('_', ' ').toUpperCase() || '-'}
          </span>
        </div>
      );

    case 'workload_type':
    case 'workload':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">💼</span>
          <span className="text-sm">{value || '-'}</span>
        </div>
      );

    case 'priority_level':
    case 'priority':
      const priorityColor = value?.toLowerCase() === 'high' ? 'text-red-500' : 
                           value?.toLowerCase() === 'medium' ? 'text-yellow-500' : 
                           'text-blue-500';
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">⚡</span>
          <span className={`text-sm font-medium ${priorityColor}`}>
            {value?.toUpperCase() || '-'}
          </span>
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

export default ClusterCellContent;
