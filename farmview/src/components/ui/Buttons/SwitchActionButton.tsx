import ActionsButton, { ActionItem } from "@/components/ui/Buttons/ActionsButton";
import { useRouter } from "next/navigation";
import { deleteSwitch } from "@/lib/switches";
import { useState } from "react";
import { useNotification } from "@/contexts/NotificationContext";

interface SwitchActionsDropdownProps {
  switchId?: number;
}

export default function SwitchActionsDropdown({ switchId }: SwitchActionsDropdownProps) {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!switchId) return;

    if (!confirm(`Are you sure you want to delete switch ${switchId}? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteSwitch(switchId);
      if (result?.success) {
        addNotification({
          type: 'success',
          title: 'Switch Deleted',
          message: `Switch ${switchId} deleted successfully`,
        });
        router.push('/networking/switches');
      } else {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: result?.error || 'Failed to delete switch',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete Error',
        message: error instanceof Error ? error.message : 'An error occurred while deleting the switch',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchActions: ActionItem[] = [
    { label: "Edit Switch", action: () => { if (switchId) router.push(`/networking/switches/${switchId}/edit`); }, icon: "✏️" },
    { label: "Delete Switch", action: handleDelete, icon: "🗑️", danger: true },
  ];

  return <ActionsButton items={switchActions} buttonLabel="Actions" />;
}
