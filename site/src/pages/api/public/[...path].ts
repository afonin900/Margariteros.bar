import { safeApiQuery, safeReadOnlyApi, vendorCookieHeader } from "../../../lib/choiceqr/mirror";

const safeJson = (body: string, status: number) => new Response(body, { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "private, no-store" } });

export async function GET({ params, request }: { params: { path?: string }; request: Request }) {
  const pathname = `/api/public/${params.path ?? ""}`;
  if (!safeReadOnlyApi(pathname)) return safeJson('{"error":"not_found"}', 404);
  // ChoiceQR currently exposes this optional counter route as a client-side
  // non-critical endpoint, but its public root answers 404. Do not turn that
  // vendor inconsistency into a hydration failure or proxy a write fallback.
  if (pathname === "/api/public/favorites/query/counters" || pathname === "/api/public/analytics/cookies") {
    const body = pathname === "/api/public/favorites/query/counters" ? { counters: [] } : {};
    return safeJson(JSON.stringify(body), 200);
  }
  const source = new URL(request.url);
  const target = new URL(pathname, "https://qr.margariteros.bar");
  for (const [key, value] of safeApiQuery(pathname, source)) target.searchParams.set(key, value);
  const cookie = vendorCookieHeader(request.headers.get("cookie"));
  try {
    const upstream = await fetch(target, { headers: { accept: "application/json", ...(cookie ? { cookie } : {}) }, cache: "no-store" });
    if (!upstream.ok) return safeJson('{"error":"upstream_unavailable"}', 502);
    return new Response(upstream.body, { status: 200, headers: { "content-type": upstream.headers.get("content-type") ?? "application/json", "cache-control": "private, no-store" } });
  } catch { return safeJson('{"error":"upstream_unavailable"}', 502); }
}

export function POST({ params }: { params: { path?: string } }) {
  if (params.path !== "analytics/cookies") return safeJson('{"error":"method_not_allowed"}', 405);
  // Consent belongs to margariteros.bar. Never relay a vendor analytics write.
  return safeJson("{}", 200);
}
