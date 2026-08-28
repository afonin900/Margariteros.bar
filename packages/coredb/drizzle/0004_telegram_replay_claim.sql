CREATE TABLE "telegram_replay_claim" (
	"replay_key" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "telegram_replay_claim_expires_at_idx" ON "telegram_replay_claim" USING btree ("expires_at");
