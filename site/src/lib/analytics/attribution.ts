export const attributionKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
] as const;

export type AttributionKey = (typeof attributionKeys)[number];
export type Attribution = Partial<Record<AttributionKey, string>>;

const PII_KEY = /(?:e-?mail|phone|tel(?:ephone)?|name|first|last|comment|message|address|user)/i;
const PII_VALUE = /(?:[^\s@]+@[^\s@]+\.[^\s@]+|\+?\d[\d\s().-]{6,}\d)/;

export function captureAttribution(value: URL | string): Attribution {
  const url = typeof value === "string" ? new URL(value) : value;
  const attribution: Attribution = {};

  for (const key of attributionKeys) {
    const parameter = url.searchParams.get(key);
    if (parameter && !PII_KEY.test(key) && !PII_VALUE.test(parameter)) attribution[key] = parameter;
  }

  return attribution;
}

export function decorateOutbound(value: URL | string, attribution: Attribution): string {
  const url = new URL(typeof value === "string" ? value : value.toString());
  for (const key of attributionKeys) {
    const parameter = attribution[key];
    if (parameter && !PII_VALUE.test(parameter)) url.searchParams.set(key, parameter);
  }
  return url.toString();
}
