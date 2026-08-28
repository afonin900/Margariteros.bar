import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import {
  createNotReadySyrveAdapter,
  createSyrveNativeAdapter,
  createSyrveNativeAdapterFromEnvironment,
  SyrveReadbackTimeout,
  type SyrveDelivery,
  type SyrveDeliveryStore,
  type SyrveLoyaltyGateway,
} from "../../src/services/syrve-native.js";
import { dispatchCreatedEvent } from "../../src/services/events.js";

type Fixture = {
  customer: { id: string };
  program: { id: string; active: boolean };
  order: {
    id: string;
    revision: string;
    paymentStatus: "paid" | "unpaid";
    status: "closed" | "open" | "cancelled";
  };
  transaction?: { id: string; orderId: string; status: "applied" };
};

async function fixture(name: string): Promise<Fixture> {
  const path = fileURLToPath(
    new URL(`../fixtures/syrve/${name}.json`, import.meta.url),
  );
  return JSON.parse(await readFile(path, "utf8")) as Fixture;
}

function memoryStore(): SyrveDeliveryStore {
  const records = new Map<string, SyrveDelivery>();
  return {
    claim: async (delivery) => {
      const existing = records.get(delivery.idempotencyKey);
      if (existing) return { claimed: false, delivery: existing };
      records.set(delivery.idempotencyKey, delivery);
      return { claimed: true, delivery };
    },
    save: async (delivery) => {
      records.set(delivery.idempotencyKey, delivery);
    },
  };
}

function gatewayFrom(data: Fixture): SyrveLoyaltyGateway {
  return {
    readCustomer: vi.fn().mockResolvedValue(data.customer),
    readProgram: vi.fn().mockResolvedValue(data.program),
    readOrder: vi.fn().mockResolvedValue(data.order),
    readTransactionByRevision: vi.fn().mockResolvedValue(data.transaction),
  };
}

const baseInput = {
  refrefEventId: "evt_redacted_001",
  productId: "product_redacted_001",
  participantId: "participant_redacted_001",
  referralId: "referral_redacted_001",
  externalCheckId: "check_redacted_001",
  syrveCustomerId: "cust_redacted_001",
  syrveProgramId: "program_redacted_001",
};

describe("Syrve native adapter", () => {
  it("routes explicit syrve_native events away from the upstream reward engine", async () => {
    const processUpstream = vi.fn();
    const processSyrveNative = vi.fn().mockResolvedValue(undefined);

    const result = await dispatchCreatedEvent(
      {} as never,
      {
        id: "evt_redacted_001",
        productId: "product_redacted_001",
        participantId: "participant_redacted_001",
        referralId: "referral_redacted_001",
        metadata: {
          schemaVersion: 1,
          customData: {
            syrveNative: {
              schemaVersion: 1,
              provider: "syrve_native",
              externalCheckId: "check_redacted_001",
              syrveCustomerId: "cust_redacted_001",
              syrveProgramId: "program_redacted_001",
            },
          },
        },
      },
      { processUpstream, processSyrveNative },
    );

    expect(result).toBe("syrve_native");
    expect(processSyrveNative).toHaveBeenCalledTimes(1);
    expect(processUpstream).not.toHaveBeenCalled();
  });

  it("keeps the upstream reward engine for ordinary RefRef events", async () => {
    const processUpstream = vi.fn().mockResolvedValue([]);
    const processSyrveNative = vi.fn();

    const result = await dispatchCreatedEvent(
      {} as never,
      {
        id: "evt_refref_001",
        productId: "product_redacted_001",
        participantId: null,
        referralId: null,
        metadata: { schemaVersion: 1, source: "api" },
      },
      { processUpstream, processSyrveNative },
    );

    expect(result).toBe("upstream");
    expect(processUpstream).toHaveBeenCalledWith({}, "evt_refref_001");
    expect(processSyrveNative).not.toHaveBeenCalled();
  });

  it("contains no wallet credit or custom reward calculation in the native path", async () => {
    const source = await readFile(
      fileURLToPath(new URL("../../src/services/syrve-native.ts", import.meta.url)),
      "utf8",
    );

    expect(source).not.toContain("wallet/topup");
    expect(source).not.toContain("calculateRewardAmount");
    expect(source).not.toContain("orderAmount");
  });

  it("reconciles a paid and closed order through a native transaction readback", async () => {
    const data = await fixture("paid-closed-native-transaction");
    const adapter = createSyrveNativeAdapter(gatewayFrom(data), memoryStore());

    const result = await adapter.process(baseInput);

    expect(result.status).toBe("reconciled");
    expect(result.syrveTransactionId).toBe(data.transaction?.id);
    expect(result.idempotencyKey).toBe(
      "syrve-check:check_redacted_001:partner-reward:v1",
    );
  });

  it("does not reconcile an unpaid order", async () => {
    const data = await fixture("unpaid-order");
    const gateway = gatewayFrom(data);
    const adapter = createSyrveNativeAdapter(gateway, memoryStore());

    const result = await adapter.process(baseInput);

    expect(result.status).toBe("awaiting_paid_close");
    expect(gateway.readTransactionByRevision).not.toHaveBeenCalled();
  });

  it("does not reconcile a cancelled order", async () => {
    const data = await fixture("cancelled-order");
    const gateway = gatewayFrom(data);
    const adapter = createSyrveNativeAdapter(gateway, memoryStore());

    const result = await adapter.process(baseInput);

    expect(result.status).toBe("cancelled");
    expect(gateway.readTransactionByRevision).not.toHaveBeenCalled();
  });

  it("returns the first delivery on duplicate input without another gateway call", async () => {
    const data = await fixture("paid-closed-native-transaction");
    const gateway = gatewayFrom(data);
    const adapter = createSyrveNativeAdapter(gateway, memoryStore());

    const first = await adapter.process(baseInput);
    const duplicate = await adapter.process(baseInput);

    expect(duplicate).toEqual(first);
    expect(gateway.readOrder).toHaveBeenCalledTimes(1);
    expect(gateway.readTransactionByRevision).toHaveBeenCalledTimes(1);
  });

  it("claims concurrent identical events before one gateway sequence", async () => {
    const data = await fixture("paid-closed-native-transaction");
    const gateway = gatewayFrom(data);
    const adapter = createSyrveNativeAdapter(gateway, memoryStore());

    const [first, second] = await Promise.all([
      adapter.process(baseInput),
      adapter.process(baseInput),
    ]);

    expect(second.idempotencyKey).toBe(first.idempotencyKey);
    expect(gateway.readOrder).toHaveBeenCalledTimes(1);
    expect(gateway.readTransactionByRevision).toHaveBeenCalledTimes(1);
  });

  it("performs readback after a timeout before allowing a retry", async () => {
    const data = await fixture("timeout-then-readback");
    const gateway = gatewayFrom(data);
    gateway.readTransactionByRevision = vi
      .fn()
      .mockRejectedValueOnce(new SyrveReadbackTimeout())
      .mockResolvedValueOnce(data.transaction);
    const adapter = createSyrveNativeAdapter(gateway, memoryStore());

    const result = await adapter.process(baseInput);

    expect(result.status).toBe("reconciled_after_timeout");
    expect(gateway.readOrder).toHaveBeenCalledTimes(2);
    expect(gateway.readTransactionByRevision).toHaveBeenCalledTimes(2);
  });

  it("does not accept a transaction after timeout when repeat order readback is unpaid", async () => {
    const data = await fixture("timeout-then-readback");
    const gateway = gatewayFrom(data);
    gateway.readTransactionByRevision = vi
      .fn()
      .mockRejectedValueOnce(new SyrveReadbackTimeout());
    gateway.readOrder = vi
      .fn()
      .mockResolvedValueOnce(data.order)
      .mockResolvedValueOnce({ ...data.order, paymentStatus: "unpaid" });
    const adapter = createSyrveNativeAdapter(gateway, memoryStore());

    const result = await adapter.process(baseInput);

    expect(result.status).toBe("awaiting_paid_close");
    expect(gateway.readTransactionByRevision).toHaveBeenCalledTimes(1);
  });

  it("is explicitly not-ready without a verified runtime contract", async () => {
    const result = await createNotReadySyrveAdapter().process(baseInput);

    expect(result.status).toBe("not_ready");
    expect(result.correlationId).toBe("missing_syrve_runtime_contract");
  });

  it("is explicitly not-ready when the Syrve credential env is absent", async () => {
    const previous = process.env.SYRVE_API_LOGIN;
    delete process.env.SYRVE_API_LOGIN;

    try {
      const result = await createSyrveNativeAdapterFromEnvironment().process(
        baseInput,
      );
      expect(result.status).toBe("not_ready");
      expect(result.correlationId).toBe("missing_SYRVE_API_LOGIN");
    } finally {
      if (previous === undefined) delete process.env.SYRVE_API_LOGIN;
      else process.env.SYRVE_API_LOGIN = previous as string;
    }
  });
});
