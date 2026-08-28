export const TELEGRAM_VALIDATION_PATH = "/api/club/telegram/validate";

export type TelegramValidationStatus =
  | "verified_pending_registration"
  | "invalid_init_data"
  | "replay_detected"
  | "not_configured"
  | "not_ready";

export type TelegramValidationResponse = {
  status: TelegramValidationStatus;
};

export type TelegramLaunchResult =
  | "verified_pending"
  | "not_configured"
  | "not_ready"
  | "invalid";

export function toTelegramLaunchResult(
  status: TelegramValidationStatus,
): TelegramLaunchResult {
  if (status === "verified_pending_registration") return "verified_pending";
  if (status === "not_configured") return "not_configured";
  if (status === "not_ready") return "not_ready";
  return "invalid";
}
