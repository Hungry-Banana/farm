"use client";
import Link from "next/link";
import { DefaultServerIcon } from "@/assets/icons";

interface VMCellContentProps {
  columnKey: string;
  value: any;
  item: any;
  entityName?: string;
}

const VMCellContent: React.FC<VMCellContentProps> = ({ columnKey, value, item, entityName }) => {
  const renderVMIcon = () => {
    const iconClass = "w-5 h-5";
    return <DefaultServerIcon className={iconClass} />;
  };

  const getStateColor = (state: string): string => {
    switch (state?.toLowerCase()) {
      case 'running':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'stopped':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'paused':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'suspended':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const renderMemoryValue = (memoryValue: any) => {
    if (!memoryValue) return '-';
    
    // Convert MB to GB
    if (typeof memoryValue === 'number') {
      return `${Math.round(memoryValue / 1024)} GB`;
    }
    
    return memoryValue;
  };

  const renderStorageValue = (storageValue: any) => {
    if (!storageValue) return '-';
    
    if (typeof storageValue === 'number') {
      return `${Math.round(storageValue)} GB`;
    }
    
    return storageValue;
  };

  // Handle special VM column rendering
  switch (columnKey.toLowerCase()) {
    case 'vm_name':
    case 'name':
      return (
        <div className="flex items-center gap-3">
          {renderVMIcon()}
          <Link 
            href={`/servers/vms/${item.vm_id}`}
            className="font-medium text-primary hover:text-primary/80 hover:underline"
          >
            {value || `VM ${item.vm_id}`}
          </Link>
        </div>
      );

    case 'vm_state':
    case 'state':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${getStateColor(value || 'unknown')}`}>
          {value || 'unknown'}
        </span>
      );

    case 'vm_status':
    case 'status':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${getStateColor(value || 'unknown')}`}>
          {value || 'unknown'}
        </span>
      );

    case 'memory_mb':
    case 'memory':
      return (
        <div className="font-mono text-sm">
          {renderMemoryValue(value)}
        </div>
      );

    case 'storage_gb':
    case 'storage':
    case 'disk':
      return (
        <div className="font-mono text-sm">
          {renderStorageValue(value)}
        </div>
      );

    case 'vcpu_count':
    case 'vcpus':
    case 'cpus':
      return (
        <div className="font-mono text-sm">
          {value ? `${value} vCPUs` : '-'}
        </div>
      );

    case 'server_id':
      return (
        <Link 
          href={`/servers/${value}`}
          className="text-primary hover:text-primary/80 hover:underline font-medium"
        >
          Server {value}
        </Link>
      );

    case 'hypervisor_type':
    case 'hypervisor':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🖥️</span>
          <span className="font-medium text-sm">{value || '-'}</span>
        </div>
      );

    case 'guest_os_family':
    case 'os_family':
    case 'os':
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent/30 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">{value?.charAt(0)?.toUpperCase() || 'O'}</span>
          </div>
          <span>{value || '-'}</span>
        </div>
      );

    case 'guest_os_version':
    case 'os_version':
      return (
        <div className="font-mono text-xs bg-accent/20 px-2 py-1 rounded inline-block">
          {value || '-'}
        </div>
      );

    case 'guest_os_distribution':
    case 'os_distribution':
      return (
        <div className="font-medium text-sm">
          {value || '-'}
        </div>
      );

    case 'vm_uuid':
    case 'uuid':
    case 'instance_uuid':
      return (
        <div className="font-mono text-xs text-muted-foreground truncate max-w-xs" title={value}>
          {value || '-'}
        </div>
      );

    case 'enable_vnc':
    case 'vnc_enabled':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">{value ? '✅' : '❌'}</span>
          <span className="text-sm">{value ? 'Enabled' : 'Disabled'}</span>
        </div>
      );

    case 'vnc_port':
      return (
        <div className="font-mono text-sm">
          {value || '-'}
        </div>
      );

    case 'created_at':
    case 'updated_at':
    case 'started_at':
    case 'stopped_at':
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

export default VMCellContent;
