import { PROGRAM_TEMPLATE_IDS, type ProgramConfigV1Type } from "@refref/types";
import { createDb, schema } from "./index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl)
  throw new Error("DATABASE_URL environment variable is required");

const db = createDb(databaseUrl);

// Deliberately non-personal, stable IDs make a local staging reset observable.
// No reward rule, reward amount, balance, guest, phone, or Syrve credential is
// part of this seed. Loyalty economics remain native Syrve configuration.
export const MARGARITEROS_STAGING = {
  orgId: "org_margariteros_staging",
  productId: "prd_margariteros_r_club",
  programId: "prg_margariteros_r_club",
  participantId: "prt_margariteros_staging_partner",
  refcodeId: "rc_margariteros_staging_partner",
  refcode: "x7mq2ka",
} as const;

const programConfig: ProgramConfigV1Type = {
  schemaVersion: 1,
  // This is a provider marker, not a RefRef reward configuration.
  actions: [{ provider: "syrve_native", mode: "readback_only" }],
  brandConfig: {
    primaryColor: "#C6FF00",
    landingPageUrl: "http://localhost:3000/club",
  },
  widgetConfig: {
    position: "bottom-right",
    triggerText: "R Club",
    icon: "gift",
    title: "R Club",
    subtitle: "Status partnera jest potwierdzany przez Margariteros.",
    logoUrl: "",
    shareMessage: "Otwórz Margariteros R Club.",
    enabledPlatforms: {
      facebook: false,
      twitter: false,
      linkedin: false,
      whatsapp: false,
      email: false,
      instagram: false,
      telegram: true,
    },
    referralLink: "",
    productName: "Margariteros R Club",
  },
};

async function seed() {
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.org)
      .values({
        id: MARGARITEROS_STAGING.orgId,
        name: "Margariteros staging",
        slug: "margariteros-staging",
        logo: null,
        metadata: null,
      })
      .onConflictDoNothing();
    await tx
      .insert(schema.product)
      .values({
        id: MARGARITEROS_STAGING.productId,
        orgId: MARGARITEROS_STAGING.orgId,
        name: "Margariteros R Club staging",
        slug: "margariteros-r-club-staging",
        logo: null,
        url: "http://localhost:3000/club",
        metadata: JSON.stringify({
          schemaVersion: 1,
          provider: "syrve_native",
        }),
        appType: "partner_portal",
        useCase: "syrve_native_readback_only",
        paymentProvider: "syrve_native",
        onboardingCompleted: true,
        onboardingStep: 4,
      })
      .onConflictDoNothing();
    await tx
      .insert(schema.program)
      .values({
        id: MARGARITEROS_STAGING.programId,
        productId: MARGARITEROS_STAGING.productId,
        programTemplateId: PROGRAM_TEMPLATE_IDS.AFFILIATE,
        name: "Margariteros R Club — Syrve native staging",
        status: "active",
        startDate: null,
        endDate: null,
        config: programConfig,
      })
      .onConflictDoNothing();
    await tx
      .insert(schema.participant)
      .values({
        id: MARGARITEROS_STAGING.participantId,
        name: null,
        email: null,
        productId: MARGARITEROS_STAGING.productId,
        externalId: "margariteros-staging-partner",
      })
      .onConflictDoNothing();
    await tx
      .insert(schema.refcode)
      .values({
        id: MARGARITEROS_STAGING.refcodeId,
        code: MARGARITEROS_STAGING.refcode,
        participantId: MARGARITEROS_STAGING.participantId,
        programId: MARGARITEROS_STAGING.programId,
        productId: MARGARITEROS_STAGING.productId,
      })
      .onConflictDoNothing();
  });

  console.log(
    JSON.stringify({
      productId: MARGARITEROS_STAGING.productId,
      programId: MARGARITEROS_STAGING.programId,
      participantId: MARGARITEROS_STAGING.participantId,
      refcode: MARGARITEROS_STAGING.refcode,
      provider: "syrve_native",
      syrveAdapter: "not_ready",
    }),
  );
}

seed().catch((error) => {
  console.error("Margariteros staging seed failed", error);
  process.exitCode = 1;
});
