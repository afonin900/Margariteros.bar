CREATE TABLE "syrve_integration_delivery" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"product_id" text NOT NULL,
	"event_id" text NOT NULL,
	"participant_id" text,
	"referral_id" text,
	"idempotency_key" text NOT NULL,
	"external_check_id" text NOT NULL,
	"syrve_customer_id" text NOT NULL,
	"syrve_order_id" text,
	"syrve_transaction_id" text,
	"status" text NOT NULL,
	"correlation_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "syrve_integration_delivery" ADD CONSTRAINT "syrve_delivery_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "syrve_integration_delivery" ADD CONSTRAINT "syrve_delivery_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "syrve_integration_delivery" ADD CONSTRAINT "syrve_delivery_participant_id_participant_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participant"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "syrve_integration_delivery" ADD CONSTRAINT "syrve_delivery_referral_id_referral_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referral"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "syrve_delivery_idempotency_key_unique_idx" ON "syrve_integration_delivery" USING btree ("idempotency_key");
--> statement-breakpoint
CREATE INDEX "syrve_delivery_event_id_idx" ON "syrve_integration_delivery" USING btree ("event_id");
--> statement-breakpoint
CREATE INDEX "syrve_delivery_status_idx" ON "syrve_integration_delivery" USING btree ("status");
