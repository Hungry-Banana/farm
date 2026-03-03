import ActionsButton, { ActionItem } from "@/components/ui/Buttons/ActionsButton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNotification } from "@/contexts/NotificationContext";

interface KubernetesActionsDropdownProps {
  clusterId?: number;
}

export default function KubernetesActionsDropdown({ clusterId }: KubernetesActionsDropdownProps) {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleScaleCluster = async () => {
    if (!clusterId) return;
    addNotification({
      type: 'info',
      title: 'Scale Cluster',
      message: 'Cluster scaling functionality coming soon',
    });
  };

  const handleUpgradeCluster = async () => {
    if (!clusterId) return;
    addNotification({
      type: 'info',
      title: 'Upgrade Cluster',
      message: 'Cluster upgrade functionality coming soon',
    });
  };

  const handleDrainNode = async () => {
    if (!clusterId) return;
    addNotification({
      type: 'info',
      title: 'Drain Node',
      message: 'Node drain functionality coming soon',
    });
  };

  const handleBackupCluster = async () => {
    if (!clusterId) return;
    addNotification({
      type: 'info',
      title: 'Backup Cluster',
      message: 'Cluster backup functionality coming soon',
    });
  };

  const handleRestoreCluster = async () => {
    if (!clusterId) return;
    addNotification({
      type: 'info',
      title: 'Restore Cluster',
      message: 'Cluster restore functionality coming soon',
    });
  };

  const handleDeleteCluster = async () => {
    if (!clusterId) return;
    const confirmed = window.confirm('Are you sure you want to delete this cluster? This action cannot be undone.');
    if (confirmed) {
      addNotification({
        type: 'warning',
        title: 'Delete Cluster',
        message: 'Cluster deletion functionality coming soon',
      });
    }
  };

  const clusterActions: ActionItem[] = [
    { label: "Kubectl Dashboard", action: () => { if (clusterId) window.open(`/kubernetes/${clusterId}/dashboard`, '_blank'); }, icon: "🖥️" },
    { label: "Edit Cluster", action: () => { if (clusterId) router.push(`/kubernetes/${clusterId}/edit`); }, icon: "✏️" },
    { label: "Scale Cluster", action: handleScaleCluster, icon: "📊" },
    { label: "Upgrade Cluster", action: handleUpgradeCluster, icon: "⬆️" },
    { label: "Drain Node", action: handleDrainNode, icon: "💧" },
    { label: "Backup Cluster", action: handleBackupCluster, icon: "💾" },
    { label: "Restore Cluster", action: handleRestoreCluster, icon: "♻️" },
    { label: "Delete Cluster", action: handleDeleteCluster, icon: "🗑️", danger: true },
  ];

  return <ActionsButton items={clusterActions} buttonLabel="Actions" />;
}
