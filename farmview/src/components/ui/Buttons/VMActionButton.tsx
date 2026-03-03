import ActionsButton, { ActionItem } from "@/components/ui/Buttons/ActionsButton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNotification } from "@/contexts/NotificationContext";

interface VMActionsDropdownProps {
  vmId?: number;
}

export default function VMActionsDropdown({ vmId }: VMActionsDropdownProps) {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartVM = async () => {
    if (!vmId) return;
    setIsLoading(true);
    try {
      addNotification({
        type: 'success',
        title: 'VM Start',
        message: `VM ${vmId} start command sent successfully`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Start Failed',
        message: error instanceof Error ? error.message : 'Failed to start VM',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopVM = async () => {
    if (!vmId) return;
    setIsLoading(true);
    try {
      addNotification({
        type: 'success',
        title: 'VM Shutdown',
        message: `VM ${vmId} graceful shutdown command sent successfully`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Shutdown Failed',
        message: error instanceof Error ? error.message : 'Failed to shutdown VM',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartVM = async () => {
    if (!vmId) return;
    setIsLoading(true);
    try {
      addNotification({
        type: 'success',
        title: 'VM Restart',
        message: `VM ${vmId} restart command sent successfully`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Restart Failed',
        message: error instanceof Error ? error.message : 'Failed to restart VM',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseVM = async () => {
    if (!vmId) return;
    setIsLoading(true);
    try {
      addNotification({
        type: 'success',
        title: 'VM Paused',
        message: `VM ${vmId} has been paused`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Pause Failed',
        message: error instanceof Error ? error.message : 'Failed to pause VM',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeVM = async () => {
    if (!vmId) return;
    setIsLoading(true);
    try {
      addNotification({
        type: 'success',
        title: 'VM Resumed',
        message: `VM ${vmId} has been resumed`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Resume Failed',
        message: error instanceof Error ? error.message : 'Failed to resume VM',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    if (!vmId) return;
    addNotification({
      type: 'info',
      title: 'Create Snapshot',
      message: 'Snapshot creation functionality coming soon',
    });
  };

  const handleCloneVM = async () => {
    if (!vmId) return;
    addNotification({
      type: 'info',
      title: 'Clone VM',
      message: 'VM cloning functionality coming soon',
    });
  };

  const handleMigrateVM = async () => {
    if (!vmId) return;
    addNotification({
      type: 'info',
      title: 'Migrate VM',
      message: 'VM migration functionality coming soon',
    });
  };

  const handleDeleteVM = async () => {
    if (!vmId) return;
    const confirmed = window.confirm('Are you sure you want to delete this VM? This action cannot be undone.');
    if (confirmed) {
      addNotification({
        type: 'warning',
        title: 'Delete VM',
        message: 'VM deletion functionality coming soon',
      });
    }
  };

  const vmActions: ActionItem[] = [
    { label: "VNC Console", action: () => console.log("Opening VNC console..."), icon: "🖥️" },
    { label: "Edit VM", action: () => { if (vmId) router.push(`/servers/vms/${vmId}/edit`); }, icon: "✏️" },
    { label: "Start VM", action: handleStartVM, icon: "▶️" },
    { label: "Restart VM", action: handleRestartVM, icon: "🔄" },
    { label: "Pause VM", action: handlePauseVM, icon: "⏸️" },
    { label: "Resume VM", action: handleResumeVM, icon: "▶️" },
    { label: "Stop VM", action: handleStopVM, icon: "⏹️" },
    { label: "Create Snapshot", action: handleCreateSnapshot, icon: "📸" },
    { label: "Clone VM", action: handleCloneVM, icon: "📋" },
    { label: "Migrate VM", action: handleMigrateVM, icon: "🚀" },
    { label: "Delete VM", action: handleDeleteVM, icon: "🗑️", danger: true },
  ];

  return <ActionsButton items={vmActions} buttonLabel="Actions" />;
}
