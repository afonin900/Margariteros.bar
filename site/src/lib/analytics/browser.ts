import { captureAttribution, decorateOutbound, type Attribution } from "./attribution";
import { createAnalyticsTracker } from "./index";
import { hasSavedConsent, readConsent, saveConsent, subscribeConsent, type ConsentState } from "../consent";
import { syncChoiceConsent } from "../consent/choice-consent-bridge";

type Locale = "pl" | "en" | "ru" | "es";

interface BrowserAnalyticsOptions {
  gtmContainerId?: string;
  serverTransportUrl?: string;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

function dataLayer(): Record<string, unknown>[] {
  window.dataLayer ??= [];
  return window.dataLayer;
}

export function publishConsentMode(state: ConsentState, mode: "default" | "update") {
  dataLayer().push({
    event: "consent",
    consent_mode: mode,
    analytics_storage: state.analytics ? "granted" : "denied",
    ad_storage: state.marketing ? "granted" : "denied",
    ad_user_data: state.marketing ? "granted" : "denied",
    ad_personalization: state.marketing ? "granted" : "denied",
  });
}

function loadGtmOnce(containerId: string | undefined) {
  if (!containerId || document.getElementById("margariteros-web-gtm")) return;
  const script = document.createElement("script");
  script.id = "margariteros-web-gtm";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
  document.head.append(script);
}

export function initializeAnalytics(options: BrowserAnalyticsOptions = {}) {
  const initialConsent = readConsent();
  publishConsentMode(initialConsent, "default");
  if (options.serverTransportUrl) dataLayer().push({ margariteros_server_transport_url: options.serverTransportUrl });
  loadGtmOnce(options.gtmContainerId);

  const tracker = createAnalyticsTracker({
    getConsent: readConsent,
    createEventId: () => crypto.randomUUID(),
    send: (event) => dataLayer().push({ ...event }),
  });

  subscribeConsent((consent) => publishConsentMode(consent, "update"));
  return tracker;
}

export function decorateTrackedLinks(attribution: Attribution) {
  document.querySelectorAll<HTMLAnchorElement>("a[data-analytics-event]").forEach((link) => {
    if (link.href.startsWith("http")) link.href = decorateOutbound(link.href, attribution);
  });
}

export function mountConsentBanner(root: HTMLElement, locale: Locale, options: BrowserAnalyticsOptions = {}) {
  const tracker = initializeAnalytics(options);
  const attribution = captureAttribution(window.location.href);
  decorateTrackedLinks(attribution);
  const panel = root.querySelector<HTMLElement>("[data-consent-panel]");
  const openButton = root.querySelector<HTMLButtonElement>("[data-consent-open]");
  const saved = hasSavedConsent();

  function setPanel(open: boolean) {
    if (!panel) return;
    panel.hidden = !open;
    openButton?.setAttribute("aria-expanded", String(open));
  }

  // The ChoiceQR comparison baseline is a previously-consented visitor. Keep
  // our first-party control out of that document's layout and visual surface.
  // A new visitor receives a fixed (not flow-affecting) consent overlay.
  root.hidden = saved;
  setPanel(!saved);
  openButton?.addEventListener("click", () => setPanel(true));
  root.querySelectorAll<HTMLButtonElement>("[data-consent-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.consentChoice === "accept" ? "accept" : "reject";
      const consent = saveConsent(choice);
      syncChoiceConsent(consent);
      if (consent.analytics) tracker.track({ name: "consent_updated", locale });
      setPanel(false);
      root.hidden = true;
    });
  });

  document.querySelectorAll<HTMLAnchorElement>("a[data-analytics-event]").forEach((link) => {
    link.addEventListener("click", () => {
      const name = link.dataset.analyticsEvent;
      if (name === "view_menu" || name === "reservation_click" || name === "contact_click") {
        tracker.track({ name, locale, destination: link.dataset.analyticsDestination as "menu" | "booking" | "phone" | "map" | "instagram" | "tiktok" | "facebook" | undefined, attribution });
      }
    });
  });
}
