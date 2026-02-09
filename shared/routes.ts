import { z } from 'zod';
import { insertAssetSchema, insertSettingsSchema, assets, changeLogs, settings, appRoles } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  assets: {
    list: {
      method: 'GET' as const,
      path: '/api/assets' as const,
      input: z.object({
        search: z.string().optional(),
        sort: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof assets.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/assets/:id' as const,
      responses: {
        200: z.custom<typeof assets.$inferSelect & { changes: typeof changeLogs.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/assets' as const,
      input: insertAssetSchema,
      responses: {
        201: z.custom<typeof assets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/assets/:id' as const,
      input: insertAssetSchema.partial(),
      responses: {
        200: z.custom<typeof assets.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/assets/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    import: {
      method: 'POST' as const,
      path: '/api/assets/import' as const,
      input: z.array(insertAssetSchema),
      responses: {
        201: z.object({ count: z.number() }),
        400: errorSchemas.validation,
      },
    }
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings' as const,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/settings' as const,
      input: insertSettingsSchema,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
  },
  admin: {
    users: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/users' as const,
        responses: {
          200: z.array(z.object({
            id: z.string(),
            username: z.string().optional(),
            email: z.string().nullable(),
            isAdmin: z.boolean(),
          })),
        },
      },
      toggleAdmin: {
        method: 'POST' as const,
        path: '/api/admin/users/:id/toggle-admin' as const,
        responses: {
          200: z.object({ isAdmin: z.boolean() }),
        },
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
