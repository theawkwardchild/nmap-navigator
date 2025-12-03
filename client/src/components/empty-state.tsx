import { FileSearch, Upload, Server, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "no-hosts" | "no-services" | "no-selection";
  onAction?: () => void;
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  const content = {
    "no-hosts": {
      icon: FileSearch,
      title: "No hosts discovered",
      description: "Import an nmap scan to begin your penetration testing workflow.",
      action: "Import Nmap Scan",
      showAction: true,
    },
    "no-services": {
      icon: Server,
      title: "No services found",
      description: "This host has no open services detected in the scan.",
      action: null,
      showAction: false,
    },
    "no-selection": {
      icon: Target,
      title: "Select a host",
      description: "Choose a host from the sidebar to view its services and checklists.",
      action: null,
      showAction: false,
    },
  };

  const { icon: Icon, title, description, action, showAction } = content[type];

  return (
    <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
      <div className="p-4 rounded-full bg-muted mb-6">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {showAction && onAction && (
        <Button onClick={onAction} className="gap-2" data-testid="button-empty-state-action">
          <Upload className="h-4 w-4" />
          {action}
        </Button>
      )}
    </div>
  );
}
