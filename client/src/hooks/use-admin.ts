import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useUsers() {
  return useQuery({
    queryKey: [api.admin.users.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.users.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.admin.users.list.responses[200].parse(await res.json());
    },
  });
}

export function useToggleAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.admin.users.toggleAdmin.path, { id });
      const res = await fetch(url, {
        method: api.admin.users.toggleAdmin.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to toggle admin status");
      return api.admin.users.toggleAdmin.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
    },
  });
}
