import { describe, expect, it } from "vitest";
import { createClubDomain, createFakeSyrveAdapter, createNotReadySyrveAdapter } from "../../src/lib/club";

describe("club-domain", () => {
  it("resumes the same pending candidate for the same phone identity and keeps one opaque referral code", async () => {
    const club = createClubDomain({ syrve: createFakeSyrveAdapter() });

    const first = await club.registerCandidate({
      telegramUserId: "tg_opaque_1",
      phoneHash: "phone_hash_opaque_1",
      correlationId: "corr_1",
    });
    const repeated = await club.registerCandidate({
      telegramUserId: "tg_opaque_2",
      phoneHash: "phone_hash_opaque_1",
      correlationId: "corr_2",
    });

    expect(first.candidate.status).toBe("pending");
    expect(repeated).toEqual(first);
    expect(first.candidate.referralCode).toMatch(/^[a-z0-9_-]{12,}$/i);
  });

  it("changes a candidate only through pending, active, rejected and suspended states", async () => {
    const club = createClubDomain({ syrve: createFakeSyrveAdapter() });
    const pending = (await club.registerCandidate({ telegramUserId: "tg_2", phoneHash: "hash_2", correlationId: "corr_3" })).candidate;

    expect(club.rejectCandidate({ candidateId: pending.id, correlationId: "corr_4" }).status).toBe("rejected");

    const partner = (await club.registerCandidate({ telegramUserId: "tg_3", phoneHash: "hash_3", correlationId: "corr_5" })).candidate;
    const activated = await club.activatePartner({ candidateId: partner.id, correlationId: "corr_6" });

    expect(activated.status).toBe("active");
    expect(club.suspendPartner({ candidateId: partner.id, correlationId: "corr_7" }).status).toBe("suspended");
  });

  it("credits exactly 5 PLN once for a closed paid check and makes one compensating reversal boundary", async () => {
    const club = createClubDomain({ syrve: createFakeSyrveAdapter() });
    const pending = (await club.registerCandidate({ telegramUserId: "tg_4", phoneHash: "hash_4", correlationId: "corr_8" })).candidate;
    await club.activatePartner({ candidateId: pending.id, correlationId: "corr_9" });

    expect(await club.qualifyCheck({ partnerId: pending.id, externalCheckId: "check_1", paymentStatus: "open", correlationId: "corr_10" })).toEqual({ status: "ineligible" });
    const credit = await club.qualifyCheck({ partnerId: pending.id, externalCheckId: "check_1", paymentStatus: "closed_paid", correlationId: "corr_11" });
    const repeated = await club.qualifyCheck({ partnerId: pending.id, externalCheckId: "check_1", paymentStatus: "closed_paid", correlationId: "corr_12" });

    expect(credit).toMatchObject({ status: "credited", ledger: { amountMinor: 500, currency: "PLN", idempotencyKey: "syrve-check:check_1:partner-reward:v1" } });
    expect(repeated).toMatchObject({ status: "duplicate", ledger: credit.ledger });
    const reversal = club.reverseReward({ ledgerId: credit.ledger!.id, reason: "refunded", correlationId: "corr_13" });
    expect(reversal).toMatchObject({ kind: "reversal", amountMinor: -500, status: "awaiting_reversal_contract" });
    expect(() => club.reverseReward({ ledgerId: credit.ledger!.id, reason: "again", correlationId: "corr_14" })).toThrow("reward_already_reversed");
  });

  it("serializes simultaneous delivery of the same closed paid check into one credit", async () => {
    const club = createClubDomain({ syrve: createFakeSyrveAdapter() });
    const pending = (await club.registerCandidate({ telegramUserId: "tg_6", phoneHash: "hash_6", correlationId: "corr_17" })).candidate;
    await club.activatePartner({ candidateId: pending.id, correlationId: "corr_18" });

    const [first, repeated] = await Promise.all([
      club.qualifyCheck({ partnerId: pending.id, externalCheckId: "check_parallel", paymentStatus: "closed_paid", correlationId: "corr_19" }),
      club.qualifyCheck({ partnerId: pending.id, externalCheckId: "check_parallel", paymentStatus: "closed_paid", correlationId: "corr_20" }),
    ]);

    expect([first.status, repeated.status].sort()).toEqual(["credited", "duplicate"]);
    expect(club.listLedger()).toHaveLength(1);
  });

  it("keeps failed Syrve work retryable and exposes no raw identity values in audit events", async () => {
    const club = createClubDomain({ syrve: createNotReadySyrveAdapter() });
    const pending = (await club.registerCandidate({ telegramUserId: "tg_5", phoneHash: "hash_5", correlationId: "corr_15" })).candidate;

    expect(await club.activatePartner({ candidateId: pending.id, correlationId: "corr_16" })).toMatchObject({ status: "retryable", candidate: { status: "pending" } });
    expect(JSON.stringify(club.listAudit())).not.toMatch(/hash_5|tg_5|phone|card|secret/i);
  });

  it("finds a public referral view without exposing candidate identity fields", async () => {
    const club = createClubDomain({ syrve: createFakeSyrveAdapter() });
    const pending = (await club.registerCandidate({ telegramUserId: "tg_7", phoneHash: "hash_7", correlationId: "corr_21" })).candidate;
    const active = (await club.registerCandidate({ telegramUserId: "tg_8", phoneHash: "hash_8", correlationId: "corr_22" })).candidate;
    const suspended = (await club.registerCandidate({ telegramUserId: "tg_9", phoneHash: "hash_9", correlationId: "corr_23" })).candidate;
    await club.activatePartner({ candidateId: active.id, correlationId: "corr_24" });
    await club.activatePartner({ candidateId: suspended.id, correlationId: "corr_25" });
    club.suspendPartner({ candidateId: suspended.id, correlationId: "corr_26" });

    expect(club.findCandidateByReferralCode(pending.referralCode)).toEqual({ referralCode: pending.referralCode, status: "pending" });
    expect(club.findCandidateByReferralCode(active.referralCode)).toEqual({ referralCode: active.referralCode, status: "active" });
    expect(club.findCandidateByReferralCode(suspended.referralCode)).toEqual({ referralCode: suspended.referralCode, status: "suspended" });
    expect(club.findCandidateByReferralCode("unknown-code")).toBeUndefined();
    expect(club.findCandidateByReferralCode(active.referralCode)).not.toHaveProperty("phoneHash");
    expect(club.findCandidateByReferralCode(active.referralCode)).not.toHaveProperty("telegramUserId");
    expect(club.findCandidateByReferralCode(active.referralCode)).not.toHaveProperty("syrveCustomerId");
  });
});
