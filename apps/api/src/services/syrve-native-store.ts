import { schema, type DBType } from "@refref/coredb";
import { eq } from "drizzle-orm";
import type {
  SyrveDelivery,
  SyrveDeliveryStore,
} from "./syrve-native.js";

const { syrveIntegrationDelivery } = schema;

/** Durable, technical-only idempotency and reconciliation store. */
export function createSyrveDeliveryStore(db: DBType): SyrveDeliveryStore {
  return {
    async claim(delivery) {
      const [created] = await db
        .insert(syrveIntegrationDelivery)
        .values({
          productId: delivery.productId,
          eventId: delivery.refrefEventId,
          participantId: delivery.participantId,
          referralId: delivery.referralId,
          idempotencyKey: delivery.idempotencyKey,
          externalCheckId: delivery.externalCheckId,
          syrveCustomerId: delivery.syrveCustomerId,
          status: delivery.status,
          correlationId: delivery.correlationId,
        })
        .onConflictDoNothing()
        .returning();
      if (created) return { claimed: true, delivery };

      const existing = await findDelivery(db, delivery.idempotencyKey);
      if (!existing) throw new Error("Syrve delivery claim did not read back");
      return { claimed: false, delivery: existing };
    },
    async save(delivery) {
      await db
        .insert(syrveIntegrationDelivery)
        .values({
          productId: delivery.productId,
          eventId: delivery.refrefEventId,
          participantId: delivery.participantId,
          referralId: delivery.referralId,
          idempotencyKey: delivery.idempotencyKey,
          externalCheckId: delivery.externalCheckId,
          syrveCustomerId: delivery.syrveCustomerId,
          syrveOrderId: delivery.syrveOrderId ?? null,
          syrveTransactionId: delivery.syrveTransactionId ?? null,
          status: delivery.status,
          correlationId: delivery.correlationId,
        })
        .onConflictDoUpdate({
          target: syrveIntegrationDelivery.idempotencyKey,
          set: {
            status: delivery.status,
            syrveOrderId: delivery.syrveOrderId ?? null,
            syrveTransactionId: delivery.syrveTransactionId ?? null,
            correlationId: delivery.correlationId,
            updatedAt: new Date(),
          },
        });
    },
  };
}

async function findDelivery(
  db: DBType,
  idempotencyKey: string,
): Promise<SyrveDelivery | undefined> {
      const [row] = await db
        .select()
        .from(syrveIntegrationDelivery)
        .where(eq(syrveIntegrationDelivery.idempotencyKey, idempotencyKey))
        .limit(1);
  if (!row) return undefined;

  return {
    idempotencyKey: row.idempotencyKey,
    status: row.status as SyrveDelivery["status"],
    refrefEventId: row.eventId,
    productId: row.productId,
    participantId: row.participantId ?? "",
    referralId: row.referralId ?? "",
    externalCheckId: row.externalCheckId,
    syrveCustomerId: row.syrveCustomerId,
    syrveOrderId: row.syrveOrderId ?? undefined,
    syrveTransactionId: row.syrveTransactionId ?? undefined,
    correlationId: row.correlationId,
  };
}
