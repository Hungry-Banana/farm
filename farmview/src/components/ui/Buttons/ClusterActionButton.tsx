import ActionsButton, { ActionItem } from "@/components/ui/Buttons/ActionsButton";
import { useRouter } from "next/navigation";
import { deleteCluster } from "@/lib/clusters";
import { useState } from "react";
import { useNotification } from "@/contexts/NotificationContext";

interface ClusterActionsDropdownProps {
  clusterId?: number;
}

export default function ClusterActionsDropdown({ clusterId }: ClusterActionsDropdownProps) {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!clusterId) return;
    
    // Confirm before deleting
    if (!confirm(`Are you sure you want to delete cluster ${clusterId}? This action cannot be undone.`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await deleteCluster(clusterId);
      if (result?.success) {
        addNotification({
          type: 'success',
          title: 'Cluster Deleted',
          message: `Cluster ${clusterId} deleted successfully`,
        });
        router.push('/clusters');
      } else {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: result?.error || 'Failed to delete cluster',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete Error',
        message: error instanceof Error ? error.message : 'An error occurred while deleting the cluster',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clusterActions: ActionItem[] = [
    { label: "Edit Cluster", action: () => { if (clusterId) router.push(`/clusters/${clusterId}/edit`); }, icon: "✏️" },
    { label: "View Servers", action: () => { if (clusterId) router.push(`/servers?cluster_id=${clusterId}`); }, icon: "🖥️" },
    { label: "Delete Cluster", action: handleDelete, icon: "🗑️", danger: true },
  ];

  return <ActionsButton items={clusterActions} buttonLabel="Actions" />;
}
