import ActionsButton, { ActionItem } from "@/components/ui/Buttons/ActionsButton";
import { useRouter } from "next/navigation";
import { deleteSubCluster } from "@/lib/clusters";
import { useState } from "react";
import { useNotification } from "@/contexts/NotificationContext";

interface SubClusterActionsDropdownProps {
  subClusterId?: number;
  clusterId?: number;
}

export default function SubClusterActionsDropdown({ subClusterId, clusterId }: SubClusterActionsDropdownProps) {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!subClusterId) return;
    
    // Confirm before deleting
    if (!confirm(`Are you sure you want to delete sub-cluster ${subClusterId}? This action cannot be undone.`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await deleteSubCluster(subClusterId);
      if (result?.success) {
        addNotification({
          type: 'success',
          title: 'Sub-Cluster Deleted',
          message: `Sub-Cluster ${subClusterId} deleted successfully`,
        });
        if (clusterId) {
          router.push(`/clusters/${clusterId}`);
        } else {
          router.push('/clusters');
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: result?.error || 'Failed to delete sub-cluster',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete Error',
        message: error instanceof Error ? error.message : 'An error occurred while deleting the sub-cluster',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subClusterActions: ActionItem[] = [
    { label: "Edit Sub-Cluster", action: () => { if (subClusterId && clusterId) router.push(`/clusters/${clusterId}/subclusters/${subClusterId}/edit`); }, icon: "✏️" },
    { label: "View Servers", action: () => { if (subClusterId) router.push(`/servers?sub_cluster_id=${subClusterId}`); }, icon: "🖥️" },
    { label: "View Parent Cluster", action: () => { if (clusterId) router.push(`/clusters/${clusterId}`); }, icon: "🗂️" },
    { label: "Delete Sub-Cluster", action: handleDelete, icon: "🗑️", danger: true },
  ];

  return <ActionsButton items={subClusterActions} buttonLabel="Actions" />;
}
