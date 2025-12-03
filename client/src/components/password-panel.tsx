import { useState } from "react";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { DiscoveredPassword } from "@shared/schema";

interface PasswordPanelProps {
  passwords: DiscoveredPassword[];
  onAddPassword: (password: Omit<DiscoveredPassword, "id">) => void;
  onDeletePassword: (id: string) => void;
}

export function PasswordPanel({
  passwords,
  onAddPassword,
  onDeletePassword,
}: PasswordPanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState({
    password: "",
    source: "",
  });

  const handleAddPassword = () => {
    if (!newPassword.password) return;
    
    onAddPassword({
      password: newPassword.password,
      source: newPassword.source || undefined,
    });

    setNewPassword({ password: "", source: "" });
    setIsAddDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Passwords
            <Badge variant="secondary" className="text-xs">
              {passwords.length}
            </Badge>
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1" data-testid="button-add-password">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Password</DialogTitle>
                <DialogDescription>
                  Add a discovered password to the global list.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password</Label>
                  <Input
                    id="new-password"
                    value={newPassword.password}
                    onChange={(e) =>
                      setNewPassword({ ...newPassword, password: e.target.value })
                    }
                    placeholder="Password123!"
                    data-testid="input-new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-source">Source (optional)</Label>
                  <Input
                    id="password-source"
                    value={newPassword.source}
                    onChange={(e) =>
                      setNewPassword({ ...newPassword, source: e.target.value })
                    }
                    placeholder="Hashcat cracked"
                    data-testid="input-password-source"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPassword} disabled={!newPassword.password} data-testid="button-save-password">
                  Add Password
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-32">
          {passwords.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No passwords discovered yet
            </p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {passwords.map((p) => (
                <Badge
                  key={p.id}
                  variant="outline"
                  className="gap-1 font-mono text-xs group"
                  data-testid={`password-${p.id}`}
                >
                  {p.password}
                  <button
                    onClick={() => onDeletePassword(p.id)}
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    data-testid={`button-delete-password-${p.id}`}
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
