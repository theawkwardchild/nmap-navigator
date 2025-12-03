import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { parseNmapXml } from "./nmap-parser";
import { defaultChecklistItems } from "./checklist-data";
import { getServiceType } from "@shared/schema";
import {
  insertCredentialSchema,
  insertChecklistStateSchema,
  insertCredentialTestSchema,
  insertUsernameSchema,
  insertDiscoveredPasswordSchema,
} from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize checklist items from default data
  await storage.setChecklistItems(defaultChecklistItems);

  // ============ HOSTS ============
  app.get("/api/hosts", async (_req, res) => {
    try {
      const hosts = await storage.getAllHosts();
      res.json(hosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hosts" });
    }
  });

  app.get("/api/hosts/:id", async (req, res) => {
    try {
      const host = await storage.getHost(req.params.id);
      if (!host) {
        return res.status(404).json({ message: "Host not found" });
      }
      res.json(host);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch host" });
    }
  });

  app.delete("/api/hosts/:id", async (req, res) => {
    try {
      await storage.deleteHost(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete host" });
    }
  });

  // ============ SERVICES ============
  app.get("/api/services", async (_req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/hosts/:hostId/services", async (req, res) => {
    try {
      const services = await storage.getServicesByHostId(req.params.hostId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // ============ NMAP UPLOAD ============
  app.post("/api/scans/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const xmlContent = req.file.buffer.toString("utf-8");
      const { hosts: parsedHosts, services: parsedServices } = parseNmapXml(xmlContent);

      // Clear existing data
      await storage.clearHosts();
      await storage.clearServices();

      // Create hosts and services
      const createdHosts = [];
      const createdServices = [];

      for (const hostData of parsedHosts) {
        const host = await storage.createHost(hostData);
        createdHosts.push(host);

        // Get services for this host
        const hostServices = parsedServices.get(hostData.ip) || [];
        for (const serviceData of hostServices) {
          const service = await storage.createService({
            ...serviceData,
            hostId: host.id,
          });
          createdServices.push(service);
        }
      }

      res.json({
        hosts: createdHosts,
        services: createdServices,
        message: `Imported ${createdHosts.length} hosts and ${createdServices.length} services`,
      });
    } catch (error) {
      console.error("Nmap upload error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to parse nmap file" 
      });
    }
  });

  // ============ CHECKLISTS ============
  app.get("/api/checklists", async (req, res) => {
    try {
      const serviceId = req.query.serviceId as string | undefined;
      
      if (serviceId) {
        const service = await storage.getService(serviceId);
        if (!service) {
          return res.json([]);
        }
        const serviceType = getServiceType(service.name);
        const items = await storage.getChecklistItemsByServiceType(serviceType);
        return res.json(items);
      }
      
      const items = await storage.getAllChecklistItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch checklists" });
    }
  });

  // ============ CHECKLIST STATES ============
  app.get("/api/checklist-states", async (req, res) => {
    try {
      const hostId = req.query.hostId as string;
      const serviceId = req.query.serviceId as string;

      if (!hostId || !serviceId) {
        return res.json([]);
      }

      const states = await storage.getChecklistStates(hostId, serviceId);
      res.json(states);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch checklist states" });
    }
  });

  app.post("/api/checklist-states", async (req, res) => {
    try {
      const parsed = insertChecklistStateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const state = await storage.setChecklistState(parsed.data);
      res.json(state);
    } catch (error) {
      res.status(500).json({ message: "Failed to update checklist state" });
    }
  });

  // ============ CREDENTIALS ============
  app.get("/api/credentials", async (_req, res) => {
    try {
      const credentials = await storage.getAllCredentials();
      res.json(credentials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credentials" });
    }
  });

  app.post("/api/credentials", async (req, res) => {
    try {
      const parsed = insertCredentialSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const credential = await storage.createCredential(parsed.data);
      res.json(credential);
    } catch (error) {
      res.status(500).json({ message: "Failed to create credential" });
    }
  });

  app.delete("/api/credentials/:id", async (req, res) => {
    try {
      await storage.deleteCredential(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete credential" });
    }
  });

  // ============ CREDENTIAL TESTS ============
  app.get("/api/credential-tests", async (_req, res) => {
    try {
      const tests = await storage.getAllCredentialTests();
      res.json(tests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credential tests" });
    }
  });

  app.post("/api/credential-tests", async (req, res) => {
    try {
      const parsed = insertCredentialTestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const test = await storage.setCredentialTest(parsed.data);
      res.json(test);
    } catch (error) {
      res.status(500).json({ message: "Failed to update credential test" });
    }
  });

  // ============ USERNAMES ============
  app.get("/api/usernames", async (_req, res) => {
    try {
      const usernames = await storage.getAllUsernames();
      res.json(usernames);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch usernames" });
    }
  });

  app.post("/api/usernames", async (req, res) => {
    try {
      const parsed = insertUsernameSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const username = await storage.createUsername(parsed.data);
      res.json(username);
    } catch (error) {
      res.status(500).json({ message: "Failed to create username" });
    }
  });

  app.delete("/api/usernames/:id", async (req, res) => {
    try {
      await storage.deleteUsername(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete username" });
    }
  });

  // ============ PASSWORDS ============
  app.get("/api/passwords", async (_req, res) => {
    try {
      const passwords = await storage.getAllPasswords();
      res.json(passwords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch passwords" });
    }
  });

  app.post("/api/passwords", async (req, res) => {
    try {
      const parsed = insertDiscoveredPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const password = await storage.createPassword(parsed.data);
      res.json(password);
    } catch (error) {
      res.status(500).json({ message: "Failed to create password" });
    }
  });

  app.delete("/api/passwords/:id", async (req, res) => {
    try {
      await storage.deletePassword(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete password" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
