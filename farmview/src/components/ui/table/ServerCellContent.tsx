"use client";
import Link from "next/link";
import { DefaultServerIcon, MonitorIcon, StorageIcon } from "@/assets/icons";

interface ServerCellContentProps {
  columnKey: string;
  value: any;
  item: any;
  entityName?: string;
}

const ServerCellContent: React.FC<ServerCellContentProps> = ({ columnKey, value, item, entityName }) => {
  const renderServerIcon = () => {
    const serverType = item.server_type || item.type || 'server';
    const iconClass = "w-5 h-5";
    
    switch (serverType.toLowerCase()) {
      case 'physical':
      case 'bare-metal':
        return <MonitorIcon className={iconClass} />;
      case 'virtual':
      case 'vm':
      case 'vps':
        return <DefaultServerIcon className={iconClass} />;
      case 'container':
      case 'docker':
        return <StorageIcon className={iconClass} />;
      default:
        return <DefaultServerIcon className={iconClass} />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'active':
      case 'running':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'offline':
      case 'inactive':
      case 'stopped':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'maintenance':
      case 'updating':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'new':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'rma':
        return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const renderMemoryValue = (memoryValue: any) => {
    if (!memoryValue) return '-';
    
    // Convert to GB if it's a number
    if (typeof memoryValue === 'number') {
      if (memoryValue > 1024) {
        return `${(memoryValue / 1024).toFixed(1)} GB`;
      }
      return `${memoryValue} MB`;
    }
    
    return memoryValue;
  };

  const renderCpuValue = (cpuValue: any) => {
    if (!cpuValue) return '-';
    
    // Format CPU cores/threads
    if (typeof cpuValue === 'number') {
      return `${cpuValue} cores`;
    }
    
    return cpuValue;
  };

  const renderStorageValue = (storageValue: any) => {
    if (!storageValue) return '-';
    
    // Convert storage values
    if (typeof storageValue === 'number') {
      if (storageValue > 1024) {
        return `${(storageValue / 1024).toFixed(1)} TB`;
      }
      return `${storageValue} GB`;
    }
    
    return storageValue;
  };

  // Handle special server column rendering
  switch (columnKey.toLowerCase()) {
    case 'server_name':
    case 'name':
    case 'hostname':
    case 'host_name':
      return (
        <div className="flex items-center gap-3">
          {renderServerIcon()}
          <Link 
            href={`/servers/${item.server_id}`}
            className="font-medium text-primary hover:text-primary/80 hover:underline"
          >
            {value || '-'}
          </Link>
        </div>
      );

    case 'status':
    case 'server_status':
    case 'state':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${getStatusColor(value || 'unknown')}`}>
          {value || 'Unknown'}
        </span>
      );

    case 'memory':
    case 'ram':
    case 'memory_gb':
    case 'ram_gb':
      return (
        <div className="font-mono text-sm">
          {renderMemoryValue(value)}
        </div>
      );

    case 'cpu':
    case 'cores':
    case 'cpu_cores':
    case 'processors':
      return (
        <div className="font-mono text-sm">
          {renderCpuValue(value)}
        </div>
      );

    case 'storage':
    case 'disk':
    case 'storage_gb':
    case 'disk_gb':
      return (
        <div className="font-mono text-sm">
          {renderStorageValue(value)}
        </div>
      );

    case 'ip_address':
    case 'ip':
    case 'bmc_ip_address':
    case 'bmc_mac_address':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🌐</span>
          <span className="font-mono text-sm text-foreground">{value || '-'}</span>
        </div>
      );

    case 'user_name':
    case 'username':
    case 'bmc_user_name':
    case 'bmc_username':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">👤</span>
          <span className="font-medium text-sm">{value || '-'}</span>
        </div>
      );

    case 'password':
    case 'bmc_password':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🔐</span>
          <span className="font-mono text-sm">
            {value ? '••••••••' : 'Not Set'}
          </span>
        </div>
      );

    case 'mac_address':
    case 'bmc_mac_address':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🔗</span>
          <span className="font-mono text-sm text-foreground">{value || '-'}</span>
        </div>
      );

    case 'serial_number':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">📋</span>
          <span className="font-mono text-sm text-foreground">{value || '-'}</span>
        </div>
      );

    case 'bios_version':
    case 'bmc_version':
    case 'firmware_version':
    case 'version':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">⚙️</span>
          <span className="font-mono text-xs bg-accent/20 px-2 py-1 rounded">
            {value || '-'}
          </span>
        </div>
      );

    case 'vendor':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">🏢</span>
          <span className="font-medium text-sm">{value || '-'}</span>
        </div>
      );

    case 'os':
    case 'operating_system':
    case 'platform':
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent/30 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">{value?.charAt(0)?.toUpperCase() || 'O'}</span>
          </div>
          <span>{value || '-'}</span>
        </div>
      );

    case 'uptime':
    case 'uptime_days':
      return (
        <div className="font-mono text-sm">
          {value ? `${value} days` : '-'}
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

export default ServerCellContent;