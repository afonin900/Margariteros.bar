import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { sql } from "drizzle-orm";
import { readSyrveRuntimeConfig } from "../services/syrve-native.js";

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/", healthHandler);
  fastify.get("/health", healthHandler);
}

async function healthHandler(request: FastifyRequest, reply: FastifyReply) {
  const checks: Record<
    string,
    { ok: boolean; status: "ready" | "not_ready"; error?: string }
  > = {
    api: { ok: true, status: "ready" },
  };

  // Check database connection
  try {
    await request.db.execute(sql`SELECT 1`);
    checks.database = { ok: true, status: "ready" };
  } catch (error) {
    checks.database = {
      ok: false,
      status: "not_ready",
      // Health is public in staging; never return driver/connection details.
      error: "database_unavailable",
    };
  }

  checks.api = { ok: true, status: "ready" };
  // Syrve is an explicit non-ready integration until a separately authorized
  // OpenAPI/runtime contract exists. It must be visible without making the
  // RefRef API itself look down.
  checks.syrveAdapter = readSyrveRuntimeConfig()
    ? { ok: true, status: "ready" }
    : { ok: false, status: "not_ready", error: "missing_syrve_configuration" };
  const allOk = checks.api.ok && Boolean(checks.database?.ok);

  return reply.status(allOk ? 200 : 503).send({
    ok: allOk,
    service: "refref-api",
    checks,
  });
}
