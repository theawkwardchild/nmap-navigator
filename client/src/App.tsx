import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Home } from "@/pages/home";
import type { Host, Service } from "@shared/schema";

function AppContent() {
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);

  const { data: hosts = [], isLoading: hostsLoading, refetch: refetchHosts } = useQuery<Host[]>({
    queryKey: ["/api/hosts"],
  });

  const { data: services = [], isLoading: servicesLoading, refetch: refetchServices } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const handleRefresh = () => {
    refetchHosts();
    refetchServices();
  };

  const isLoading = hostsLoading || servicesLoading;

  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar
          hosts={hosts}
          services={services}
          selectedHostId={selectedHostId}
          onSelectHost={setSelectedHostId}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
        <main className="flex-1 overflow-hidden">
          <Home
            hosts={hosts}
            services={services}
            selectedHostId={selectedHostId}
            onSelectHost={setSelectedHostId}
          />
        </main>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="pentest-ui-theme">
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
