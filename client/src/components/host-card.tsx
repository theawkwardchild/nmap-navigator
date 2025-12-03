import { Badge } from "@/components/ui/badge";
import { Server, Monitor, HardDrive } from "lucide-react";
import type { Host, Service } from "@shared/schema";

interface HostCardProps {
  host: Host;
  services: Service[];
  isSelected: boolean;
  onClick: () => void;
}

export function HostCard({ host, services, isSelected, onClick }: HostCardProps) {
  const openServices = services.filter((s) => s.state === "open");

  const getOsIcon = () => {
    const os = host.os?.toLowerCase() || "";
    if (os.includes("windows")) return Monitor;
    if (os.includes("linux")) return Server;
    return HardDrive;
  };

  const OsIcon = getOsIcon();

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-md transition-colors ${
        isSelected
          ? "bg-sidebar-accent border border-sidebar-accent-border"
          : "hover-elevate border border-transparent"
      }`}
      data-testid={`host-card-${host.id}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-md ${
            host.status === "up" ? "bg-chart-3/10" : "bg-muted"
          }`}
        >
          <OsIcon
            className={`h-4 w-4 ${
              host.status === "up" ? "text-chart-3" : "text-muted-foreground"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium truncate">
              {host.ip}
            </span>
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                host.status === "up" ? "bg-chart-3" : "bg-muted-foreground"
              }`}
            />
          </div>
          {host.hostname && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {host.hostname}
            </p>
          )}
          {host.os && (
            <p className="text-xs text-muted-foreground truncate">{host.os}</p>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {openServices.slice(0, 4).map((service) => (
              <Badge
                key={service.id}
                variant="outline"
                className="text-xs font-mono px-1.5 py-0"
              >
                {service.port}
              </Badge>
            ))}
            {openServices.length > 4 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                +{openServices.length - 4}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
