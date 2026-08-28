export type AdapterStatus = "ready" | "not_ready";

export type SyrveCustomer = {
  id: string;
  partner: boolean;
};

export type SyrveWallet = {
  currency: "PLN";
  amountMinor: number;
};

export type SyrveTransaction = {
  revision: string;
  amountMinor: number;
  idempotencyKey: string;
};

export type SyrveAdapter = {
  readonly status: AdapterStatus;
  findCustomer(customerId: string): Promise<SyrveCustomer | undefined>;
  ensurePartner(input: { candidateId: string; correlationId: string }): Promise<SyrveCustomer>;
  readWallet(customerId: string): Promise<SyrveWallet>;
  topupWallet(input: { customerId: string; amountMinor: number; idempotencyKey: string; correlationId: string }): Promise<SyrveTransaction>;
  readTransactions(customerId: string): Promise<readonly SyrveTransaction[]>;
};

const notReady = (): never => {
  throw new Error("syrve_adapter_not_ready");
};

export function createNotReadySyrveAdapter(): SyrveAdapter {
  return {
    status: "not_ready",
    findCustomer: async () => notReady(),
    ensurePartner: async () => notReady(),
    readWallet: async () => notReady(),
    topupWallet: async () => notReady(),
    readTransactions: async () => notReady(),
  };
}

export function createFakeSyrveAdapter(): SyrveAdapter {
  const customers = new Map<string, SyrveCustomer>();
  const wallets = new Map<string, number>();
  const transactions = new Map<string, SyrveTransaction[]>();

  return {
    status: "ready",
    async findCustomer(customerId) {
      return customers.get(customerId);
    },
    async ensurePartner({ candidateId }) {
      const id = `customer_${candidateId}`;
      const customer = { id, partner: true };
      customers.set(id, customer);
      wallets.set(id, wallets.get(id) ?? 0);
      return customer;
    },
    async readWallet(customerId) {
      return { currency: "PLN", amountMinor: wallets.get(customerId) ?? 0 };
    },
    async topupWallet({ customerId, amountMinor, idempotencyKey }) {
      if (amountMinor <= 0) throw new Error("positive_credit_required");
      const existing = (transactions.get(customerId) ?? []).find((item) => item.idempotencyKey === idempotencyKey);
      if (existing) return existing;
      const transaction = { revision: `tx_${transactions.size + 1}_${(transactions.get(customerId) ?? []).length + 1}`, amountMinor, idempotencyKey };
      transactions.set(customerId, [...(transactions.get(customerId) ?? []), transaction]);
      wallets.set(customerId, (wallets.get(customerId) ?? 0) + amountMinor);
      return transaction;
    },
    async readTransactions(customerId) {
      return transactions.get(customerId) ?? [];
    },
  };
}
