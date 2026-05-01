import ActionsButton, { ActionItem } from "@/components/ui/Buttons/ActionsButton";
import { useRouter } from "next/navigation";
import { deleteRack } from "@/lib/datacenters";
import { useState } from "react";
import { useNotification } from "@/contexts/NotificationContext";

interface RackActionsDropdownProps {
  rackId?: number;
  datacenterId?: number;
}

export default function RackActionsDropdown({ rackId, datacenterId }: RackActionsDropdownProps) {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!rackId) return;

    if (!confirm(`Are you sure you want to delete rack ${rackId}? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteRack(rackId);
      if (result?.success) {
        addNotification({
          type: "success",
          title: "Rack Deleted",
          message: `Rack ${rackId} deleted successfully`,
        });
        if (datacenterId) {
          router.push(`/datacenters/${datacenterId}`);
        } else {
          router.push("/datacenters");
        }
      } else {
        addNotification({
          type: "error",
          title: "Delete Failed",
          message: result?.error || "Failed to delete rack",
        });
      }
    } catch (error) {
      addNotification({
        type: "error",
        title: "Delete Error",
        message: error instanceof Error ? error.message : "An error occurred while deleting the rack",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rackActions: ActionItem[] = [
    { label: "Edit Rack", action: () => { if (rackId && datacenterId) router.push(`/datacenters/${datacenterId}/racks/${rackId}/edit`); }, icon: "✏️" },
    { label: "View Parent Datacenter", action: () => { if (datacenterId) router.push(`/datacenters/${datacenterId}`); }, icon: "🏢" },
    { label: "Delete Rack", action: handleDelete, icon: "🗑️", danger: true },
  ];

  return <ActionsButton items={rackActions} buttonLabel="Actions" />;
}
