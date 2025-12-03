import { useState } from "react";
import { User, Plus, Trash2 } from "lucide-react";
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
import type { Username } from "@shared/schema";

interface UsernamePanelProps {
  usernames: Username[];
  onAddUsername: (username: Omit<Username, "id">) => void;
  onDeleteUsername: (id: string) => void;
}

export function UsernamePanel({
  usernames,
  onAddUsername,
  onDeleteUsername,
}: UsernamePanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState({
    username: "",
    source: "",
  });

  const handleAddUsername = () => {
    if (!newUsername.username) return;
    
    onAddUsername({
      username: newUsername.username,
      source: newUsername.source || undefined,
    });

    setNewUsername({ username: "", source: "" });
    setIsAddDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Usernames
            <Badge variant="secondary" className="text-xs">
              {usernames.length}
            </Badge>
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1" data-testid="button-add-username">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Username</DialogTitle>
                <DialogDescription>
                  Add a discovered username to the global list.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-username">Username</Label>
                  <Input
                    id="new-username"
                    value={newUsername.username}
                    onChange={(e) =>
                      setNewUsername({ ...newUsername, username: e.target.value })
                    }
                    placeholder="administrator"
                    data-testid="input-new-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username-source">Source (optional)</Label>
                  <Input
                    id="username-source"
                    value={newUsername.source}
                    onChange={(e) =>
                      setNewUsername({ ...newUsername, source: e.target.value })
                    }
                    placeholder="RID cycling"
                    data-testid="input-username-source"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUsername} disabled={!newUsername.username} data-testid="button-save-username">
                  Add Username
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-32">
          {usernames.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No usernames discovered yet
            </p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {usernames.map((u) => (
                <Badge
                  key={u.id}
                  variant="outline"
                  className="gap-1 font-mono text-xs group"
                  data-testid={`username-${u.id}`}
                >
                  {u.username}
                  <button
                    onClick={() => onDeleteUsername(u.id)}
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    data-testid={`button-delete-username-${u.id}`}
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
