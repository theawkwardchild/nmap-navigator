import { useState } from "react";
import { Search, Server, RefreshCw } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NmapUploadDialog } from "@/components/nmap-upload-dialog";
import { HostCard } from "@/components/host-card";
import type { Host, Service } from "@shared/schema";

interface AppSidebarProps {
  hosts: Host[];
  services: Service[];
  selectedHostId: string | null;
  onSelectHost: (hostId: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function AppSidebar({
  hosts,
  services,
  selectedHostId,
  onSelectHost,
  onRefresh,
  isLoading,
}: AppSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHosts = hosts.filter((host) => {
    const query = searchQuery.toLowerCase();
    return (
      host.ip.toLowerCase().includes(query) ||
      host.hostname?.toLowerCase().includes(query) ||
      host.os?.toLowerCase().includes(query)
    );
  });

  const getHostServices = (hostId: string) =>
    services.filter((s) => s.hostId === hostId);

  const upHosts = filteredHosts.filter((h) => h.status === "up");
  const downHosts = filteredHosts.filter((h) => h.status !== "up");

  return (
    <Sidebar>
      <SidebarHeader className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-primary/10">
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">PenTest Workflow</h1>
            <p className="text-xs text-muted-foreground">
              {hosts.length} host{hosts.length !== 1 ? "s" : ""} loaded
            </p>
          </div>
        </div>
        <NmapUploadDialog onUploadComplete={onRefresh} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search hosts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
                data-testid="input-search-hosts"
              />
            </div>
          </div>
        </SidebarGroup>

        <ScrollArea className="flex-1">
          {hosts.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Server className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No hosts yet</p>
              <p className="text-xs text-muted-foreground">
                Import an nmap scan to get started
              </p>
            </div>
          ) : (
            <>
              {upHosts.length > 0 && (
                <SidebarGroup>
                  <SidebarGroupLabel className="flex items-center gap-2">
                    <span>Active Hosts</span>
                    <Badge variant="secondary" className="text-xs">
                      {upHosts.length}
                    </Badge>
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {upHosts.map((host) => (
                        <SidebarMenuItem key={host.id}>
                          <HostCard
                            host={host}
                            services={getHostServices(host.id)}
                            isSelected={selectedHostId === host.id}
                            onClick={() => onSelectHost(host.id)}
                          />
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}

              {downHosts.length > 0 && (
                <SidebarGroup>
                  <SidebarGroupLabel className="flex items-center gap-2">
                    <span>Inactive Hosts</span>
                    <Badge variant="outline" className="text-xs">
                      {downHosts.length}
                    </Badge>
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {downHosts.map((host) => (
                        <SidebarMenuItem key={host.id}>
                          <HostCard
                            host={host}
                            services={getHostServices(host.id)}
                            isSelected={selectedHostId === host.id}
                            onClick={() => onSelectHost(host.id)}
                          />
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
            </>
          )}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={onRefresh}
          disabled={isLoading}
          data-testid="button-refresh-data"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
