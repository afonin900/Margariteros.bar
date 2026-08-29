import { defineMiddleware } from "astro:middleware";
import { officialRedirect } from "./lib/choiceqr/redirect";

const action = /^\/(?:(?:pl|en|ru|es)\/)?(auth(?:\/[^/]+)?|booking(?:\/[^/]+)?|order(?:\/[^/]+)?|delivery-areas|feedback|search|menu|takeaway|delivery|cookie-policy|terms-of-use|privacy-policy|allergens|section:[^/]+)\/?$/;

export const onRequest = defineMiddleware(async (context, next) => {
  const destination = context.url.pathname.match(action)?.[1];
  return destination ? officialRedirect(`/${destination}`, context.url) : next();
});
