import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

export * from "./models/auth";

// === ASSETS ===
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  item_name: text("item_name").notNull(),
  model: text("model").notNull(),
  serial_number: text("serial_number"), // Can be null? Prompt says "Serial / Part No."
  assigned_to: text("assigned_to"), // User (Assigned to) - Text field as per requirements
  profile: text("profile"), // Profile (e.g., IT, Marketing)
  company: text("company"), // Company (Vendor or Ownership)
  working_condition: text("working_condition").default("Working").notNull(), // 'Working', 'Not Working', 'Under Repair'
  is_available: boolean("is_available").default(true).notNull(),
  notes: text("notes"),
  sr_no: text("sr_no"), // Sr. No
  updated_at: timestamp("updated_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertAssetSchema = createInsertSchema(assets).omit({ 
  id: true, 
  updated_at: true, 
  created_at: true 
});

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

// === CHANGE LOGS ===
export const changeLogs = pgTable("change_logs", {
  id: serial("id").primaryKey(),
  asset_id: integer("asset_id").notNull(), // Foreign key handled in code or simple integer
  field_name: text("field_name").notNull(),
  old_value: text("old_value"),
  new_value: text("new_value"),
  changed_by: text("changed_by").notNull(), // User ID or Name
  changed_at: timestamp("changed_at").defaultNow(),
});

export const changeLogsRelations = relations(changeLogs, ({ one }) => ({
  asset: one(assets, {
    fields: [changeLogs.asset_id],
    references: [assets.id],
  }),
}));

export const assetsRelations = relations(assets, ({ many }) => ({
  changes: many(changeLogs),
}));

export type ChangeLog = typeof changeLogs.$inferSelect;

// === SETTINGS (Company Name) ===
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  company_name: text("company_name").notNull().default("My Asset Manager"),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingsSchema>;

// === APP ROLES (Admin) ===
export const appRoles = pgTable("app_roles", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(), // References auth.users.id
  is_admin: boolean("is_admin").default(false).notNull(),
});

export const insertAppRoleSchema = createInsertSchema(appRoles).omit({ id: true });
export type AppRole = typeof appRoles.$inferSelect;

// === API TYPES ===
export type CreateAssetRequest = InsertAsset;
export type UpdateAssetRequest = Partial<InsertAsset>;

export type AssetWithHistory = Asset & {
  changes: ChangeLog[];
};

export type ChangeLogResponse = ChangeLog;

export type UserRoleResponse = {
  user: typeof users.$inferSelect;
  isAdmin: boolean;
};
