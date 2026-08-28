import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { sql } from "drizzle-orm";

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
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  checks.api = { ok: true, status: "ready" };
  // Syrve is an explicit non-ready integration until a separately authorized
  // OpenAPI/runtime contract exists. It must be visible without making the
  // RefRef API itself look down.
  checks.syrveAdapter = { ok: false, status: "not_ready" };
  const allOk = checks.api.ok && Boolean(checks.database?.ok);

  return reply.status(allOk ? 200 : 503).send({
    ok: allOk,
    service: "refref-api",
    checks,
  });
}
