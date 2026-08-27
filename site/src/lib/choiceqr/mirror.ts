const UPSTREAM = "https://qr.margariteros.bar";
const LOCALES = new Set(["pl", "en", "ru", "es"]);
const READ_ONLY_API = new Set([
  "/api/public/menu",
  "/api/public/booking/params",
  "/api/public/booking/blocks",
  "/api/public/favorites/query/counters",
  "/api/public/translate/get-available-languages",
  "/api/public/analytics/cookies",
]);
const API_QUERY: Record<string, readonly string[]> = {
  "/api/public/menu": ["lang", "section", "screen", "category", "page", "limit"],
  "/api/public/booking/params": ["lang"],
  "/api/public/booking/blocks": ["visitDuration", "lang", "date"],
  "/api/public/translate/get-available-languages": ["lang"],
};
const ATTRIBUTION = new Set(["gclid", "gbraid", "wbraid"]);

export const mirrorHeaders = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "private, no-store, max-age=0",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "content-security-policy": [
    "default-src 'self' https://cdn-clients.choiceqr.com https://cdn-media.choiceqr.com https://fonts.googleapis.com https://fonts.gstatic.com https://maps.google.com https://www.google.com",
    "script-src 'self' 'unsafe-inline' https://cdn-clients.choiceqr.com",
    "style-src 'self' 'unsafe-inline' https://cdn-clients.choiceqr.com https://fonts.googleapis.com",
    "img-src 'self' data: https://cdn-media.choiceqr.com https://maps.gstatic.com https://*.google.com",
    "font-src 'self' data: https://fonts.gstatic.com https://cdn-clients.choiceqr.com",
    "connect-src 'self' https://qr.margariteros.bar https://cdn-clients.choiceqr.com https://cdn-media.choiceqr.com",
    "frame-src https://www.google.com https://maps.google.com",
    "base-uri 'self'; form-action https://qr.margariteros.bar",
  ].join("; "),
} as const;

function safeQuery(source: URL): string {
  const kept = new URLSearchParams();
  for (const [key, value] of source.searchParams) {
    if (key.startsWith("utm_") || ATTRIBUTION.has(key) || ["lang", "screen", "section"].includes(key)) kept.set(key, value);
  }
  const query = kept.toString();
  return query ? `?${query}` : "";
}

export function upstreamHome(locale: string, requestUrl: URL): URL | null {
  if (!LOCALES.has(locale)) return null;
  return new URL(`/${locale}${safeQuery(requestUrl)}`, UPSTREAM);
}

export function safeReadOnlyApi(pathname: string): boolean {
  return READ_ONLY_API.has(pathname);
}

export function safeApiQuery(pathname: string, source: URL): URLSearchParams {
  const result = new URLSearchParams();
  for (const key of API_QUERY[pathname] ?? []) {
    const value = source.searchParams.get(key);
    if (value !== null) result.set(key, value);
  }
  return result;
}

export function vendorCookieHeader(cookie: string | null): string | undefined {
  if (!cookie) return undefined;
  const kept = cookie.split(";").map((entry) => entry.trim()).filter((entry) => /^(mguid|placeDbName|lang|language)=/i.test(entry));
  return kept.length ? kept.join("; ") : undefined;
}

export function deviceHeaders(headers: Headers): Record<string, string> {
  const forwarded: Record<string, string> = {};
  const userAgent = headers.get("user-agent");
  // UA/client hints drive ChoiceQR's SSR mobile template. They are not session
  // data, and are deliberately the only device headers forwarded upstream.
  if (userAgent && userAgent.length <= 512 && /^[\x20-\x7e]+$/.test(userAgent)) forwarded["user-agent"] = userAgent;
  const mobile = headers.get("sec-ch-ua-mobile");
  if (mobile === "?0" || mobile === "?1") forwarded["sec-ch-ua-mobile"] = mobile;
  const platform = headers.get("sec-ch-ua-platform");
  if (platform && /^"[A-Za-z .-]{1,32}"$/.test(platform)) forwarded["sec-ch-ua-platform"] = platform;
  return forwarded;
}

function scrubNextData(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(scrubNextData);
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  if ("analytics" in record && Object.keys(record).some((key) => ["seo", "og", "promo"].includes(key))) {
    return {
      ...Object.fromEntries(Object.entries(record).filter(([key]) => key !== "analytics").map(([key, child]) => [key, scrubNextData(child)])),
      // Keep the exact object shape expected by vendor chunks, but make every
      // tracking integration inert before React hydrates.
      analytics: { gtm: null, ga: null, fbPixel: null, fbDomainVerification: null, tiktokPixel: null, googleConsentModeAdvanced: false, measurement: false, fbCAPI: false },
    };
  }
  return Object.fromEntries(Object.entries(record)
    .filter(([key]) => !/^(gtm|googleAnalytics|facebookPixel|pixel)$/i.test(key))
    .map(([key, child]) => [key, scrubNextData(child)]));
}

export function transformHomeHtml(html: string, localOrigin: string, locale: string): string {
  const nextData = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/i;
  let output = html
    .replace(/<script[^>]+(?:googletagmanager\.com|gtag\/js|connect\.facebook\.net|cdn-cgi\/rum)[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<script\b[^>]*(?:static\.cloudflareinsights\.com\/beacon(?:\.min)?\.js|data-cf-beacon)[^>]*(?:>[\s\S]*?<\/script>|\/?>)/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?(?:googletagmanager|facebook)[\s\S]*?<\/noscript>/gi, "")
    .replace(/https:\/\/qr\.margariteros\.bar\/(?:booking|delivery-areas|feedback|search|section:[^"'\s<]*)/g, (url) => url.replace(UPSTREAM, ""));
  output = output.replace(nextData, (_match, json: string) => {
    try { return `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(scrubNextData(JSON.parse(json)))}</script>`; }
    catch { return '<script id="__NEXT_DATA__" type="application/json">{}</script>'; }
  });
  output = output
    .replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${localOrigin}/${locale}/">`)
    .replace(/<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${localOrigin}/${locale}/">`);
  const consent = `<div data-choiceqr-first-party-consent hidden aria-hidden="true"></div><script>window.__CHOICEQR_FIRST_PARTY_CONSENT__=true;</script>`;
  return output.replace(/<\/body>/i, `${consent}</body>`).replace(/<html(\s|>)/i, '<html data-choiceqr-mirror="home"$1');
}

export async function fetchMirroredHome(locale: string, request: Request): Promise<string | null> {
  if (process.env.CHOICEQR_MIRROR_DISABLE === "1") return null;
  const target = upstreamHome(locale, new URL(request.url));
  if (!target) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4_000);
  try {
    const cookie = vendorCookieHeader(request.headers.get("cookie"));
    const response = await fetch(target, { headers: { accept: "text/html", ...deviceHeaders(request.headers), ...(cookie ? { cookie } : {}) }, redirect: "follow", signal: controller.signal });
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return null;
    return transformHomeHtml(await response.text(), new URL(request.url).origin, locale);
  } catch { return null; }
  finally { clearTimeout(timer); }
}

export function officialRedirect(pathname: string, requestUrl: URL): Response {
  const url = new URL(pathname + safeQuery(requestUrl), UPSTREAM);
  return Response.redirect(url, 302);
}
