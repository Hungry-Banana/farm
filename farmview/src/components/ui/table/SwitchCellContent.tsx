"use client";
import Link from "next/link";
import { SwitchIcon } from "@/assets/icons";

interface SwitchCellContentProps {
  columnKey: string;
  value: any;
  item: any;
}

const getStatusColor = (status: string): string => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return 'text-green-500 bg-green-500/10 border-green-500/20';
    case 'INACTIVE':
      return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'MAINTENANCE':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'NEW':
      return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    case 'RMA':
      return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
    case 'DECOMMISSIONED':
      return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  }
};

const getRoleColor = (role: string): string => {
  switch (role?.toUpperCase()) {
    case 'CORE':
      return 'text-violet-500 bg-violet-500/10 border-violet-500/20';
    case 'DISTRIBUTION':
      return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    case 'ACCESS':
      return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
    case 'EDGE':
      return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    case 'MANAGEMENT':
      return 'text-green-500 bg-green-500/10 border-green-500/20';
    case 'OOB':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  }
};

const SwitchCellContent: React.FC<SwitchCellContentProps> = ({ columnKey, value, item }) => {
  switch (columnKey.toLowerCase()) {
    case 'switch_name':
    case 'name':
      return (
        <div className="flex items-center gap-3">
          <SwitchIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Link
            href={`/networking/switches/${item.switch_id}`}
            className="font-medium text-primary hover:text-primary/80 hover:underline"
          >
            {value || '-'}
          </Link>
        </div>
      );

    case 'status':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${getStatusColor(value)}`}>
          {value || 'Unknown'}
        </span>
      );

    case 'switch_role':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-theme text-xs font-medium border ${getRoleColor(value)}`}>
          {value || '—'}
        </span>
      );

    case 'environment_type':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-theme text-xs bg-accent/50 text-muted-foreground border border-island_border">
          {value || '—'}
        </span>
      );

    case 'mgmt_ip_address':
      if (!value) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="font-mono text-sm">{value}</span>
      );

    case 'last_poll_at':
    case 'created_at':
      if (!value) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString()}
        </span>
      );

    default:
      return <>{value ?? '—'}</>;
  }
};

export default SwitchCellContent;
