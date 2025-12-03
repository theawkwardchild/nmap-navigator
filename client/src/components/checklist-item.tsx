import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CodeBlock } from "@/components/code-block";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ChecklistItem as ChecklistItemType, ChecklistState } from "@shared/schema";

interface ChecklistItemProps {
  item: ChecklistItemType;
  state?: ChecklistState;
  hostIp?: string;
  port?: number;
  onToggle: (itemId: string, completed: boolean) => void;
  children?: React.ReactNode;
}

export function ChecklistItemComponent({
  item,
  state,
  hostIp,
  port,
  onToggle,
  children,
}: ChecklistItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isCompleted = state?.completed ?? false;

  return (
    <div className="group" data-testid={`checklist-item-${item.id}`}>
      <div className="flex items-start gap-3 py-2">
        <Checkbox
          id={item.id}
          checked={isCompleted}
          onCheckedChange={(checked) => onToggle(item.id, checked as boolean)}
          className="mt-0.5"
          data-testid={`checkbox-${item.id}`}
        />
        <div className="flex-1 min-w-0">
          <label
            htmlFor={item.id}
            className={`text-sm font-medium cursor-pointer ${
              isCompleted ? "line-through text-muted-foreground" : ""
            }`}
          >
            {item.title}
          </label>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
          )}
          {item.command && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
              <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid={`toggle-command-${item.id}`}>
                {isOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <span>Show command</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <CodeBlock code={item.command} hostIp={hostIp} port={port} />
              </CollapsibleContent>
            </Collapsible>
          )}
          {item.links && item.links.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {item.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  data-testid={`link-${item.id}-${idx}`}
                >
                  <ExternalLink className="h-3 w-3" />
                  {new URL(link).hostname}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      {children && <div className="ml-7 pl-4 border-l-2 border-border">{children}</div>}
    </div>
  );
}
