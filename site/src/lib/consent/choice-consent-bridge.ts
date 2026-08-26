import type { ConsentState } from "./index";
import { CONSENT_COOKIE_NAME } from "./index";

export interface ChoiceConsentBridgeResult {
  status: "unsupported";
  sharedDomainCookie: boolean;
}

export function hasSharedDomainConsentCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((cookie) => cookie.startsWith(`${CONSENT_COOKIE_NAME}=`));
}

export function syncChoiceConsent(consent: ConsentState): ChoiceConsentBridgeResult {
  return {
    status: "unsupported",
    sharedDomainCookie: consent.policyVersion === 1 && hasSharedDomainConsentCookie(),
  };
}
