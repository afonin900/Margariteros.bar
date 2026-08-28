import { schema, type DBType } from "@refref/coredb";
const { event: eventTable, eventDefinition, participant } = schema;
import { eq } from "drizzle-orm";
import type { EventMetadataV1Type } from "@refref/types";
import { processEventForRewards } from "./reward-engine.js";
import {
  dispatchSyrveNativeEvent,
  isSyrveNativeEvent,
} from "./syrve-native-event.js";

type DbType = DBType;

type CreatedEvent = {
  id: string;
  productId: string;
  participantId: string | null;
  referralId: string | null;
  metadata: EventMetadataV1Type | null;
};

export async function dispatchCreatedEvent(
  db: DbType,
  event: CreatedEvent,
  dependencies = {
    processUpstream: processEventForRewards,
    processSyrveNative: dispatchSyrveNativeEvent,
  },
): Promise<"upstream" | "syrve_native"> {
  if (isSyrveNativeEvent(event.metadata ?? undefined)) {
    await dependencies.processSyrveNative({
      db,
      eventId: event.id,
      productId: event.productId,
      participantId: event.participantId,
      referralId: event.referralId,
      metadata: event.metadata ?? undefined,
    });
    return "syrve_native";
  }

  await dependencies.processUpstream(db, event.id);
  return "upstream";
}

export interface CreateEventInput {
  productId: string;
  programId?: string;
  eventType: string;
  participantId?: string;
  referralId?: string;
  metadata?: EventMetadataV1Type;
}

/**
 * Create a new event and trigger reward processing
 */
export async function createEvent(db: DbType, input: CreateEventInput) {
  // Validate event definition exists
  const [eventDef] = await db
    .select()
    .from(eventDefinition)
    .where(eq(eventDefinition.type, input.eventType))
    .limit(1);

  if (!eventDef) {
    throw new Error(`Event definition not found for type: ${input.eventType}`);
  }

  // Validate participant if provided
  if (input.participantId) {
    const [participantRecord] = await db
      .select()
      .from(participant)
      .where(eq(participant.id, input.participantId))
      .limit(1);

    if (!participantRecord) {
      throw new Error("Participant not found");
    }
  }

  // Create the event
  const [newEvent] = await db
    .insert(eventTable)
    .values({
      productId: input.productId,
      programId: input.programId || null,
      participantId: input.participantId || null,
      referralId: input.referralId || null,
      eventDefinitionId: eventDef.id,
      status: "pending",
      metadata: input.metadata || { schemaVersion: 1, source: "api" },
    })
    .returning();

  if (!newEvent) {
    throw new Error("Failed to create event");
  }

  // Native delivery must persist its durable not_ready/reconciliation state
  // before returning. Existing RefRef programs retain their asynchronous
  // upstream reward processing behavior.
  if (isSyrveNativeEvent(newEvent.metadata ?? undefined)) {
    await dispatchCreatedEvent(db, newEvent);
  } else {
    dispatchCreatedEvent(db, newEvent).catch(() => {
      console.error("Event delivery dispatch failed");
    });
  }

  return newEvent;
}
