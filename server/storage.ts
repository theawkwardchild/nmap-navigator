import { randomUUID } from "crypto";
import type {
  Host,
  InsertHost,
  Service,
  InsertService,
  ChecklistItem,
  ChecklistState,
  InsertChecklistState,
  Credential,
  InsertCredential,
  CredentialTest,
  InsertCredentialTest,
  Username,
  InsertUsername,
  DiscoveredPassword,
  InsertDiscoveredPassword,
} from "@shared/schema";

export interface IStorage {
  // Hosts
  getAllHosts(): Promise<Host[]>;
  getHost(id: string): Promise<Host | undefined>;
  createHost(host: InsertHost): Promise<Host>;
  deleteHost(id: string): Promise<void>;
  clearHosts(): Promise<void>;

  // Services
  getAllServices(): Promise<Service[]>;
  getServicesByHostId(hostId: string): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  deleteService(id: string): Promise<void>;
  clearServices(): Promise<void>;

  // Checklist Items (static, loaded from notes)
  getAllChecklistItems(): Promise<ChecklistItem[]>;
  getChecklistItemsByServiceType(serviceType: string): Promise<ChecklistItem[]>;
  setChecklistItems(items: ChecklistItem[]): Promise<void>;

  // Checklist States (user progress)
  getChecklistStates(hostId: string, serviceId: string): Promise<ChecklistState[]>;
  setChecklistState(state: InsertChecklistState): Promise<ChecklistState>;

  // Credentials
  getAllCredentials(): Promise<Credential[]>;
  getCredential(id: string): Promise<Credential | undefined>;
  createCredential(credential: InsertCredential): Promise<Credential>;
  deleteCredential(id: string): Promise<void>;

  // Credential Tests
  getAllCredentialTests(): Promise<CredentialTest[]>;
  setCredentialTest(test: InsertCredentialTest): Promise<CredentialTest>;

  // Usernames
  getAllUsernames(): Promise<Username[]>;
  createUsername(username: InsertUsername): Promise<Username>;
  deleteUsername(id: string): Promise<void>;

  // Passwords
  getAllPasswords(): Promise<DiscoveredPassword[]>;
  createPassword(password: InsertDiscoveredPassword): Promise<DiscoveredPassword>;
  deletePassword(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private hosts: Map<string, Host> = new Map();
  private services: Map<string, Service> = new Map();
  private checklistItems: ChecklistItem[] = [];
  private checklistStates: Map<string, ChecklistState> = new Map();
  private credentials: Map<string, Credential> = new Map();
  private credentialTests: Map<string, CredentialTest> = new Map();
  private usernames: Map<string, Username> = new Map();
  private passwords: Map<string, DiscoveredPassword> = new Map();

  // Hosts
  async getAllHosts(): Promise<Host[]> {
    return Array.from(this.hosts.values());
  }

  async getHost(id: string): Promise<Host | undefined> {
    return this.hosts.get(id);
  }

  async createHost(insertHost: InsertHost): Promise<Host> {
    const id = randomUUID();
    const host: Host = { ...insertHost, id };
    this.hosts.set(id, host);
    return host;
  }

  async deleteHost(id: string): Promise<void> {
    this.hosts.delete(id);
    // Also delete associated services and states
    for (const [serviceId, service] of this.services) {
      if (service.hostId === id) {
        this.services.delete(serviceId);
      }
    }
  }

  async clearHosts(): Promise<void> {
    this.hosts.clear();
  }

  // Services
  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getServicesByHostId(hostId: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter((s) => s.hostId === hostId);
  }

  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = randomUUID();
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  async deleteService(id: string): Promise<void> {
    this.services.delete(id);
  }

  async clearServices(): Promise<void> {
    this.services.clear();
  }

  // Checklist Items
  async getAllChecklistItems(): Promise<ChecklistItem[]> {
    return this.checklistItems;
  }

  async getChecklistItemsByServiceType(serviceType: string): Promise<ChecklistItem[]> {
    return this.checklistItems.filter((item) => item.serviceType === serviceType);
  }

  async setChecklistItems(items: ChecklistItem[]): Promise<void> {
    this.checklistItems = items;
  }

  // Checklist States
  async getChecklistStates(hostId: string, serviceId: string): Promise<ChecklistState[]> {
    return Array.from(this.checklistStates.values()).filter(
      (state) => state.hostId === hostId && state.serviceId === serviceId
    );
  }

  async setChecklistState(insertState: InsertChecklistState): Promise<ChecklistState> {
    const key = `${insertState.hostId}-${insertState.serviceId}-${insertState.checklistItemId}`;
    const existing = this.checklistStates.get(key);
    
    if (existing) {
      const updated = { ...existing, ...insertState };
      this.checklistStates.set(key, updated);
      return updated;
    }

    const id = randomUUID();
    const state: ChecklistState = { ...insertState, id };
    this.checklistStates.set(key, state);
    return state;
  }

  // Credentials
  async getAllCredentials(): Promise<Credential[]> {
    return Array.from(this.credentials.values());
  }

  async getCredential(id: string): Promise<Credential | undefined> {
    return this.credentials.get(id);
  }

  async createCredential(insertCredential: InsertCredential): Promise<Credential> {
    const id = randomUUID();
    const credential: Credential = { ...insertCredential, id };
    this.credentials.set(id, credential);
    return credential;
  }

  async deleteCredential(id: string): Promise<void> {
    this.credentials.delete(id);
    // Also delete associated tests
    for (const [testKey, test] of this.credentialTests) {
      if (test.credentialId === id) {
        this.credentialTests.delete(testKey);
      }
    }
  }

  // Credential Tests
  async getAllCredentialTests(): Promise<CredentialTest[]> {
    return Array.from(this.credentialTests.values());
  }

  async setCredentialTest(insertTest: InsertCredentialTest): Promise<CredentialTest> {
    const key = `${insertTest.credentialId}-${insertTest.serviceId}`;
    const existing = this.credentialTests.get(key);

    if (existing) {
      const updated = { ...existing, ...insertTest };
      this.credentialTests.set(key, updated);
      return updated;
    }

    const id = randomUUID();
    const test: CredentialTest = { ...insertTest, id };
    this.credentialTests.set(key, test);
    return test;
  }

  // Usernames
  async getAllUsernames(): Promise<Username[]> {
    return Array.from(this.usernames.values());
  }

  async createUsername(insertUsername: InsertUsername): Promise<Username> {
    const id = randomUUID();
    const username: Username = { ...insertUsername, id };
    this.usernames.set(id, username);
    return username;
  }

  async deleteUsername(id: string): Promise<void> {
    this.usernames.delete(id);
  }

  // Passwords
  async getAllPasswords(): Promise<DiscoveredPassword[]> {
    return Array.from(this.passwords.values());
  }

  async createPassword(insertPassword: InsertDiscoveredPassword): Promise<DiscoveredPassword> {
    const id = randomUUID();
    const password: DiscoveredPassword = { ...insertPassword, id };
    this.passwords.set(id, password);
    return password;
  }

  async deletePassword(id: string): Promise<void> {
    this.passwords.delete(id);
  }
}

export const storage = new MemStorage();
