import { defineMiddleware } from "astro:middleware";
import { fetchMirroredHome, mirrorHeaders, officialRedirect } from "./lib/choiceqr/mirror";

const home = /^\/(pl|en|ru|es)\/?$/;
const action = /^\/(?:(?:pl|en|ru|es)\/)?(auth(?:\/[^/]+)?|booking(?:\/[^/]+)?|order(?:\/[^/]+)?|delivery-areas|feedback|search|menu|takeaway|delivery|cookie-policy|terms-of-use|privacy-policy|allergens|section:[^/]+)\/?$/;

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname.startsWith("/api/public/") && context.request.method !== "GET") {
    const inertConsent = context.url.pathname === "/api/public/analytics/cookies";
    return new Response(inertConsent ? "{}" : '{"error":"method_not_allowed"}', {
      status: inertConsent ? 200 : 405,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "private, no-store" },
    });
  }
  const match = context.url.pathname.match(home);
  if (!match) {
    const destination = context.url.pathname.match(action)?.[1];
    return destination ? officialRedirect(`/${destination}`, context.url) : next();
  }
  const html = await fetchMirroredHome(match[1], context.request);
  if (!html) return next();
  return new Response(html, { status: 200, headers: { ...mirrorHeaders, vary: "User-Agent, Sec-CH-UA-Mobile, Sec-CH-UA-Platform" } });
});
