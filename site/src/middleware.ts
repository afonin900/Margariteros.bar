import { middleware as i18nMiddleware } from "astro:i18n";
import { defineMiddleware, sequence } from "astro:middleware";
import { officialRedirect } from "./lib/choiceqr/redirect";

const action = /^\/(?:(?:pl|en|ru|es)\/)?(auth(?:\/[^/]+)?|booking(?:\/[^/]+)?|order(?:\/[^/]+)?|delivery-areas|feedback|search|menu|takeaway|delivery|cookie-policy|terms-of-use|privacy-policy|allergens|section:[^/]+)\/?$/;

const routePublicPagesByLocale = i18nMiddleware({
  prefixDefaultLocale: true,
  redirectToDefaultLocale: false,
  fallbackType: "redirect",
});

const preserveEmdashRoutes = defineMiddleware((context, next) => {
  if (context.url.pathname === "/_emdash" || context.url.pathname.startsWith("/_emdash/")) {
    return next();
  }
  return routePublicPagesByLocale(context, next);
});

const redirectChoiceQrActions = defineMiddleware(async (context, next) => {
  const destination = context.url.pathname.match(action)?.[1];
  return destination ? officialRedirect(`/${destination}`, context.url) : next();
});

export const onRequest = sequence(preserveEmdashRoutes, redirectChoiceQrActions);
