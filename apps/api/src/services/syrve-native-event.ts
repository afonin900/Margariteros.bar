import type { EventMetadataV1Type } from "@refref/types";
import type { DBType } from "@refref/coredb";
import {
  createSyrveNativeAdapterFromEnvironment,
  type SyrveDelivery,
  type SyrveConversionInput,
} from "./syrve-native.js";
import { createSyrveDeliveryStore } from "./syrve-native-store.js";

type SyrveNativeMetadata = {
  schemaVersion: 1;
  provider: "syrve_native";
  externalCheckId: string;
  syrveCustomerId: string;
  syrveProgramId: string;
};

export function isSyrveNativeEvent(
  metadata: EventMetadataV1Type | undefined,
): boolean {
  const value = metadata?.customData?.syrveNative;
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.schemaVersion === 1 &&
    candidate.provider === "syrve_native" &&
    typeof candidate.externalCheckId === "string" &&
    typeof candidate.syrveCustomerId === "string" &&
    typeof candidate.syrveProgramId === "string"
  );
}

function parseSyrveNativeMetadata(
  metadata: EventMetadataV1Type | undefined,
): SyrveNativeMetadata | undefined {
  if (!isSyrveNativeEvent(metadata)) return undefined;
  return metadata?.customData?.syrveNative as SyrveNativeMetadata;
}

/**
 * The native provider is opt-in metadata on an already-created RefRef event.
 * It does not change participant/referral/event/reward creation or invoke the
 * upstream reward engine differently.
 */
export async function dispatchSyrveNativeEvent(input: {
  db: DBType;
  eventId: string;
  productId: string;
  participantId?: string | null;
  referralId?: string | null;
  metadata?: EventMetadataV1Type;
}): Promise<SyrveDelivery | undefined> {
  const metadata = parseSyrveNativeMetadata(input.metadata);
  if (!metadata || !input.participantId || !input.referralId) return undefined;

  const conversion: SyrveConversionInput = {
    refrefEventId: input.eventId,
    productId: input.productId,
    participantId: input.participantId,
    referralId: input.referralId,
    externalCheckId: metadata.externalCheckId,
    syrveCustomerId: metadata.syrveCustomerId,
    syrveProgramId: metadata.syrveProgramId,
  };
  const delivery = await createSyrveNativeAdapterFromEnvironment(
    createSyrveDeliveryStore(input.db),
  ).process(
    conversion,
  );
  await createSyrveDeliveryStore(input.db).save(delivery);
  return delivery;
}
