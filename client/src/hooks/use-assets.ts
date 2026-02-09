import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type errorSchemas } from "@shared/routes";
import { z } from "zod";
import type { InsertAsset, Asset } from "@shared/schema";

// Types derived from schema/routes
type AssetListResponse = z.infer<typeof api.assets.list.responses[200]>;
type AssetDetailResponse = z.infer<typeof api.assets.get.responses[200]>;

// === HOOKS ===

export function useAssets(search?: string, sort?: string) {
  return useQuery({
    queryKey: [api.assets.list.path, search, sort],
    queryFn: async () => {
      const url = new URL(api.assets.list.path, window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (sort) url.searchParams.set("sort", sort);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch assets");
      return api.assets.list.responses[200].parse(await res.json());
    },
  });
}

export function useAsset(id: number) {
  return useQuery({
    queryKey: [api.assets.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.assets.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch asset");
      return api.assets.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAsset) => {
      const res = await fetch(api.assets.create.path, {
        method: api.assets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create asset");
      return api.assets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assets.list.path] });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertAsset>) => {
      const url = buildUrl(api.assets.update.path, { id });
      const res = await fetch(url, {
        method: api.assets.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update asset");
      return api.assets.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.assets.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.assets.get.path, variables.id] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.assets.delete.path, { id });
      const res = await fetch(url, {
        method: api.assets.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete asset");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assets.list.path] });
    },
  });
}

export function useImportAssets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAsset[]) => {
      const res = await fetch(api.assets.import.path, {
        method: api.assets.import.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to import assets");
      return api.assets.import.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assets.list.path] });
    },
  });
}
