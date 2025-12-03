import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChecklistItemComponent } from "@/components/checklist-item";
import type { ChecklistItem, ChecklistState } from "@shared/schema";

interface ChecklistSectionProps {
  title: string;
  category: "enumeration" | "unauthenticated" | "authenticated" | "exploitation";
  items: ChecklistItem[];
  states: Record<string, ChecklistState>;
  hostIp?: string;
  port?: number;
  onToggle: (itemId: string, completed: boolean) => void;
  defaultOpen?: boolean;
}

const categoryColors: Record<string, string> = {
  enumeration: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  unauthenticated: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  authenticated: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  exploitation: "bg-destructive/10 text-destructive border-destructive/20",
};

const categoryLabels: Record<string, string> = {
  enumeration: "Enumeration",
  unauthenticated: "Unauthenticated",
  authenticated: "Authenticated",
  exploitation: "Exploitation",
};

export function ChecklistSection({
  title,
  category,
  items,
  states,
  hostIp,
  port,
  onToggle,
  defaultOpen = true,
}: ChecklistSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const completedCount = items.filter((item) => states[item.id]?.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isComplete = completedCount === totalCount && totalCount > 0;

  const parentItems = items.filter((item) => !item.parentId);

  const getChildItems = (parentId: string) =>
    items.filter((item) => item.parentId === parentId);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
      <CollapsibleTrigger className="w-full" data-testid={`section-toggle-${category}`}>
        <div className="flex items-center justify-between p-3 rounded-md bg-card border border-card-border hover-elevate">
          <div className="flex items-center gap-3">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <div className="flex items-center gap-2">
              {isComplete ? (
                <CheckCircle2 className="h-4 w-4 text-chart-3" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium text-sm">{title}</span>
            </div>
            <Badge variant="outline" className={`text-xs ${categoryColors[category]}`}>
              {categoryLabels[category]}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
            <Progress value={progress} className="w-20 h-1.5" />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 py-2 space-y-1">
          {parentItems.map((item) => {
            const childItems = getChildItems(item.id);
            return (
              <ChecklistItemComponent
                key={item.id}
                item={item}
                state={states[item.id]}
                hostIp={hostIp}
                port={port}
                onToggle={onToggle}
              >
                {childItems.length > 0 && (
                  <div className="space-y-1">
                    {childItems.map((child) => (
                      <ChecklistItemComponent
                        key={child.id}
                        item={child}
                        state={states[child.id]}
                        hostIp={hostIp}
                        port={port}
                        onToggle={onToggle}
                      />
                    ))}
                  </div>
                )}
              </ChecklistItemComponent>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
