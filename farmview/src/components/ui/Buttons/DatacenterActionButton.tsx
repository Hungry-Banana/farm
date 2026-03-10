import ActionsButton, { ActionItem } from "@/components/ui/Buttons/ActionsButton";
import { useRouter } from "next/navigation";
import { deleteDatacenter } from "@/lib/datacenters";
import { useState } from "react";
import { useNotification } from "@/contexts/NotificationContext";

interface DatacenterActionsDropdownProps {
  datacenterId?: number;
}

export default function DatacenterActionsDropdown({ datacenterId }: DatacenterActionsDropdownProps) {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!datacenterId) return;
    
    // Confirm before deleting
    if (!confirm(`Are you sure you want to delete datacenter ${datacenterId}? This action cannot be undone.`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await deleteDatacenter(datacenterId);
      if (result?.success) {
        addNotification({
          type: 'success',
          title: 'Datacenter Deleted',
          message: `Datacenter ${datacenterId} deleted successfully`,
        });
        router.push('/datacenters');
      } else {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: result?.error || 'Failed to delete datacenter',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete Error',
        message: error instanceof Error ? error.message : 'An error occurred while deleting the datacenter',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const datacenterActions: ActionItem[] = [
    { label: "Edit Datacenter", action: () => { if (datacenterId) router.push(`/datacenters/${datacenterId}/edit`); }, icon: "✏️" },
    { label: "Delete Datacenter", action: handleDelete, icon: "🗑️", danger: true },
  ];

  return <ActionsButton items={datacenterActions} buttonLabel="Actions" />;
}
