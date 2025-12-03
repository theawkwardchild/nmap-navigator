import { useState } from "react";
import { Key, Plus, X, Check, AlertCircle, HelpCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import type { Credential, CredentialTest, Service, Host } from "@shared/schema";

interface CredentialPanelProps {
  credentials: Credential[];
  credentialTests: CredentialTest[];
  hosts: Host[];
  services: Service[];
  onAddCredential: (credential: Omit<Credential, "id">) => void;
  onDeleteCredential: (id: string) => void;
  onTestCredential: (credentialId: string, serviceId: string, hostId: string, status: "valid" | "invalid") => void;
}

export function CredentialPanel({
  credentials,
  credentialTests,
  hosts,
  services,
  onAddCredential,
  onDeleteCredential,
  onTestCredential,
}: CredentialPanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCredential, setNewCredential] = useState({
    username: "",
    password: "",
    hash: "",
    type: "password" as const,
    source: "",
  });

  const handleAddCredential = () => {
    if (!newCredential.username) return;
    
    onAddCredential({
      username: newCredential.username,
      password: newCredential.type === "password" ? newCredential.password : undefined,
      hash: newCredential.type === "hash" ? newCredential.hash : undefined,
      type: newCredential.type,
      source: newCredential.source || undefined,
    });

    setNewCredential({
      username: "",
      password: "",
      hash: "",
      type: "password",
      source: "",
    });
    setIsAddDialogOpen(false);
  };

  const getCredentialTestStatus = (credentialId: string, serviceId: string) => {
    const test = credentialTests.find(
      (t) => t.credentialId === credentialId && t.serviceId === serviceId
    );
    return test?.status || "untested";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <Check className="h-3 w-3 text-chart-3" />;
      case "invalid":
        return <X className="h-3 w-3 text-destructive" />;
      default:
        return <HelpCircle className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      case "invalid":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4" />
            Credentials
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1" data-testid="button-add-credential">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Credential</DialogTitle>
                <DialogDescription>
                  Add a discovered credential to the global store.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newCredential.username}
                    onChange={(e) =>
                      setNewCredential({ ...newCredential, username: e.target.value })
                    }
                    placeholder="admin"
                    data-testid="input-credential-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newCredential.type}
                    onValueChange={(value: "password" | "hash" | "key") =>
                      setNewCredential({ ...newCredential, type: value })
                    }
                  >
                    <SelectTrigger data-testid="select-credential-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="password">Password</SelectItem>
                      <SelectItem value="hash">Hash</SelectItem>
                      <SelectItem value="key">SSH Key</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newCredential.type === "password" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="text"
                      value={newCredential.password}
                      onChange={(e) =>
                        setNewCredential({ ...newCredential, password: e.target.value })
                      }
                      placeholder="password123"
                      data-testid="input-credential-password"
                    />
                  </div>
                )}
                {newCredential.type === "hash" && (
                  <div className="space-y-2">
                    <Label htmlFor="hash">Hash</Label>
                    <Input
                      id="hash"
                      value={newCredential.hash}
                      onChange={(e) =>
                        setNewCredential({ ...newCredential, hash: e.target.value })
                      }
                      placeholder="aad3b435b51404eeaad3b435b51404ee:..."
                      className="font-mono text-xs"
                      data-testid="input-credential-hash"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="source">Source (optional)</Label>
                  <Input
                    id="source"
                    value={newCredential.source}
                    onChange={(e) =>
                      setNewCredential({ ...newCredential, source: e.target.value })
                    }
                    placeholder="Found in config file"
                    data-testid="input-credential-source"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCredential} disabled={!newCredential.username} data-testid="button-save-credential">
                  Add Credential
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4 pb-4">
          {credentials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Key className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No credentials yet</p>
              <p className="text-xs text-muted-foreground">
                Add discovered credentials here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {credentials.map((cred) => (
                <div
                  key={cred.id}
                  className="p-3 rounded-md border border-border bg-card/50"
                  data-testid={`credential-${cred.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-medium truncate">
                          {cred.username}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {cred.type}
                        </Badge>
                      </div>
                      {cred.password && (
                        <p className="font-mono text-xs text-muted-foreground truncate">
                          {cred.password}
                        </p>
                      )}
                      {cred.hash && (
                        <p className="font-mono text-xs text-muted-foreground truncate">
                          {cred.hash.substring(0, 20)}...
                        </p>
                      )}
                      {cred.source && (
                        <p className="text-xs text-muted-foreground mt-1">
                          From: {cred.source}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => onDeleteCredential(cred.id)}
                      data-testid={`button-delete-credential-${cred.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {services.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <div className="flex flex-wrap gap-1">
                        {services.slice(0, 6).map((service) => {
                          const host = hosts.find((h) => h.id === service.hostId);
                          const status = getCredentialTestStatus(cred.id, service.id);
                          return (
                            <Tooltip key={service.id}>
                              <TooltipTrigger asChild>
                                <button
                                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${getStatusColor(status)} hover-elevate`}
                                  onClick={() => {
                                    const newStatus = status === "valid" ? "invalid" : "valid";
                                    onTestCredential(cred.id, service.id, service.hostId, newStatus);
                                  }}
                                  data-testid={`test-credential-${cred.id}-${service.id}`}
                                >
                                  {getStatusIcon(status)}
                                  <span className="font-mono">{service.port}</span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  {host?.ip}:{service.port} ({service.name})
                                  <br />
                                  Click to toggle status
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
