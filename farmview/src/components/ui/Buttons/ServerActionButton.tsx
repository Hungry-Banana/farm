import ActionsButton, { ActionItem } from "@/components/ui/Buttons/ActionsButton";
import { useRouter } from "next/navigation";
import { powerOnServer, powerOffServer, restartServer } from "@/lib/servers";
import { useState } from "react";
import { useNotification } from "@/contexts/NotificationContext";

interface ServerActionsDropdownProps {
  serverId?: number;
}

export default function ServerActionsDropdown({ serverId }: ServerActionsDropdownProps) {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handlePowerOn = async () => {
    if (!serverId) return;
    setIsLoading(true);
    try {
      const result = await powerOnServer(serverId);
      if (result?.success) {
        addNotification({
          type: 'success',
          title: 'Server Power On',
          message: `Server ${serverId} power on command sent successfully`,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Power On Failed',
          message: result?.error || 'Failed to power on server',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Power On Error',
        message: error instanceof Error ? error.message : 'An error occurred while powering on the server',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePowerOff = async () => {
    if (!serverId) return;
    setIsLoading(true);
    try {
      const result = await powerOffServer(serverId);
      if (result?.success) {
        addNotification({
          type: 'success',
          title: 'Server Shutdown',
          message: `Server ${serverId} graceful shutdown command sent successfully`,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Shutdown Failed',
          message: result?.error || 'Failed to power off server',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Shutdown Error',
        message: error instanceof Error ? error.message : 'An error occurred while shutting down the server',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = async () => {
    if (!serverId) return;
    setIsLoading(true);
    try {
      const result = await restartServer(serverId);
      if (result?.success) {
        addNotification({
          type: 'success',
          title: 'Server Restart',
          message: `Server ${serverId} graceful restart command sent successfully`,
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Restart Failed',
          message: result?.error || 'Failed to restart server',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Restart Error',
        message: error instanceof Error ? error.message : 'An error occurred while restarting the server',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const serverActions: ActionItem[] = [
    { label: "Console Access", action: () => console.log("Opening console..."), icon: "🖥️" },
    { label: "Edit Server", action: () => { if (serverId) router.push(`/servers/${serverId}/edit`); }, icon: "✏️" },
    { label: "Start Server", action: handlePowerOn, icon: "▶️" },
    { label: "Restart Server", action: handleRestart, icon: "🔄" },
    { label: "Stop Server", action: handlePowerOff, icon: "⏹️" },
    { label: "Delete Server", action: () => console.log("Deleting server..."), icon: "🗑️", danger: true },
  ];

  return <ActionsButton items={serverActions} buttonLabel="Actions" />;
}
