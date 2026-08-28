import type { SyrveAdapter } from "./syrve-adapter";

export type CandidateStatus = "pending" | "active" | "rejected" | "suspended";
export type Candidate = { id: string; telegramUserId: string; phoneHash: string; status: CandidateStatus; referralCode: string; syrveCustomerId?: string; activatedAt?: string };
export type RewardLedgerEntry = { id: string; partnerId: string; externalCheckId: string; kind: "credit" | "reversal"; amountMinor: number; currency: "PLN"; idempotencyKey: string; status: "credited" | "awaiting_reversal_contract"; syrveTransactionRevision?: string; createdAt: string; reason?: string };
export type AuditEvent = { actorType: "system" | "admin"; action: string; subjectOpaqueId: string; correlationId: string; occurredAt: string };
export type ClubDomain = {
  registerCandidate(input: { telegramUserId: string; phoneHash: string; correlationId: string }): Promise<{ candidate: Candidate }>;
  activatePartner(input: { candidateId: string; correlationId: string }): Promise<{ status: "active" | "retryable"; candidate: Candidate }>;
  rejectCandidate(input: { candidateId: string; correlationId: string }): Candidate;
  suspendPartner(input: { candidateId: string; correlationId: string }): Candidate;
  qualifyCheck(input: { partnerId: string; externalCheckId: string; paymentStatus: "closed_paid" | "open" | "unpaid" | "cancelled"; correlationId: string }): Promise<{ status: "credited" | "duplicate" | "ineligible" | "retryable"; ledger?: RewardLedgerEntry }>;
  reverseReward(input: { ledgerId: string; reason: string; correlationId: string }): RewardLedgerEntry;
  listLedger(): readonly RewardLedgerEntry[];
  listAudit(): readonly AuditEvent[];
};

type Options = { syrve: SyrveAdapter; now?: () => Date; createOpaqueId?: () => string };

export function createClubDomain({ syrve, now = () => new Date(), createOpaqueId = defaultOpaqueId }: Options): ClubDomain {
  const candidatesById = new Map<string, Candidate>();
  const candidateIdByPhoneHash = new Map<string, string>();
  const ledgerByKey = new Map<string, RewardLedgerEntry>();
  const inFlightRewards = new Map<string, Promise<{ status: "credited" | "retryable"; ledger?: RewardLedgerEntry }>>();
  const ledger: RewardLedgerEntry[] = [];
  const audit: AuditEvent[] = [];
  const timestamp = () => now().toISOString();
  const appendAudit = (actorType: AuditEvent["actorType"], action: string, subjectOpaqueId: string, correlationId: string) => audit.push({ actorType, action, subjectOpaqueId, correlationId, occurredAt: timestamp() });
  const candidate = (candidateId: string) => {
    const value = candidatesById.get(candidateId);
    if (!value) throw new Error("candidate_not_found");
    return value;
  };

  return {
    async registerCandidate(input) {
      const existingId = candidateIdByPhoneHash.get(input.phoneHash);
      if (existingId) return { candidate: candidate(existingId) };
      const id = `partner_${createOpaqueId()}`;
      const created: Candidate = { id, telegramUserId: input.telegramUserId, phoneHash: input.phoneHash, status: "pending", referralCode: createOpaqueId() };
      candidatesById.set(id, created);
      candidateIdByPhoneHash.set(input.phoneHash, id);
      appendAudit("system", "candidate_registered", id, input.correlationId);
      return { candidate: created };
    },
    async activatePartner(input) {
      const value = candidate(input.candidateId);
      if (value.status === "active") return { status: "active", candidate: value };
      if (value.status !== "pending") throw new Error("candidate_not_activatable");
      try {
        const customer = await syrve.ensurePartner({ candidateId: value.id, correlationId: input.correlationId });
        const active = { ...value, status: "active" as const, syrveCustomerId: customer.id, activatedAt: timestamp() };
        candidatesById.set(active.id, active);
        appendAudit("admin", "partner_activated", active.id, input.correlationId);
        return { status: "active", candidate: active };
      } catch {
        appendAudit("system", "partner_activation_retryable", value.id, input.correlationId);
        return { status: "retryable", candidate: value };
      }
    },
    rejectCandidate(input) {
      const value = candidate(input.candidateId);
      if (value.status !== "pending") throw new Error("candidate_not_rejectable");
      const rejected = { ...value, status: "rejected" as const };
      candidatesById.set(rejected.id, rejected);
      appendAudit("admin", "candidate_rejected", rejected.id, input.correlationId);
      return rejected;
    },
    suspendPartner(input) {
      const value = candidate(input.candidateId);
      if (value.status !== "active") throw new Error("partner_not_suspendable");
      const suspended = { ...value, status: "suspended" as const };
      candidatesById.set(suspended.id, suspended);
      appendAudit("admin", "partner_suspended", suspended.id, input.correlationId);
      return suspended;
    },
    async qualifyCheck(input) {
      if (input.paymentStatus !== "closed_paid") return { status: "ineligible" };
      const partner = candidate(input.partnerId);
      if (partner.status !== "active" || !partner.syrveCustomerId) return { status: "ineligible" };
      const idempotencyKey = `syrve-check:${input.externalCheckId}:partner-reward:v1`;
      const duplicate = ledgerByKey.get(idempotencyKey);
      if (duplicate) return { status: "duplicate", ledger: duplicate };
      const concurrent = inFlightRewards.get(idempotencyKey);
      if (concurrent) {
        const result = await concurrent;
        return result.ledger ? { status: "duplicate" as const, ledger: result.ledger } : result;
      }
      const credit = (async (): Promise<{ status: "credited" | "retryable"; ledger?: RewardLedgerEntry }> => {
        try {
          const transaction = await syrve.topupWallet({ customerId: partner.syrveCustomerId!, amountMinor: 500, idempotencyKey, correlationId: input.correlationId });
          const entry: RewardLedgerEntry = { id: `ledger_${createOpaqueId()}`, partnerId: partner.id, externalCheckId: input.externalCheckId, kind: "credit", amountMinor: 500, currency: "PLN", idempotencyKey, status: "credited", syrveTransactionRevision: transaction.revision, createdAt: timestamp() };
          ledgerByKey.set(idempotencyKey, entry);
          ledger.push(entry);
          appendAudit("system", "reward_credited", partner.id, input.correlationId);
          return { status: "credited", ledger: entry };
        } catch {
          appendAudit("system", "reward_retryable", partner.id, input.correlationId);
          return { status: "retryable" };
        }
      })();
      inFlightRewards.set(idempotencyKey, credit);
      try {
        return await credit;
      } finally {
        inFlightRewards.delete(idempotencyKey);
      }
    },
    reverseReward(input) {
      if (!input.reason.trim()) throw new Error("reversal_reason_required");
      const credit = ledger.find((entry) => entry.id === input.ledgerId && entry.kind === "credit");
      if (!credit) throw new Error("credit_ledger_not_found");
      if (ledger.some((entry) => entry.kind === "reversal" && entry.idempotencyKey === `${credit.idempotencyKey}:reversal`)) {
        throw new Error("reward_already_reversed");
      }
      const reversal: RewardLedgerEntry = { id: `ledger_${createOpaqueId()}`, partnerId: credit.partnerId, externalCheckId: credit.externalCheckId, kind: "reversal", amountMinor: -credit.amountMinor, currency: "PLN", idempotencyKey: `${credit.idempotencyKey}:reversal`, status: "awaiting_reversal_contract", createdAt: timestamp(), reason: input.reason };
      ledger.push(reversal);
      appendAudit("admin", "reward_reversal_requested", credit.partnerId, input.correlationId);
      return reversal;
    },
    listLedger: () => [...ledger],
    listAudit: () => [...audit],
  };
}

function defaultOpaqueId(): string {
  return crypto.randomUUID().replaceAll("-", "");
}
