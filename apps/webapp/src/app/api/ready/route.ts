import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";

type Check = { ok: boolean; status: "ready" | "not_ready" };
type ApiReadiness = { api: Check; syrveAdapter: Check };

async function databaseCheck(): Promise<Check> {
  try {
    await db.execute(sql`SELECT 1`);
    return { ok: true, status: "ready" };
  } catch {
    return { ok: false, status: "not_ready" };
  }
}

async function apiCheck(): Promise<ApiReadiness> {
  const url = process.env.REFREF_API_URL;
  const notReady = { ok: false, status: "not_ready" as const };
  if (!url) return { api: notReady, syrveAdapter: notReady };
  try {
    const response = await fetch(new URL("/health", url), {
      signal: AbortSignal.timeout(1_500),
      cache: "no-store",
    });
    const payload = await response.json() as {
      checks?: { syrveAdapter?: Check };
    };
    return {
      api: { ok: response.ok, status: response.ok ? "ready" : "not_ready" },
      syrveAdapter: payload.checks?.syrveAdapter ?? notReady,
    };
  } catch {
    return { api: notReady, syrveAdapter: notReady };
  }
}

/** Readiness names all staging dependencies, including the intentional Syrve gap. */
export async function GET() {
  const [database, apiReadiness] = await Promise.all([
    databaseCheck(),
    apiCheck(),
  ]);
  const checks = {
    ui: { ok: true, status: "ready" as const },
    database,
    refrefApi: apiReadiness.api,
    syrveAdapter: apiReadiness.syrveAdapter,
  };
  const ok = checks.ui.ok && checks.database.ok && checks.refrefApi.ok;
  return NextResponse.json(
    { ok, service: "refref-webapp", checks },
    { status: ok ? 200 : 503 },
  );
}
