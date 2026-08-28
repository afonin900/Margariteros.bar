import { schema } from "@refref/coredb";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";
import type { TelegramReplayStore } from "@/lib/club/telegram-validation";

/**
 * PostgreSQL is the canonical replay guard. INSERT ... ON CONFLICT with an
 * expiry predicate gives every concurrent webapp instance the same one-winner
 * decision; no process-local fallback is allowed.
 */
export function createPostgresTelegramReplayStore(): TelegramReplayStore {
  return {
    async consume(replayKey, ttlSeconds) {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1_000);
      const [claimed] = await db
        .insert(schema.telegramReplayClaim)
        .values({ replayKey, expiresAt })
        .onConflictDoUpdate({
          target: schema.telegramReplayClaim.replayKey,
          set: { expiresAt, updatedAt: new Date() },
          // A still-live key produces no RETURNING row, so it is a replay.
          where: sql`${schema.telegramReplayClaim.expiresAt} < now()`,
        })
        .returning({ replayKey: schema.telegramReplayClaim.replayKey });
      return Boolean(claimed);
    },
  };
}
