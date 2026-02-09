import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Auth FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // === MIDDLEWARE ===
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const isAdmin = await storage.isAdmin(req.user.claims.sub);
    if (!isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  // === ASSET ROUTES ===
  app.get(api.assets.list.path, requireAuth, async (req, res) => {
    const assets = await storage.getAssets();
    // In a real app, implement search/sort in DB. Here filtering in memory for MVP simplicity if needed,
    // or just return all since we don't have millions of records.
    // The frontend will receive all and can client-side filter for small datasets.
    // If search param exists:
    const search = req.query.search as string;
    if (search) {
      const lowerSearch = search.toLowerCase();
      const filtered = assets.filter(a => 
        a.item_name.toLowerCase().includes(lowerSearch) ||
        a.model.toLowerCase().includes(lowerSearch) ||
        a.serial_number?.toLowerCase().includes(lowerSearch) ||
        a.assigned_to?.toLowerCase().includes(lowerSearch)
      );
      return res.json(filtered);
    }
    res.json(assets);
  });

  app.get(api.assets.get.path, requireAuth, async (req, res) => {
    const asset = await storage.getAsset(Number(req.params.id));
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    res.json(asset);
  });

  app.post(api.assets.create.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.assets.create.input.parse(req.body);
      // Use user name for logging if possible, fallback to ID
      const userId = req.user.claims.first_name ? `${req.user.claims.first_name} ${req.user.claims.last_name || ''}`.trim() : req.user.claims.sub;
      
      const asset = await storage.createAsset(input, userId);
      res.status(201).json(asset);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.assets.update.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.assets.update.input.parse(req.body);
      const userId = req.user.claims.first_name ? `${req.user.claims.first_name} ${req.user.claims.last_name || ''}`.trim() : req.user.claims.sub;
      
      const asset = await storage.updateAsset(Number(req.params.id), input, userId);
      res.json(asset);
    } catch (err) {
      if (err instanceof Error && err.message === "Asset not found") {
        return res.status(404).json({ message: "Asset not found" });
      }
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.assets.delete.path, requireAuth, async (req, res) => {
    await storage.deleteAsset(Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.assets.import.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.assets.import.input.parse(req.body);
      const userId = req.user.claims.first_name ? `${req.user.claims.first_name} ${req.user.claims.last_name || ''}`.trim() : req.user.claims.sub;
      
      const count = await storage.bulkImportAssets(input, userId);
      res.status(201).json({ count });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === SETTINGS ROUTES ===
  app.get(api.settings.get.path, requireAuth, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post(api.settings.update.path, requireAdmin, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const settings = await storage.updateSettings(input);
      res.json(settings);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === ADMIN ROUTES ===
  app.get(api.admin.users.list.path, requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.post(api.admin.users.toggleAdmin.path, requireAdmin, async (req, res) => {
    const isAdmin = await storage.toggleAdmin(req.params.id);
    res.json({ isAdmin });
  });

  // === SEED DATA ===
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const assets = await storage.getAssets();
  if (assets.length === 0) {
    const userId = "System Seed";
    await storage.createAsset({
      item_name: "MacBook Pro 16",
      model: "M2 Max",
      serial_number: "FVFX23489",
      assigned_to: "John Doe",
      profile: "Engineering",
      company: "Acme Corp",
      working_condition: "Working",
      is_available: false,
      notes: "Assigned for main development work",
      sr_no: "IT-001"
    }, userId);

    await storage.createAsset({
      item_name: "Dell XPS 15",
      model: "9520",
      serial_number: "DL342342",
      assigned_to: "",
      profile: "",
      company: "Acme Corp",
      working_condition: "Working",
      is_available: true,
      notes: "Backup laptop",
      sr_no: "IT-002"
    }, userId);

    await storage.createAsset({
      item_name: "Herman Miller Chair",
      model: "Aeron",
      serial_number: "HM-9923",
      assigned_to: "Jane Smith",
      profile: "Marketing",
      company: "Acme Corp",
      working_condition: "Working",
      is_available: false,
      notes: "Ergonomic setup",
      sr_no: "FUR-001"
    }, userId);
  }
}
