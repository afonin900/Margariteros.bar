import type { Attribution } from "../analytics/attribution";

const qrOrigin = "https://qr.margariteros.bar";
const forwarded = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "gbraid", "wbraid"] as const;

export function officialRedirect(path: string, source: URL): Response {
  const target = new URL(path, qrOrigin);
  for (const key of forwarded) {
    const value = source.searchParams.get(key);
    if (value) target.searchParams.set(key, value);
  }
  return Response.redirect(target, 302);
}

export function decorateChoiceQr(path: string, attribution: Attribution): string {
  const target = new URL(path, qrOrigin);
  for (const key of forwarded) {
    const value = attribution[key as keyof Attribution];
    if (typeof value === "string" && value) target.searchParams.set(key, value);
  }
  return target.toString();
}
