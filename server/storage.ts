import { db } from "./db";
import {
  assets,
  changeLogs,
  settings,
  appRoles,
  type Asset,
  type InsertAsset,
  type UpdateAssetRequest,
  type ChangeLog,
  type Setting,
  type InsertSetting,
  type AssetWithHistory,
  type AppRole,
  users
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Assets
  getAssets(): Promise<Asset[]>;
  getAsset(id: number): Promise<AssetWithHistory | undefined>;
  createAsset(asset: InsertAsset, userId: string): Promise<Asset>;
  updateAsset(id: number, updates: UpdateAssetRequest, userId: string): Promise<Asset>;
  deleteAsset(id: number): Promise<void>;
  bulkImportAssets(assets: InsertAsset[], userId: string): Promise<number>;

  // Settings
  getSettings(): Promise<Setting>;
  updateSettings(updates: InsertSetting): Promise<Setting>;

  // Admin
  getAppRoles(): Promise<AppRole[]>;
  toggleAdmin(userId: string): Promise<boolean>;
  isAdmin(userId: string): Promise<boolean>;
  getAllUsers(): Promise<any[]>; // Returns users with admin status
}

export class DatabaseStorage implements IStorage {
  async getAssets(): Promise<Asset[]> {
    return await db.select().from(assets).orderBy(desc(assets.updated_at));
  }

  async getAsset(id: number): Promise<AssetWithHistory | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    if (!asset) return undefined;

    const changes = await db
      .select()
      .from(changeLogs)
      .where(eq(changeLogs.asset_id, id))
      .orderBy(desc(changeLogs.changed_at));

    return { ...asset, changes };
  }

  async createAsset(assetData: InsertAsset, userId: string): Promise<Asset> {
    const [asset] = await db.insert(assets).values(assetData).returning();

    // Log creation
    await db.insert(changeLogs).values({
      asset_id: asset.id,
      field_name: "CREATED",
      new_value: "Asset Created",
      changed_by: userId,
    });

    return asset;
  }

  async updateAsset(id: number, updates: UpdateAssetRequest, userId: string): Promise<Asset> {
    const [currentAsset] = await db.select().from(assets).where(eq(assets.id, id));
    if (!currentAsset) throw new Error("Asset not found");

    const [updatedAsset] = await db
      .update(assets)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(assets.id, id))
      .returning();

    // Log changes
    for (const [key, value] of Object.entries(updates)) {
      const oldValue = (currentAsset as any)[key];
      // Simple equality check (convert to string for comparison)
      if (String(oldValue) !== String(value) && key !== 'updated_at') {
        await db.insert(changeLogs).values({
          asset_id: id,
          field_name: key,
          old_value: String(oldValue),
          new_value: String(value),
          changed_by: userId,
        });
      }
    }

    return updatedAsset;
  }

  async deleteAsset(id: number): Promise<void> {
    await db.delete(changeLogs).where(eq(changeLogs.asset_id, id));
    await db.delete(assets).where(eq(assets.id, id));
  }

  async bulkImportAssets(assetList: InsertAsset[], userId: string): Promise<number> {
    if (assetList.length === 0) return 0;
    
    // We do this in a loop to get IDs for change logs, or use a transaction
    // For simplicity, simple loop
    let count = 0;
    for (const assetData of assetList) {
      await this.createAsset(assetData, userId);
      count++;
    }
    return count;
  }

  async getSettings(): Promise<Setting> {
    const [setting] = await db.select().from(settings).limit(1);
    if (setting) return setting;
    
    // Create default if not exists
    const [newSetting] = await db.insert(settings).values({}).returning();
    return newSetting;
  }

  async updateSettings(updates: InsertSetting): Promise<Setting> {
    const [setting] = await db.select().from(settings).limit(1);
    if (setting) {
      const [updated] = await db
        .update(settings)
        .set(updates)
        .where(eq(settings.id, setting.id))
        .returning();
      return updated;
    } else {
      const [newSetting] = await db.insert(settings).values(updates).returning();
      return newSetting;
    }
  }

  async getAppRoles(): Promise<AppRole[]> {
    return await db.select().from(appRoles);
  }

  async toggleAdmin(userId: string): Promise<boolean> {
    const [role] = await db.select().from(appRoles).where(eq(appRoles.user_id, userId));
    
    if (role) {
      const [updated] = await db
        .update(appRoles)
        .set({ is_admin: !role.is_admin })
        .where(eq(appRoles.id, role.id))
        .returning();
      return updated.is_admin;
    } else {
      const [newRole] = await db
        .insert(appRoles)
        .values({ user_id: userId, is_admin: true })
        .returning();
      return newRole.is_admin;
    }
  }

  async isAdmin(userId: string): Promise<boolean> {
    const [role] = await db.select().from(appRoles).where(eq(appRoles.user_id, userId));
    return role?.is_admin ?? false;
  }

  async getAllUsers(): Promise<any[]> {
    // Join users with roles (left join manually)
    const allUsers = await db.select().from(users);
    const roles = await this.getAppRoles();
    const roleMap = new Map(roles.map(r => [r.user_id, r.is_admin]));

    return allUsers.map(u => ({
      ...u,
      isAdmin: roleMap.get(u.id) ?? false
    }));
  }
}

export const storage = new DatabaseStorage();
