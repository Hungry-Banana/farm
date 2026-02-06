import ActionsButton, { ActionItem } from "@/components/ui/Buttons/ActionsButton";
import { useRouter } from "next/navigation";

interface ServerActionsDropdownProps {
  serverId?: number;
}

export default function ServerActionsDropdown({ serverId }: ServerActionsDropdownProps) {
  const router = useRouter();

  const serverActions: ActionItem[] = [
    { label: "Console Access", action: () => console.log("Opening console..."), icon: "🖥️" },
    { label: "Edit Server", action: () => { if (serverId) router.push(`/servers/${serverId}/edit`); }, icon: "✏️" },
    { label: "Start Server", action: () => console.log("Starting server..."), icon: "▶️" },
    { label: "Restart Server", action: () => console.log("Restarting server..."), icon: "🔄" },
    { label: "Stop Server", action: () => console.log("Stopping server..."), icon: "⏹️" },
    { label: "Delete Server", action: () => console.log("Deleting server..."), icon: "🗑️", danger: true },
  ];

  return <ActionsButton items={serverActions} buttonLabel="Actions" />;
}
