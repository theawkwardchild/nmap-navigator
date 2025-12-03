import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChecklistSection } from "@/components/checklist-section";
import { Server, Globe, Lock, Unlock, Shield } from "lucide-react";
import type { Service, ChecklistItem, ChecklistState } from "@shared/schema";

interface ServicePanelProps {
  service: Service;
  hostIp: string;
  checklistItems: ChecklistItem[];
  checklistStates: Record<string, ChecklistState>;
  onToggleItem: (itemId: string, completed: boolean) => void;
}

const serviceIcons: Record<string, typeof Server> = {
  http: Globe,
  https: Lock,
  ssh: Lock,
  ftp: Server,
  smb: Server,
  default: Server,
};

export function ServicePanel({
  service,
  hostIp,
  checklistItems,
  checklistStates,
  onToggleItem,
}: ServicePanelProps) {
  const Icon = serviceIcons[service.name.toLowerCase()] || serviceIcons.default;

  const categorizedItems = {
    enumeration: checklistItems.filter((item) => item.category === "enumeration"),
    unauthenticated: checklistItems.filter((item) => item.category === "unauthenticated"),
    authenticated: checklistItems.filter((item) => item.category === "authenticated"),
    exploitation: checklistItems.filter((item) => item.category === "exploitation"),
  };

  const totalItems = checklistItems.length;
  const completedItems = checklistItems.filter(
    (item) => checklistStates[item.id]?.completed
  ).length;
  const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {service.name.toUpperCase()}
                  <Badge variant="outline" className="font-mono text-xs">
                    {service.port}/{service.protocol}
                  </Badge>
                </CardTitle>
                {(service.product || service.version) && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {[service.product, service.version].filter(Boolean).join(" ")}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{completedItems}/{totalItems}</p>
                <p className="text-xs text-muted-foreground">Tasks completed</p>
              </div>
              <Progress value={overallProgress} className="w-24 h-2" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-2">
        {categorizedItems.enumeration.length > 0 && (
          <ChecklistSection
            title="Initial Enumeration"
            category="enumeration"
            items={categorizedItems.enumeration}
            states={checklistStates}
            hostIp={hostIp}
            port={service.port}
            onToggle={onToggleItem}
            defaultOpen={true}
          />
        )}

        {categorizedItems.unauthenticated.length > 0 && (
          <ChecklistSection
            title="Unauthenticated Attacks"
            category="unauthenticated"
            items={categorizedItems.unauthenticated}
            states={checklistStates}
            hostIp={hostIp}
            port={service.port}
            onToggle={onToggleItem}
            defaultOpen={true}
          />
        )}

        {categorizedItems.authenticated.length > 0 && (
          <ChecklistSection
            title="Authenticated Enumeration"
            category="authenticated"
            items={categorizedItems.authenticated}
            states={checklistStates}
            hostIp={hostIp}
            port={service.port}
            onToggle={onToggleItem}
            defaultOpen={false}
          />
        )}

        {categorizedItems.exploitation.length > 0 && (
          <ChecklistSection
            title="Exploitation"
            category="exploitation"
            items={categorizedItems.exploitation}
            states={checklistStates}
            hostIp={hostIp}
            port={service.port}
            onToggle={onToggleItem}
            defaultOpen={false}
          />
        )}
      </div>

      {totalItems === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Unlock className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground text-center">
              No specific checklists available for this service type.
              <br />
              <span className="text-xs">Try general enumeration techniques.</span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
