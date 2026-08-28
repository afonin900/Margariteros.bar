/**
 * Margariteros' Syrve boundary.
 *
 * RefRef still owns participant, referral, event and reward records. This
 * adapter deliberately owns only delivery and reconciliation metadata for a
 * native Syrve Loyalty outcome. It never calculates a discount/reward or
 * writes a wallet balance.
 */

export const SYRVE_OFFICIAL_CONTRACT = {
  customerCreateOrUpdate: "/api/1/loyalty/syrve/customer/create_or_update",
  customerInfo: "/api/1/loyalty/syrve/customer/info",
  customerCategoryAdd: "/api/1/loyalty/syrve/customer_category/add",
  customerCardAdd: "/api/1/loyalty/syrve/customer/card/add",
  transactionsByRevision: "/api/1/loyalty/syrve/transactions/by_revision",
} as const;

export type SyrveDeliveryStatus =
  | "processing"
  | "not_ready"
  | "awaiting_paid_close"
  | "cancelled"
  | "awaiting_native_outcome"
  | "reconciled"
  | "reconciled_after_timeout"
  | "retryable";

export interface SyrveConversionInput {
  refrefEventId: string;
  productId: string;
  participantId: string;
  referralId: string;
  externalCheckId: string;
  syrveCustomerId: string;
  syrveProgramId: string;
}

export interface SyrveDelivery {
  idempotencyKey: string;
  status: SyrveDeliveryStatus;
  refrefEventId: string;
  productId: string;
  participantId: string;
  referralId: string;
  externalCheckId: string;
  syrveCustomerId: string;
  syrveOrderId?: string;
  syrveTransactionId?: string;
  correlationId: string;
}

export interface SyrveDeliveryStore {
  claim(delivery: SyrveDelivery): Promise<{
    claimed: boolean;
    delivery: SyrveDelivery;
  }>;
  save(delivery: SyrveDelivery): Promise<void>;
}

export interface SyrveOrderReadback {
  id: string;
  revision: string;
  paymentStatus: "paid" | "unpaid";
  status: "closed" | "open" | "cancelled";
}

export interface SyrveNativeTransactionReadback {
  id: string;
  orderId: string;
  status: "applied" | "pending" | "reversed";
}

/**
 * This is intentionally readback-only. The recorded Syrve evidence does not
 * prove a post-close write endpoint for a native reward program, so exposing
 * one here would invite an unsafe manual wallet-credit fallback.
 */
export interface SyrveLoyaltyGateway {
  readCustomer(customerId: string): Promise<{ id: string }>;
  readProgram(programId: string): Promise<{ id: string; active: boolean }>;
  readOrder(externalCheckId: string): Promise<SyrveOrderReadback>;
  readTransactionByRevision(
    revision: string,
  ): Promise<SyrveNativeTransactionReadback | undefined>;
}

export interface SyrveNativeAdapter {
  process(input: SyrveConversionInput): Promise<SyrveDelivery>;
}

export class SyrveReadbackTimeout extends Error {
  constructor() {
    super("Syrve readback timed out");
  }
}

export function syrveIdempotencyKey(externalCheckId: string): string {
  return `syrve-check:${externalCheckId}:partner-reward:v1`;
}

export function createNotReadySyrveAdapter(
  reason = "missing_syrve_runtime_contract",
): SyrveNativeAdapter {
  return {
    async process(input) {
      return {
        idempotencyKey: syrveIdempotencyKey(input.externalCheckId),
        status: "not_ready",
        refrefEventId: input.refrefEventId,
        productId: input.productId,
        participantId: input.participantId,
        referralId: input.referralId,
        externalCheckId: input.externalCheckId,
        syrveCustomerId: input.syrveCustomerId,
        correlationId: reason,
      };
    },
  };
}

export function createSyrveNativeAdapter(
  gateway: SyrveLoyaltyGateway,
  store: SyrveDeliveryStore,
): SyrveNativeAdapter {
  return {
    async process(input) {
      const idempotencyKey = syrveIdempotencyKey(input.externalCheckId);
      const base: SyrveDelivery = {
        idempotencyKey,
        status: "processing",
        refrefEventId: input.refrefEventId,
        productId: input.productId,
        participantId: input.participantId,
        referralId: input.referralId,
        externalCheckId: input.externalCheckId,
        syrveCustomerId: input.syrveCustomerId,
        correlationId: input.refrefEventId,
      };
      const claim = await store.claim(base);
      if (!claim.claimed) return claim.delivery;

      try {
        await gateway.readCustomer(input.syrveCustomerId);
        const program = await gateway.readProgram(input.syrveProgramId);
        if (!program.active) {
          const delivery = { ...base, status: "not_ready" as const };
          await store.save(delivery);
          return delivery;
        }

        const order = await gateway.readOrder(input.externalCheckId);
        if (order.status === "cancelled") {
          const delivery = {
            ...base,
            status: "cancelled" as const,
            syrveOrderId: order.id,
          };
          await store.save(delivery);
          return delivery;
        }

        if (order.status !== "closed" || order.paymentStatus !== "paid") {
          const delivery = {
            ...base,
            status: "awaiting_paid_close" as const,
            syrveOrderId: order.id,
          };
          await store.save(delivery);
          return delivery;
        }

        const transaction = await gateway.readTransactionByRevision(order.revision);
        const delivery: SyrveDelivery = transaction
          ? {
              ...base,
              status: "reconciled",
              syrveOrderId: order.id,
              syrveTransactionId: transaction.id,
            }
          : {
              ...base,
              status: "awaiting_native_outcome",
              syrveOrderId: order.id,
            };
        await store.save(delivery);
        return delivery;
      } catch (error) {
        if (!(error instanceof SyrveReadbackTimeout)) {
          await store.save(base);
          return base;
        }

        // A timeout may have happened after Syrve committed a native outcome.
        // Reconcile before any caller can retry; this adapter has no write path.
        try {
          const order = await gateway.readOrder(input.externalCheckId);
          if (order.status === "cancelled") {
            const delivery: SyrveDelivery = {
              ...base,
              status: "cancelled",
              syrveOrderId: order.id,
            };
            await store.save(delivery);
            return delivery;
          }
          if (order.status !== "closed" || order.paymentStatus !== "paid") {
            const delivery: SyrveDelivery = {
              ...base,
              status: "awaiting_paid_close",
              syrveOrderId: order.id,
            };
            await store.save(delivery);
            return delivery;
          }
          const transaction = await gateway.readTransactionByRevision(order.revision);
          if (transaction) {
            const delivery: SyrveDelivery = {
              ...base,
              status: "reconciled_after_timeout",
              syrveOrderId: order.id,
              syrveTransactionId: transaction.id,
            };
            await store.save(delivery);
            return delivery;
          }
        } catch {
          // Keep the status retryable. No sensitive external response is logged.
        }

        await store.save(base);
        return base;
      }
    },
  };
}

/**
 * Credentials alone do not prove the missing order/program contract. Until a
 * verified HTTP gateway is supplied from the authorized OpenAPI/runtime, the
 * production factory stays explicitly not-ready and makes no network call.
 */
export function createSyrveNativeAdapterFromEnvironment(): SyrveNativeAdapter {
  if (!process.env.SYRVE_API_LOGIN) {
    return createNotReadySyrveAdapter("missing_SYRVE_API_LOGIN");
  }
  if (!process.env.SYRVE_LOYALTY_PROGRAM_ID) {
    return createNotReadySyrveAdapter("missing_SYRVE_LOYALTY_PROGRAM_ID");
  }
  return createNotReadySyrveAdapter("official_program_order_contract_unproven");
}
