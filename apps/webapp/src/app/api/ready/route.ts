import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";

type Check = { ok: boolean; status: "ready" | "not_ready" };

async function databaseCheck(): Promise<Check> {
  try {
    await db.execute(sql`SELECT 1`);
    return { ok: true, status: "ready" };
  } catch {
    return { ok: false, status: "not_ready" };
  }
}

async function apiCheck(): Promise<Check> {
  const url = process.env.REFREF_API_URL;
  if (!url) return { ok: false, status: "not_ready" };
  try {
    const response = await fetch(new URL("/health", url), {
      signal: AbortSignal.timeout(1_500),
      cache: "no-store",
    });
    return { ok: response.ok, status: response.ok ? "ready" : "not_ready" };
  } catch {
    return { ok: false, status: "not_ready" };
  }
}

/** Readiness names all staging dependencies, including the intentional Syrve gap. */
export async function GET() {
  const [database, refrefApi] = await Promise.all([
    databaseCheck(),
    apiCheck(),
  ]);
  const checks = {
    ui: { ok: true, status: "ready" as const },
    database,
    refrefApi,
    syrveAdapter: { ok: false, status: "not_ready" as const },
  };
  const ok = checks.ui.ok && checks.database.ok && checks.refrefApi.ok;
  return NextResponse.json(
    { ok, service: "refref-webapp", checks },
    { status: ok ? 200 : 503 },
  );
}
