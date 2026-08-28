/**
 * Margariteros' Syrve boundary.
 *
 * RefRef still owns participant, referral, event and reward records. This
 * adapter deliberately owns only delivery and reconciliation metadata for a
 * native Syrve Loyalty outcome. It never calculates a discount/reward or
 * writes a wallet balance.
 */

export const SYRVE_OFFICIAL_CONTRACT = {
  accessToken: "/api/1/access_token",
  program: "/api/1/loyalty/syrve/program",
  customerCreateOrUpdate: "/api/1/loyalty/syrve/customer/create_or_update",
  customerInfo: "/api/1/loyalty/syrve/customer/info",
  customerCategoryAdd: "/api/1/loyalty/syrve/customer_category/add",
  customerCardAdd: "/api/1/loyalty/syrve/customer/card/add",
  transactionsByDate:
    "/api/1/loyalty/syrve/customer/transactions/by_date",
  orderById: "/api/1/order/by_id",
} as const;

export interface SyrveRuntimeConfig {
  apiLogin: string;
  organizationId: string;
  loyaltyProgramId: string;
  baseUrl: string;
  timeoutMs: number;
}

export function readSyrveRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
): SyrveRuntimeConfig | undefined {
  const apiLogin = env.SYRVE_API_LOGIN?.trim();
  const organizationId = env.SYRVE_ORGANIZATION_ID?.trim();
  const loyaltyProgramId = env.SYRVE_LOYALTY_PROGRAM_ID?.trim();
  if (!apiLogin || !organizationId || !loyaltyProgramId) return undefined;

  const timeoutCandidate = Number(env.SYRVE_HTTP_TIMEOUT_MS ?? "8000");
  const timeoutMs = Number.isFinite(timeoutCandidate) && timeoutCandidate > 0
    ? Math.min(timeoutCandidate, 30_000)
    : 8_000;
  return {
    apiLogin,
    organizationId,
    loyaltyProgramId,
    baseUrl: (env.SYRVE_API_BASE_URL?.trim() || "https://api-eu.syrve.live").replace(/\/$/, ""),
    timeoutMs,
  };
}

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
  posOrderId?: string;
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
  readTransactionForOrder(
    customerId: string,
    posOrderId: string,
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

export class SyrveGatewayError extends Error {
  constructor() {
    super("Syrve readback failed");
  }
}

type SyrveJson = Record<string, unknown>;

function firstObject(value: unknown): SyrveJson | undefined {
  if (Array.isArray(value)) return value.find((item): item is SyrveJson => Boolean(item && typeof item === "object"));
  return value && typeof value === "object" ? value as SyrveJson : undefined;
}

function stringField(value: SyrveJson | undefined, ...names: string[]): string | undefined {
  for (const name of names) {
    const candidate = value?.[name];
    if (typeof candidate === "string" && candidate) return candidate;
  }
  return undefined;
}

function booleanField(value: SyrveJson | undefined, ...names: string[]): boolean | undefined {
  for (const name of names) if (typeof value?.[name] === "boolean") return value[name] as boolean;
  return undefined;
}

function arrayFrom(value: SyrveJson | undefined, ...names: string[]): unknown[] {
  for (const name of names) if (Array.isArray(value?.[name])) return value[name] as unknown[];
  return [];
}

export function createSyrveHttpGateway(config: SyrveRuntimeConfig): SyrveLoyaltyGateway {
  let token: { value: string; expiresAt: number } | undefined;

  const request = async (path: string, body: SyrveJson, auth = true): Promise<unknown> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);
    try {
      let accessToken = token?.expiresAt && token.expiresAt > Date.now() ? token.value : undefined;
      if (auth && !accessToken) {
        const authResponse = await request(SYRVE_OFFICIAL_CONTRACT.accessToken, { apiLogin: config.apiLogin }, false) as SyrveJson;
        accessToken = stringField(authResponse, "token", "Token", "accessToken", "AccessToken");
        if (!accessToken) throw new SyrveGatewayError();
        token = { value: accessToken, expiresAt: Date.now() + 50 * 60_000 };
      }
      const response = await fetch(`${config.baseUrl}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!response.ok) throw new SyrveGatewayError();
      return await response.json() as unknown;
    } catch (error) {
      if (error instanceof SyrveGatewayError) throw error;
      if (error instanceof Error && error.name === "AbortError") throw new SyrveReadbackTimeout();
      throw new SyrveGatewayError();
    } finally {
      clearTimeout(timer);
    }
  };

  return {
    async readCustomer(customerId) {
      const result = firstObject(await request(SYRVE_OFFICIAL_CONTRACT.customerInfo, {
        organizationId: config.organizationId,
        id: customerId,
      }));
      const id = stringField(result, "id", "Id", "customerId", "customerID") ?? customerId;
      return { id };
    },
    async readProgram(programId) {
      const result = await request(SYRVE_OFFICIAL_CONTRACT.program, { organizationId: config.organizationId });
      const programs = arrayFrom(firstObject(result), "Programs", "programs");
      const match = firstObject(programs.find((item) => stringField(firstObject(item), "id", "Id") === programId));
      return {
        id: stringField(match, "id", "Id") ?? programId,
        active: booleanField(match, "active", "Active", "isActive") ?? false,
      };
    },
    async readOrder(externalCheckId) {
      const result = firstObject(await request(SYRVE_OFFICIAL_CONTRACT.orderById, {
        organizationIds: [config.organizationId],
        orderIds: [externalCheckId],
      }));
      const orderInfo = firstObject(arrayFrom(result, "orders", "Orders"));
      if (!orderInfo) throw new SyrveGatewayError();
      const order = firstObject(orderInfo.order ?? orderInfo.Order);
      const rawStatus = String(order?.status ?? order?.Status ?? "").toLowerCase();
      const processedPaymentsSum = Number(order?.processedPaymentsSum ?? order?.ProcessedPaymentsSum ?? 0);
      const orderSum = Number(order?.sum ?? order?.Sum ?? 0);
      return {
        id: stringField(orderInfo, "id", "Id") ?? externalCheckId,
        posOrderId: stringField(orderInfo, "posId", "PosId"),
        paymentStatus: (rawStatus.includes("closed") && processedPaymentsSum >= orderSum ? "paid" : "unpaid") as "paid" | "unpaid",
        status: (rawStatus.includes("deleted") ? "cancelled" : rawStatus.includes("closed") ? "closed" : "open") as "closed" | "open" | "cancelled",
      };
    },
    async readTransactionForOrder(customerId, posOrderId) {
      const now = new Date();
      const dateTo = now.toISOString().replace("T", " ").replace("Z", "");
      const dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60_000)
        .toISOString().replace("T", " ").replace("Z", "");
      const result = firstObject(await request(SYRVE_OFFICIAL_CONTRACT.transactionsByDate, {
        organizationId: config.organizationId,
        customerId,
        dateFrom,
        dateTo,
        pageNumber: 0,
        pageSize: 100,
      }));
      const transaction = firstObject(arrayFrom(result, "transactions", "Transactions").find(
        (item) => stringField(firstObject(item), "posOrderId", "PosOrderId") === posOrderId,
      ));
      if (!transaction) return undefined;
      const id = stringField(transaction, "id", "Id", "transactionId", "TransactionId");
      if (!id) return undefined;
      const status = String(transaction.status ?? transaction.Status ?? "pending").toLowerCase();
      return {
        id,
        orderId: stringField(transaction, "posOrderId", "PosOrderId") ?? "",
        status: (status.includes("reverse") ? "reversed" : status.includes("appl") ? "applied" : "pending") as "applied" | "pending" | "reversed",
      };
    },
  };
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

        const transaction = order.posOrderId
          ? await gateway.readTransactionForOrder(input.syrveCustomerId, order.posOrderId)
          : undefined;
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
          const transaction = order.posOrderId
            ? await gateway.readTransactionForOrder(input.syrveCustomerId, order.posOrderId)
            : undefined;
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
 * The factory is ready only when all required runtime configuration exists.
 */
export function createSyrveNativeAdapterFromEnvironment(
  store?: SyrveDeliveryStore,
): SyrveNativeAdapter {
  const config = readSyrveRuntimeConfig();
  if (!config) {
    if (!process.env.SYRVE_API_LOGIN) return createNotReadySyrveAdapter("missing_SYRVE_API_LOGIN");
    if (!process.env.SYRVE_ORGANIZATION_ID) return createNotReadySyrveAdapter("missing_SYRVE_ORGANIZATION_ID");
    return createNotReadySyrveAdapter("missing_SYRVE_LOYALTY_PROGRAM_ID");
  }
  return createSyrveNativeAdapterFromGateway(createSyrveHttpGateway(config), store);
}

export function createSyrveNativeAdapterFromGateway(
  gateway: SyrveLoyaltyGateway,
  store?: SyrveDeliveryStore,
): SyrveNativeAdapter {
  // Production wiring supplies a durable store elsewhere; this fallback keeps
  // the environment factory safe until that store is configured.
  const memory = new Map<string, SyrveDelivery>();
  const effectiveStore = store ?? {
    async claim(delivery: SyrveDelivery) {
      const existing = memory.get(delivery.idempotencyKey);
      if (existing) return { claimed: false, delivery: existing };
      memory.set(delivery.idempotencyKey, delivery);
      return { claimed: true, delivery };
    },
    async save(delivery: SyrveDelivery) { memory.set(delivery.idempotencyKey, delivery); },
  };
  return createSyrveNativeAdapter(gateway, effectiveStore);
}
