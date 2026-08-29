import { definePlugin, type PluginDescriptor } from "emdash";

type ContentData = Record<string, unknown>;
type ContentItem = { id: string; slug: string; status: string; data: ContentData };
type PluginContext = {
  input?: unknown;
  request?: Request;
  content?: {
    get(collection: string, id: string): Promise<ContentItem | null>;
    list(collection: string, options?: { limit?: number; orderBy?: Record<string, "asc" | "desc"> }): Promise<{ items: ContentItem[] }>;
    update(collection: string, id: string, data: ContentData): Promise<ContentItem>;
  };
  media?: { get(id: string): Promise<{ id: string; url: string } | null> };
  http?: { fetch(url: string, init?: RequestInit): Promise<Response> };
};

type CalendarEntry = {
  id: string;
  title: string;
  start: string;
  color: string;
  url: string;
  kind: "event" | "publication";
};

const postizBaseUrl = "https://postiz.margariteros.bar/public/v1";

function fieldString(data: ContentData, key: string): string | undefined {
  const value = data[key];
  return typeof value === "string" ? value : undefined;
}

function fieldStrings(data: ContentData, key: string): string[] {
  const value = data[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function requireContent(ctx: PluginContext) {
  if (!ctx.content) throw new Error("Emdash content access is unavailable");
  return ctx.content;
}

function requireHttp(ctx: PluginContext) {
  if (!ctx.http) throw new Error("Postiz network access is unavailable");
  const key = process.env.POSTIZ_API_KEY;
  if (!key) throw new Error("Postiz is not configured");
  return { http: ctx.http, key };
}

async function requestInput(ctx: PluginContext): Promise<Record<string, unknown>> {
  if (ctx.input && typeof ctx.input === "object" && !Array.isArray(ctx.input)) return ctx.input as Record<string, unknown>;
  if (!ctx.request) return {};
  try {
    const value: unknown = await ctx.request.clone().json();
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function postizHeaders(key: string) {
  return { authorization: key, "content-type": "application/json" };
}

function safePostizError(response: Response): Promise<string> {
  return response.text().then(() => `Postiz returned ${response.status}`).catch(() => `Postiz returned ${response.status}`);
}

export function margariterosContentOpsPlugin(): PluginDescriptor {
  return {
    id: "margariteros-content-ops",
    version: "0.1.0",
    format: "native",
    entrypoint: "margariteros-content-ops",
    adminEntry: "margariteros-content-ops/admin",
    adminPages: [
      { path: "/calendar", label: "Kalendarz", icon: "calendar" },
      { path: "/publications", label: "Publikacje", icon: "send" },
    ],
  };
}

export function createPlugin() {
  return definePlugin({
    id: "margariteros-content-ops",
    version: "0.1.0",
    capabilities: ["content:write", "media:read", "network:request"],
    allowedHosts: ["postiz.margariteros.bar"],
    admin: {
      entry: "margariteros-content-ops/admin",
      pages: [
        { path: "/calendar", label: "Kalendarz", icon: "calendar" },
        { path: "/publications", label: "Publikacje", icon: "send" },
      ],
    },
    routes: {
      calendar: {
        handler: async (ctx) => {
          const content = requireContent(ctx as PluginContext);
          const [events, publications] = await Promise.all([
            content.list("events", { limit: 500, orderBy: { starts_at: "asc" } }),
            content.list("publications", { limit: 500, orderBy: { publish_at: "asc" } }),
          ]);
          const entries: CalendarEntry[] = [
            ...events.items.flatMap((item) => {
              const start = fieldString(item.data, "starts_at");
              if (!start) return [];
              return [{ id: `event:${item.id}`, title: fieldString(item.data, "title") ?? "Wydarzenie", start, color: item.status === "draft" ? "#707070" : "#C6FF00", url: `/_emdash/admin/content/events/${item.id}`, kind: "event" as const }];
            }),
            ...publications.items.flatMap((item) => {
              const start = fieldString(item.data, "publish_at");
              if (!start) return [];
              return [{ id: `publication:${item.id}`, title: fieldString(item.data, "title") ?? "Publikacja", start, color: item.status === "draft" ? "#707070" : "#FF5A2E", url: `/_emdash/admin/content/publications/${item.id}`, kind: "publication" as const }];
            }),
          ];
          return { entries };
        },
      },
      "postiz/integrations": {
        handler: async (ctx) => {
          const { http, key } = requireHttp(ctx as PluginContext);
          const response = await http.fetch(`${postizBaseUrl}/integrations`, { headers: postizHeaders(key) });
          if (!response.ok) throw new Error(await safePostizError(response));
          return response.json();
        },
      },
      "postiz/create-draft": {
        handler: async (ctx) => {
          const input = await requestInput(ctx as PluginContext);
          const publicationId = typeof input.publicationId === "string" ? input.publicationId : "";
          if (!publicationId) throw new Error("publicationId is required");
          const content = requireContent(ctx as PluginContext);
          const publication = await content.get("publications", publicationId);
          if (!publication) throw new Error("Publication not found");
          if (fieldString(publication.data, "workflow_state") !== "approved" || !fieldString(publication.data, "owner_approved_at") || !fieldString(publication.data, "publish_at") || fieldString(publication.data, "copy_cleanup_state") !== "passed") throw new Error("Publication is not ready for Postiz");
          if (fieldString(publication.data, "postiz_id")) throw new Error("Publication already has a Postiz draft");
          const assetIds = fieldStrings(publication.data, "assets");
          for (const assetId of assetIds) {
            const asset = await content.get("creative_assets", assetId);
            if (!asset || fieldString(asset.data, "cleanup_state") !== "passed") throw new Error("Every attached file must pass AI cleanup");
          }
          throw new Error("Postiz media upload is unavailable: Emdash media:read exposes URLs, not file bytes. Do not create a draft until a byte-stream adapter is added.");
        },
      },
      "postiz/schedule": {
        handler: async (ctx) => {
          const input = await requestInput(ctx as PluginContext);
          if (input.confirm !== true) throw new Error("Scheduling requires an explicit confirmation");
          const publicationId = typeof input.publicationId === "string" ? input.publicationId : "";
          const content = requireContent(ctx as PluginContext);
          const publication = await content.get("publications", publicationId);
          const postizId = publication && fieldString(publication.data, "postiz_id");
          if (!publication || !postizId) throw new Error("Postiz draft not found");
          const { http, key } = requireHttp(ctx as PluginContext);
          const response = await http.fetch(`${postizBaseUrl}/posts/${encodeURIComponent(postizId)}/status`, { method: "PUT", headers: postizHeaders(key), body: JSON.stringify({ status: "schedule" }) });
          if (!response.ok) throw new Error(await safePostizError(response));
          await content.update("publications", publication.id, { ...publication.data, workflow_state: "scheduled", postiz_state: "QUEUE", postiz_synced_at: new Date().toISOString() });
          return { ok: true };
        },
      },
      "postiz/return-to-editing": {
        handler: async (ctx) => {
          const input = await requestInput(ctx as PluginContext);
          const publicationId = typeof input.publicationId === "string" ? input.publicationId : "";
          const content = requireContent(ctx as PluginContext);
          const publication = await content.get("publications", publicationId);
          const postizId = publication && fieldString(publication.data, "postiz_id");
          if (!publication || !postizId) throw new Error("Postiz draft not found");
          const { http, key } = requireHttp(ctx as PluginContext);
          const draftResponse = await http.fetch(`${postizBaseUrl}/posts/${encodeURIComponent(postizId)}/status`, { method: "PUT", headers: postizHeaders(key), body: JSON.stringify({ status: "draft" }) });
          if (!draftResponse.ok) throw new Error(await safePostizError(draftResponse));
          const deleteResponse = await http.fetch(`${postizBaseUrl}/posts/${encodeURIComponent(postizId)}`, { method: "DELETE", headers: { authorization: key } });
          if (!deleteResponse.ok) throw new Error(await safePostizError(deleteResponse));
          await content.update("publications", publication.id, { ...publication.data, workflow_state: "approved", postiz_id: null, postiz_state: null, postiz_synced_at: new Date().toISOString() });
          return { ok: true };
        },
      },
    },
  });
}

export default createPlugin;
