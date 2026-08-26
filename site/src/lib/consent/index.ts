export const CONSENT_COOKIE_NAME = "margariteros_consent_v1";
export const CONSENT_POLICY_VERSION = 1;

export interface ConsentState {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
  policyVersion: number;
}

export type ConsentChoice = "accept" | "reject" | Pick<ConsentState, "analytics" | "marketing">;

export interface ConsentPersistence {
  readCookie(name: string): string | undefined;
  writeCookie(value: string): void;
  now(): Date;
}

export interface ConsentStore {
  readConsent(): ConsentState;
  saveConsent(choice: ConsentChoice): ConsentState;
  subscribeConsent(listener: (consent: ConsentState) => void): () => void;
}

const defaultConsent: ConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
  updatedAt: new Date(0).toISOString(),
  policyVersion: CONSENT_POLICY_VERSION,
};

function parseConsent(value: string | undefined): ConsentState {
  if (!value) return { ...defaultConsent };

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<ConsentState>;
    if (
      parsed.essential === true &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.marketing === "boolean" &&
      typeof parsed.updatedAt === "string" &&
      parsed.policyVersion === CONSENT_POLICY_VERSION
    ) {
      return parsed as ConsentState;
    }
  } catch {
    // A malformed cookie must never turn denied consent into granted consent.
  }

  return { ...defaultConsent };
}

function toConsentState(choice: ConsentChoice, now: Date): ConsentState {
  const accepted = choice === "accept";
  const rejected = choice === "reject";
  return {
    essential: true,
    analytics: accepted ? true : rejected ? false : choice.analytics,
    marketing: accepted ? true : rejected ? false : choice.marketing,
    updatedAt: now.toISOString(),
    policyVersion: CONSENT_POLICY_VERSION,
  };
}

export function createConsentStore(persistence: ConsentPersistence): ConsentStore {
  const listeners = new Set<(consent: ConsentState) => void>();

  return {
    readConsent: () => parseConsent(persistence.readCookie(CONSENT_COOKIE_NAME)),
    saveConsent(choice) {
      const consent = toConsentState(choice, persistence.now());
      persistence.writeCookie(
        `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; Path=/; Domain=.margariteros.bar; Max-Age=31536000; SameSite=Lax; Secure`,
      );
      for (const listener of listeners) listener(consent);
      return consent;
    },
    subscribeConsent(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function browserPersistence(): ConsentPersistence {
  return {
    readCookie(name) {
      if (typeof document === "undefined") return undefined;
      const prefix = `${name}=`;
      return document.cookie.split("; ").find((part) => part.startsWith(prefix))?.slice(prefix.length);
    },
    writeCookie(value) {
      if (typeof document !== "undefined") document.cookie = value;
    },
    now: () => new Date(),
  };
}

const browserStore = createConsentStore(browserPersistence());

export const readConsent = browserStore.readConsent;
export const saveConsent = browserStore.saveConsent;
export const subscribeConsent = browserStore.subscribeConsent;

export function hasSavedConsent(): boolean {
  return browserPersistence().readCookie(CONSENT_COOKIE_NAME) !== undefined;
}
