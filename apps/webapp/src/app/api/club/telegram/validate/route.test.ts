import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  TELEGRAM_VALIDATION_PATH,
  toTelegramLaunchResult,
} from "@/lib/club/telegram-contract";
import { POST, setTelegramReplayStore } from "./route";

const originalToken = process.env.TELEGRAM_CLUB_BOT_TOKEN;
const token = "test-token";
const now = Math.floor(Date.now() / 1000);

class AtomicReplayStore {
  private readonly keys = new Set<string>();

  async consume(key: string) {
    if (this.keys.has(key)) return false;
    this.keys.add(key);
    return true;
  }
}

function signedInitData(values: Record<string, string>) {
  const check = Object.entries(values)
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(token).digest();
  const hash = createHmac("sha256", secret).update(check).digest("hex");
  return new URLSearchParams({ ...values, hash }).toString();
}

async function validate(initData: string) {
  return POST(new Request(`http://localhost${TELEGRAM_VALIDATION_PATH}`, {
    method: "POST",
    body: JSON.stringify({ initData }),
  }));
}

afterEach(() => {
  setTelegramReplayStore(undefined);
  if (originalToken === undefined) delete process.env.TELEGRAM_CLUB_BOT_TOKEN;
  else process.env.TELEGRAM_CLUB_BOT_TOKEN = originalToken;
});

describe("R Club Telegram validation endpoint", () => {
  it("uses the canonical route and result shared with the Mini App UI", async () => {
    process.env.TELEGRAM_CLUB_BOT_TOKEN = token;
    setTelegramReplayStore(new AtomicReplayStore());
    const response = await validate(signedInitData({
      auth_date: String(now - 10), query_id: "valid-query",
      user: JSON.stringify({ id: 123, first_name: "Ignored" }),
    }));

    expect(TELEGRAM_VALIDATION_PATH).toBe("/api/club/telegram/validate");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "verified_pending_registration" });
    expect(toTelegramLaunchResult("verified_pending_registration")).toBe("verified_pending");
  });

  it("rejects tampered, expired and future initData", async () => {
    process.env.TELEGRAM_CLUB_BOT_TOKEN = token;
    setTelegramReplayStore(new AtomicReplayStore());
    const tampered = await validate(signedInitData({
      auth_date: String(now - 10), query_id: "tampered-query", user: JSON.stringify({ id: 123 }),
    }).replace("123", "456"));
    const stale = await validate(signedInitData({
      auth_date: String(now - 3601), query_id: "stale-query", user: JSON.stringify({ id: 123 }),
    }));
    const future = await validate(signedInitData({
      auth_date: String(now + 31), query_id: "future-query", user: JSON.stringify({ id: 123 }),
    }));

    expect(tampered.status).toBe(401);
    expect(stale.status).toBe(401);
    expect(future.status).toBe(401);
  });

  it("atomically rejects a duplicate signed launch after its first valid consume", async () => {
    process.env.TELEGRAM_CLUB_BOT_TOKEN = token;
    setTelegramReplayStore(new AtomicReplayStore());
    const initData = signedInitData({
      auth_date: String(now - 10), query_id: "replayed-query", user: JSON.stringify({ id: 123 }),
    });
    const [first, duplicate] = await Promise.all([validate(initData), validate(initData)]);

    expect([first.status, duplicate.status].sort()).toEqual([200, 409]);
    expect(await duplicate.json()).toEqual({ status: "replay_detected" });
  });

  it("fails closed until deployment injects a shared atomic replay store", async () => {
    process.env.TELEGRAM_CLUB_BOT_TOKEN = token;
    const response = await validate(signedInitData({
      auth_date: String(now - 10), query_id: "not-ready-query", user: JSON.stringify({ id: 123 }),
    }));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "not_ready" });
  });
});
