import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export type TelegramReplayStore = {
  /** Atomically reserves a key until TTL expiry; false means it was already used. */
  consume(key: string, ttlSeconds: number): Promise<boolean>;
};

type InitDataResult =
  | { ok: true; subject: string; replayKey: string; replayTtlSeconds: number }
  | { ok: false; reason: "invalid_init_data" };

const MAX_AGE_SECONDS = 60 * 60;
const FUTURE_CLOCK_SKEW_SECONDS = 30;

export function validateTelegramInitData(
  rawInitData: string,
  botToken: string,
  now = Math.floor(Date.now() / 1000),
): InitDataResult {
  const params = new URLSearchParams(rawInitData);
  const receivedHash = params.get("hash");
  const authDate = Number(params.get("auth_date"));
  if (!receivedHash || !Number.isSafeInteger(authDate) || authDate <= 0) {
    return { ok: false, reason: "invalid_init_data" };
  }

  const dataCheckString = [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expectedHash = createHmac("sha256", secret)
    .update(dataCheckString)
    .digest("hex");
  const expected = Buffer.from(expectedHash, "utf8");
  const received = Buffer.from(receivedHash, "utf8");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return { ok: false, reason: "invalid_init_data" };
  }

  if (
    authDate > now + FUTURE_CLOCK_SKEW_SECONDS ||
    now - authDate > MAX_AGE_SECONDS
  ) {
    return { ok: false, reason: "invalid_init_data" };
  }

  try {
    const user = JSON.parse(params.get("user") ?? "") as { id?: unknown };
    if (typeof user.id !== "number" && typeof user.id !== "string") {
      return { ok: false, reason: "invalid_init_data" };
    }
    const queryId = params.get("query_id");
    const digest = createHash("sha256").update(rawInitData).digest("hex");
    return {
      ok: true,
      subject: String(user.id),
      replayKey: queryId ? `telegram-query:${queryId}` : `telegram-init:${digest}`,
      replayTtlSeconds: Math.max(1, authDate + MAX_AGE_SECONDS - now),
    };
  } catch {
    return { ok: false, reason: "invalid_init_data" };
  }
}
