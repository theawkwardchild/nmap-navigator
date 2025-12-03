import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ServicePanel } from "@/components/service-panel";
import { CredentialPanel } from "@/components/credential-panel";
import { UsernamePanel } from "@/components/username-panel";
import { PasswordPanel } from "@/components/password-panel";
import { EmptyState } from "@/components/empty-state";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Server, 
  Key, 
  ChevronRight, 
  Monitor, 
  HardDrive, 
  Globe, 
  PanelRightOpen,
  PanelRightClose
} from "lucide-react";
import type { 
  Host, 
  Service, 
  ChecklistItem, 
  ChecklistState, 
  Credential, 
  CredentialTest,
  Username,
  DiscoveredPassword
} from "@shared/schema";

interface HomeProps {
  hosts: Host[];
  services: Service[];
  selectedHostId: string | null;
  onSelectHost: (hostId: string) => void;
}

export function Home({ hosts, services, selectedHostId, onSelectHost }: HomeProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const { toast } = useToast();

  const selectedHost = hosts.find((h) => h.id === selectedHostId);
  const hostServices = services.filter((s) => s.hostId === selectedHostId && s.state === "open");
  const selectedService = hostServices.find((s) => s.id === selectedServiceId) || hostServices[0];

  const { data: checklistItems = [] } = useQuery<ChecklistItem[]>({
    queryKey: ["/api/checklists", { serviceId: selectedService?.id }],
    queryFn: async () => {
      if (!selectedService) return [];
      const res = await fetch(`/api/checklists?serviceId=${selectedService.id}`);
      if (!res.ok) throw new Error("Failed to fetch checklists");
      return res.json();
    },
    enabled: !!selectedService,
  });

  const { data: checklistStates = [] } = useQuery<ChecklistState[]>({
    queryKey: ["/api/checklist-states", { hostId: selectedHostId, serviceId: selectedService?.id }],
    queryFn: async () => {
      if (!selectedHostId || !selectedService) return [];
      const res = await fetch(`/api/checklist-states?hostId=${selectedHostId}&serviceId=${selectedService.id}`);
      if (!res.ok) throw new Error("Failed to fetch checklist states");
      return res.json();
    },
    enabled: !!selectedHostId && !!selectedService,
  });

  const { data: credentials = [] } = useQuery<Credential[]>({
    queryKey: ["/api/credentials"],
  });

  const { data: credentialTests = [] } = useQuery<CredentialTest[]>({
    queryKey: ["/api/credential-tests"],
  });

  const { data: usernames = [] } = useQuery<Username[]>({
    queryKey: ["/api/usernames"],
  });

  const { data: passwords = [] } = useQuery<DiscoveredPassword[]>({
    queryKey: ["/api/passwords"],
  });

  const toggleChecklistMutation = useMutation({
    mutationFn: async ({ itemId, completed }: { itemId: string; completed: boolean }) => {
      return apiRequest("POST", "/api/checklist-states", {
        hostId: selectedHostId,
        serviceId: selectedService?.id,
        checklistItemId: itemId,
        completed,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/checklist-states", { hostId: selectedHostId, serviceId: selectedService?.id }] 
      });
    },
  });

  const addCredentialMutation = useMutation({
    mutationFn: async (credential: Omit<Credential, "id">) => {
      return apiRequest("POST", "/api/credentials", credential);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credentials"] });
      toast({ title: "Credential added" });
    },
  });

  const deleteCredentialMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/credentials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credentials"] });
      toast({ title: "Credential deleted" });
    },
  });

  const testCredentialMutation = useMutation({
    mutationFn: async ({ credentialId, serviceId, hostId, status }: {
      credentialId: string;
      serviceId: string;
      hostId: string;
      status: "valid" | "invalid";
    }) => {
      return apiRequest("POST", "/api/credential-tests", {
        credentialId,
        serviceId,
        hostId,
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credential-tests"] });
    },
  });

  const addUsernameMutation = useMutation({
    mutationFn: async (username: Omit<Username, "id">) => {
      return apiRequest("POST", "/api/usernames", username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/usernames"] });
      toast({ title: "Username added" });
    },
  });

  const deleteUsernameMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/usernames/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/usernames"] });
    },
  });

  const addPasswordMutation = useMutation({
    mutationFn: async (password: Omit<DiscoveredPassword, "id">) => {
      return apiRequest("POST", "/api/passwords", password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      toast({ title: "Password added" });
    },
  });

  const deletePasswordMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/passwords/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
    },
  });

  const checklistStatesMap = checklistStates.reduce((acc, state) => {
    acc[state.checklistItemId] = state;
    return acc;
  }, {} as Record<string, ChecklistState>);

  const handleToggleItem = (itemId: string, completed: boolean) => {
    toggleChecklistMutation.mutate({ itemId, completed });
  };

  const getOsIcon = (os?: string) => {
    const osLower = os?.toLowerCase() || "";
    if (osLower.includes("windows")) return Monitor;
    if (osLower.includes("linux")) return Server;
    return HardDrive;
  };

  const totalTasks = checklistItems.length;
  const completedTasks = checklistItems.filter(
    (item) => checklistStatesMap[item.id]?.completed
  ).length;
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  if (hosts.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border flex-wrap">
          <div className="flex items-center gap-3">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </div>
          <ThemeToggle />
        </header>
        <div className="flex-1">
          <EmptyState type="no-hosts" />
        </div>
      </div>
    );
  }

  if (!selectedHost) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border flex-wrap">
          <div className="flex items-center gap-3">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </div>
          <ThemeToggle />
        </header>
        <div className="flex-1">
          <EmptyState type="no-selection" />
        </div>
      </div>
    );
  }

  const OsIcon = getOsIcon(selectedHost.os);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border flex-wrap">
        <div className="flex items-center gap-3">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <Separator orientation="vertical" className="h-4" />
          <nav className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">Hosts</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium font-mono">{selectedHost.ip}</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="hidden lg:flex"
            data-testid="button-toggle-right-panel"
          >
            {rightPanelOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" data-testid="button-credentials-mobile">
                <Key className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="p-4 space-y-4 h-full overflow-auto">
                <CredentialPanel
                  credentials={credentials}
                  credentialTests={credentialTests}
                  hosts={hosts}
                  services={hostServices}
                  onAddCredential={addCredentialMutation.mutate}
                  onDeleteCredential={deleteCredentialMutation.mutate}
                  onTestCredential={(credentialId, serviceId, hostId, status) =>
                    testCredentialMutation.mutate({ credentialId, serviceId, hostId, status })
                  }
                />
                <UsernamePanel
                  usernames={usernames}
                  onAddUsername={addUsernameMutation.mutate}
                  onDeleteUsername={deleteUsernameMutation.mutate}
                />
                <PasswordPanel
                  passwords={passwords}
                  onAddPassword={addPasswordMutation.mutate}
                  onDeletePassword={deletePasswordMutation.mutate}
                />
              </div>
            </SheetContent>
          </Sheet>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${
                      selectedHost.status === "up" ? "bg-chart-3/10" : "bg-muted"
                    }`}>
                      <OsIcon className={`h-5 w-5 ${
                        selectedHost.status === "up" ? "text-chart-3" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-mono flex items-center gap-2">
                        {selectedHost.ip}
                        <Badge 
                          variant={selectedHost.status === "up" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {selectedHost.status}
                        </Badge>
                      </CardTitle>
                      {selectedHost.hostname && (
                        <p className="text-sm text-muted-foreground">{selectedHost.hostname}</p>
                      )}
                      {selectedHost.os && (
                        <p className="text-xs text-muted-foreground">{selectedHost.os}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{hostServices.length} services</p>
                      <p className="text-xs text-muted-foreground">
                        {completedTasks}/{totalTasks} tasks
                      </p>
                    </div>
                    <Progress value={overallProgress} className="w-24 h-2" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {hostServices.length === 0 ? (
            <div className="flex-1">
              <EmptyState type="no-services" />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col">
              <Tabs
                value={selectedServiceId || hostServices[0]?.id}
                onValueChange={setSelectedServiceId}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="px-4 py-2 border-b border-border overflow-x-auto">
                  <TabsList className="h-9">
                    {hostServices.map((service) => (
                      <TabsTrigger
                        key={service.id}
                        value={service.id}
                        className="gap-2 data-[state=active]:bg-background"
                        data-testid={`tab-service-${service.id}`}
                      >
                        <Globe className="h-3 w-3" />
                        <span className="font-mono text-xs">{service.name}</span>
                        <Badge variant="outline" className="text-xs font-mono px-1.5">
                          {service.port}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <ScrollArea className="flex-1 p-4">
                  {hostServices.map((service) => (
                    <TabsContent
                      key={service.id}
                      value={service.id}
                      className="m-0 outline-none"
                    >
                      <ServicePanel
                        service={service}
                        hostIp={selectedHost.ip}
                        checklistItems={checklistItems}
                        checklistStates={checklistStatesMap}
                        onToggleItem={handleToggleItem}
                      />
                    </TabsContent>
                  ))}
                </ScrollArea>
              </Tabs>
            </div>
          )}
        </div>

        {rightPanelOpen && (
          <div className="hidden lg:flex w-80 border-l border-border flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <CredentialPanel
                  credentials={credentials}
                  credentialTests={credentialTests}
                  hosts={hosts}
                  services={hostServices}
                  onAddCredential={addCredentialMutation.mutate}
                  onDeleteCredential={deleteCredentialMutation.mutate}
                  onTestCredential={(credentialId, serviceId, hostId, status) =>
                    testCredentialMutation.mutate({ credentialId, serviceId, hostId, status })
                  }
                />
                <UsernamePanel
                  usernames={usernames}
                  onAddUsername={addUsernameMutation.mutate}
                  onDeleteUsername={deleteUsernameMutation.mutate}
                />
                <PasswordPanel
                  passwords={passwords}
                  onAddPassword={addPasswordMutation.mutate}
                  onDeletePassword={deletePasswordMutation.mutate}
                />
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
