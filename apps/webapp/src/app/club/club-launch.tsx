"use client";

import { useEffect, useState } from "react";
import {
  TELEGRAM_VALIDATION_PATH,
  toTelegramLaunchResult,
  type TelegramValidationResponse,
} from "@/lib/club/telegram-contract";

type LaunchState = "browser" | "checking" | ReturnType<typeof toTelegramLaunchResult>;

declare global {
  interface Window {
    Telegram?: { WebApp?: { initData?: string; ready?: () => void } };
  }
}

export function ClubLaunch() {
  const [state, setState] = useState<LaunchState>("browser");

  useEffect(() => {
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) return;
    window.Telegram?.WebApp?.ready?.();
    setState("checking");
    void fetch(TELEGRAM_VALIDATION_PATH, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ initData }),
    })
      .then(async (response) => await response.json() as TelegramValidationResponse)
      .then((body) => {
        setState(toTelegramLaunchResult(body.status));
      })
      .catch(() => setState("invalid"));
  }, []);

  if (state === "browser") {
    return <p data-club-launch="browser">Otworzyłeś R Club w przeglądarce — Telegram nie jest wymagany.</p>;
  }
  if (state === "checking") return <p aria-live="polite">Sprawdzamy bezpiecznie uruchomienie z Telegrama…</p>;
  if (state === "verified_pending") {
    return <p data-club-launch="verified-pending">Telegram został potwierdzony. Rejestracja partnera oczekuje na konfigurację programu.</p>;
  }
  if (state === "not_configured") {
    return <p data-club-launch="not-configured">Uruchomienie przez Telegram nie jest jeszcze skonfigurowane.</p>;
  }
  if (state === "not_ready") {
    return <p data-club-launch="not-ready">Uruchomienie przez Telegram oczekuje na bezpieczne przechowywanie ochrony przed powtórzeniem.</p>;
  }
  return <p role="alert">Nie udało się potwierdzić uruchomienia z Telegrama. Otwórz R Club ponownie z bota.</p>;
}
