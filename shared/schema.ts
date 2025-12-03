import { z } from "zod";

// Host - represents a scanned target
export const hostSchema = z.object({
  id: z.string(),
  ip: z.string(),
  hostname: z.string().optional(),
  os: z.string().optional(),
  status: z.enum(["up", "down", "unknown"]),
});

export type Host = z.infer<typeof hostSchema>;
export const insertHostSchema = hostSchema.omit({ id: true });
export type InsertHost = z.infer<typeof insertHostSchema>;

// Service - a running service on a host
export const serviceSchema = z.object({
  id: z.string(),
  hostId: z.string(),
  port: z.number(),
  protocol: z.enum(["tcp", "udp"]),
  name: z.string(),
  product: z.string().optional(),
  version: z.string().optional(),
  state: z.enum(["open", "closed", "filtered"]),
});

export type Service = z.infer<typeof serviceSchema>;
export const insertServiceSchema = serviceSchema.omit({ id: true });
export type InsertService = z.infer<typeof insertServiceSchema>;

// ChecklistItem - a task from the notes
export const checklistItemSchema = z.object({
  id: z.string(),
  serviceType: z.string(), // e.g., "smb", "http", "ssh"
  category: z.enum(["enumeration", "unauthenticated", "authenticated", "exploitation"]),
  title: z.string(),
  description: z.string().optional(),
  command: z.string().optional(),
  links: z.array(z.string()).optional(),
  order: z.number(),
  parentId: z.string().optional(), // For nested checklists
});

export type ChecklistItem = z.infer<typeof checklistItemSchema>;

// ChecklistState - tracks completion status per host/service
export const checklistStateSchema = z.object({
  id: z.string(),
  hostId: z.string(),
  serviceId: z.string(),
  checklistItemId: z.string(),
  completed: z.boolean(),
  notes: z.string().optional(),
});

export type ChecklistState = z.infer<typeof checklistStateSchema>;
export const insertChecklistStateSchema = checklistStateSchema.omit({ id: true });
export type InsertChecklistState = z.infer<typeof insertChecklistStateSchema>;

// Credential - global credentials store
export const credentialSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string().optional(),
  hash: z.string().optional(),
  type: z.enum(["password", "hash", "key"]),
  source: z.string().optional(), // Where it was found
});

export type Credential = z.infer<typeof credentialSchema>;
export const insertCredentialSchema = credentialSchema.omit({ id: true });
export type InsertCredential = z.infer<typeof insertCredentialSchema>;

// CredentialTest - tracks credential validity per service
export const credentialTestSchema = z.object({
  id: z.string(),
  credentialId: z.string(),
  serviceId: z.string(),
  hostId: z.string(),
  status: z.enum(["untested", "valid", "invalid"]),
});

export type CredentialTest = z.infer<typeof credentialTestSchema>;
export const insertCredentialTestSchema = credentialTestSchema.omit({ id: true });
export type InsertCredentialTest = z.infer<typeof insertCredentialTestSchema>;

// Note - parsed markdown notes
export const noteSchema = z.object({
  id: z.string(),
  serviceType: z.string(),
  title: z.string(),
  content: z.string(), // Raw markdown
  category: z.string(),
  path: z.string(), // Original file path
});

export type Note = z.infer<typeof noteSchema>;

// Username - discovered usernames
export const usernameSchema = z.object({
  id: z.string(),
  username: z.string(),
  source: z.string().optional(),
});

export type Username = z.infer<typeof usernameSchema>;
export const insertUsernameSchema = usernameSchema.omit({ id: true });
export type InsertUsername = z.infer<typeof insertUsernameSchema>;

// DiscoveredPassword - passwords found during enumeration
export const discoveredPasswordSchema = z.object({
  id: z.string(),
  password: z.string(),
  source: z.string().optional(),
});

export type DiscoveredPassword = z.infer<typeof discoveredPasswordSchema>;
export const insertDiscoveredPasswordSchema = discoveredPasswordSchema.omit({ id: true });
export type InsertDiscoveredPassword = z.infer<typeof insertDiscoveredPasswordSchema>;

// API Response types
export const scanUploadResponseSchema = z.object({
  hosts: z.array(hostSchema),
  services: z.array(serviceSchema),
});

export type ScanUploadResponse = z.infer<typeof scanUploadResponseSchema>;

// Service type mapping for notes
export const serviceTypeMap: Record<string, string[]> = {
  smb: ["smb", "microsoft-ds", "netbios-ssn", "netbios"],
  http: ["http", "https", "http-proxy", "http-alt"],
  ssh: ["ssh"],
  ftp: ["ftp", "ftp-data"],
  dns: ["dns", "domain"],
  ldap: ["ldap", "ldaps"],
  kerberos: ["kerberos", "kerberos-sec"],
  rdp: ["rdp", "ms-wbt-server"],
  mysql: ["mysql"],
  mssql: ["mssql", "ms-sql-s", "ms-sql-m"],
  postgresql: ["postgresql", "postgres"],
  vnc: ["vnc"],
  telnet: ["telnet"],
  smtp: ["smtp", "smtps"],
  pop3: ["pop3", "pop3s"],
  imap: ["imap", "imaps"],
  snmp: ["snmp"],
  nfs: ["nfs", "nfsd"],
  rpc: ["rpc", "rpcbind", "msrpc"],
  winrm: ["winrm", "wsman"],
};

// Get normalized service type from nmap service name
export function getServiceType(serviceName: string): string {
  const lowerName = serviceName.toLowerCase();
  for (const [type, names] of Object.entries(serviceTypeMap)) {
    if (names.some(n => lowerName.includes(n))) {
      return type;
    }
  }
  return lowerName;
}
