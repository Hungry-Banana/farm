"use client";
import Link from "next/link";

interface KubernetesCellContentProps {
  columnKey: string;
  value: any;
  item: any;
  entityName?: string;
}

const KubernetesCellContent: React.FC<KubernetesCellContentProps> = ({ columnKey, value, item, entityName }) => {
  
  const renderClusterIcon = () => {
    const distribution = item.distribution?.toLowerCase() || 'vanilla';
    const iconClass = "text-lg";
    
    // Map distributions to emojis
    const distributionIcons: Record<string, string> = {
      'k3s': '🐮',
      'k0s': '🔷',
      'rke': '🐮',
      'rke2': '🐮',
      'eks': '☁️',
      'aks': '☁️',
      'gke': '☁️',
      'openshift': '🔴',
      'rancher': '🐮',
      'microk8s': '🔶',
      'kubeadm': '☸️',
      'vanilla': '☸️',
    };
    
    return <span className={iconClass}>{distributionIcons[distribution] || '☸️'}</span>;
  };

  const getStateColor = (state: string): string => {
    switch (state?.toLowerCase()) {
      case 'ready':
      case 'active':
      case 'running':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'degraded':
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'initializing':
      case 'upgrading':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'offline':
      case 'error':
      case 'failed':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'maintenance':
      case 'inactive':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'inactive':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      case 'maintenance':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'archived':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const renderBooleanBadge = (value: boolean | null | undefined, trueLabel: string = 'Yes', falseLabel: string = 'No') => {
    if (value === null || value === undefined) return <span className="text-muted-foreground">-</span>;
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-theme text-xs font-medium ${
        value 
          ? 'text-green-600 bg-green-500/10 border border-green-500/20' 
          : 'text-gray-500 bg-gray-500/10 border border-gray-500/20'
      }`}>
        {value ? trueLabel : falseLabel}
      </span>
    );
  };

  // Handle special Kubernetes column rendering
  switch (columnKey.toLowerCase()) {
    case 'cluster_name':
    case 'name':
      return (
        <div className="flex items-center gap-3">
          {renderClusterIcon()}
          <Link 
            href={`/kubernetes/${item.cluster_id}`}
            className="font-medium text-primary hover:text-primary/80 hover:underline"
          >
            {value || '-'}
          </Link>
        </div>
      );

    case 'cluster_state':
    case 'state':
    case 'node_state':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${getStateColor(value || 'unknown')}`}>
          {value || 'Unknown'}
        </span>
      );

    case 'cluster_status':
    case 'status':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${getStatusColor(value || 'unknown')}`}>
          {value || 'Unknown'}
        </span>
      );

    case 'cluster_version':
    case 'version':
    case 'kubelet_version':
    case 'kube_proxy_version':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🏷️</span>
          <span className="font-mono text-xs bg-accent/20 px-2 py-1 rounded">
            {value || '-'}
          </span>
        </div>
      );

    case 'api_server_endpoint':
    case 'api_server':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🌐</span>
          <span className="font-mono text-xs text-foreground">{value || '-'}</span>
        </div>
      );

    case 'distribution':
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm capitalize">{value || 'Vanilla'}</span>
        </div>
      );

    case 'distribution_version':
      return (
        <div className="font-mono text-xs bg-accent/20 px-2 py-1 rounded inline-block">
          {value || '-'}
        </div>
      );

    case 'cni_plugin':
    case 'network_plugin':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🔗</span>
          <span className="font-medium text-sm capitalize">{value || '-'}</span>
        </div>
      );

    case 'container_runtime':
    case 'runtime':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">📦</span>
          <span className="font-medium text-sm">{value || '-'}</span>
        </div>
      );

    case 'control_plane_nodes':
    case 'control_plane_count':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🎛️</span>
          <span className="font-mono text-sm font-medium">{value || '0'}</span>
        </div>
      );

    case 'worker_node_count':
    case 'worker_nodes':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">⚙️</span>
          <span className="font-mono text-sm font-medium">{value || '0'}</span>
        </div>
      );

    case 'total_pods':
    case 'pod_count':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🐳</span>
          <span className="font-mono text-sm font-medium">{value || '0'}</span>
        </div>
      );

    case 'total_namespaces':
    case 'namespace_count':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">📁</span>
          <span className="font-mono text-sm font-medium">{value || '0'}</span>
        </div>
      );

    case 'is_ha_enabled':
    case 'ha_enabled':
      return renderBooleanBadge(value, 'HA', 'No HA');

    case 'rbac_enabled':
      return renderBooleanBadge(value, 'RBAC', 'No RBAC');

    case 'network_policy_enabled':
      return renderBooleanBadge(value, 'Enabled', 'Disabled');

    case 'monitoring_enabled':
      return renderBooleanBadge(value, '✓ Monitored', 'Not Monitored');

    case 'logging_enabled':
      return renderBooleanBadge(value, '✓ Logging', 'No Logging');

    case 'auto_scaling_enabled':
      return renderBooleanBadge(value, 'Auto-scale', 'Manual');

    case 'monitoring_stack':
    case 'logging_stack':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">📊</span>
          <span className="text-sm capitalize">{value || '-'}</span>
        </div>
      );

    case 'service_cidr':
    case 'pod_cidr':
      return (
        <div className="font-mono text-xs bg-accent/20 px-2 py-1 rounded inline-block">
          {value || '-'}
        </div>
      );

    case 'environment':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-theme text-xs font-medium ${
          value?.toLowerCase() === 'production' 
            ? 'text-red-600 bg-red-500/10 border border-red-500/20' 
            : value?.toLowerCase() === 'staging'
            ? 'text-yellow-600 bg-yellow-500/10 border border-yellow-500/20'
            : 'text-blue-600 bg-blue-500/10 border border-blue-500/20'
        }`}>
          {value || 'Unknown'}
        </span>
      );

    case 'organization':
    case 'managed_by':
    case 'created_by':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">👤</span>
          <span className="text-sm">{value || '-'}</span>
        </div>
      );

    case 'node_type':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-theme text-xs font-medium ${
          value?.toLowerCase().includes('control') || value?.toLowerCase().includes('master')
            ? 'text-purple-600 bg-purple-500/10 border border-purple-500/20' 
            : 'text-blue-600 bg-blue-500/10 border border-blue-500/20'
        }`}>
          {value || 'Worker'}
        </span>
      );

    case 'internal_ip':
    case 'external_ip':
    case 'host_ip':
    case 'pod_ip':
    case 'cluster_ip':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🌐</span>
          <span className="font-mono text-xs text-foreground">{value || '-'}</span>
        </div>
      );

    case 'cpu_capacity':
    case 'cpu_allocatable':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">⚡</span>
          <span className="font-mono text-sm">{value ? `${value} cores` : '-'}</span>
        </div>
      );

    case 'memory_capacity_mb':
    case 'memory_allocatable_mb':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">💾</span>
          <span className="font-mono text-sm">
            {value ? `${(value / 1024).toFixed(1)} GB` : '-'}
          </span>
        </div>
      );

    case 'pod_capacity':
    case 'pod_allocatable':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🐳</span>
          <span className="font-mono text-sm">{value || '-'}</span>
        </div>
      );

    case 'os_image':
    case 'operating_system':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">💿</span>
          <span className="text-sm">{value || '-'}</span>
        </div>
      );

    case 'kernel_version':
      return (
        <div className="font-mono text-xs bg-accent/20 px-2 py-1 rounded inline-block">
          {value || '-'}
        </div>
      );

    case 'created_at':
    case 'updated_at':
    case 'provisioned_at':
    case 'last_health_check':
    case 'registered_at':
    case 'last_heartbeat':
      return (
        <div className="text-sm text-muted-foreground">
          {value ? new Date(value).toLocaleDateString() : '-'}
        </div>
      );

    case 'description':
      return (
        <div className="text-sm text-muted-foreground max-w-md truncate" title={value || ''}>
          {value || '-'}
        </div>
      );

    case 'tags':
      return (
        <div className="flex flex-wrap gap-1">
          {value ? (
            value.split(',').map((tag: string, idx: number) => (
              <span key={idx} className="px-2 py-0.5 bg-accent/20 rounded text-xs">
                {tag.trim()}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
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

export default KubernetesCellContent;
