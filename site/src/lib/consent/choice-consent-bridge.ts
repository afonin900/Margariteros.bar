import type { ConsentState } from "./index";
import { CONSENT_COOKIE_NAME } from "./index";

export interface ChoiceConsentBridgeResult {
  status: "synced" | "unavailable";
  sharedDomainCookie: boolean;
  value: "required" | "required-ga-gtag-fb";
}

export const CHOICE_CONSENT_COOKIE_NAME = "cookieSettings";

export function hasSharedDomainConsentCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((cookie) => cookie.startsWith(`${CONSENT_COOKIE_NAME}=`));
}

export function syncChoiceConsent(consent: ConsentState): ChoiceConsentBridgeResult {
  // ChoiceQR's current production contract grants all four Google signals when
  // either `ga` or `gtag` is present. Never map a partial local choice to that.
  const value = consent.analytics && consent.marketing ? "required-ga-gtag-fb" : "required";
  if (typeof document === "undefined") return { status: "unavailable", sharedDomainCookie: false, value };
  document.cookie = `${CHOICE_CONSENT_COOKIE_NAME}=${value}; Path=/; Domain=.margariteros.bar; Max-Age=31536000; SameSite=Lax; Secure`;
  return {
    status: "synced",
    sharedDomainCookie: consent.policyVersion === 1 && hasSharedDomainConsentCookie(),
    value,
  };
}
