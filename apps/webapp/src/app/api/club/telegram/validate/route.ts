import { NextResponse } from "next/server";
import type { TelegramValidationResponse } from "@/lib/club/telegram-contract";
import {
  type TelegramReplayStore,
  validateTelegramInitData,
} from "@/lib/club/telegram-validation";

let replayStore: TelegramReplayStore | undefined;

/** The deployment must inject a shared atomic store; in-memory replay guards are unsafe. */
export function setTelegramReplayStore(store: TelegramReplayStore | undefined) {
  replayStore = store;
}

function response(status: TelegramValidationResponse["status"], code: number) {
  return NextResponse.json<TelegramValidationResponse>({ status }, { status: code });
}

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_CLUB_BOT_TOKEN;
  if (!botToken) {
    return response("not_configured", 503);
  }
  if (!replayStore) {
    return response("not_ready", 503);
  }

  const payload = (await request.json().catch(() => null)) as
    | { initData?: unknown }
    | null;
  if (typeof payload?.initData !== "string" || payload.initData.length > 16_384) {
    return response("invalid_init_data", 400);
  }

  const validation = validateTelegramInitData(payload.initData, botToken);
  if (!validation.ok) {
    return response("invalid_init_data", 401);
  }
  if (!(await replayStore.consume(validation.replayKey, validation.replayTtlSeconds))) {
    return response("replay_detected", 409);
  }

  // The verified subject is intentionally not returned. Registration still needs
  // a configured RefRef product/program and a durable identity mapping.
  return response("verified_pending_registration", 200);
}
