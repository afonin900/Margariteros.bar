import { existsSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const send = args[0] === "--send";
const eventArg = send ? args[1] : args[0];

if (!eventArg || args.length !== (send ? 2 : 1)) {
  console.error(
    "Użycie: bun send-instagram-handoff.ts [--send] content/weeks/YYYY-Www/YYYY-MM-DD-slug",
  );
  process.exit(1);
}

const eventDir = path.resolve(eventArg);
const handoffPath = path.join(eventDir, "instagram", "handoff.md");
const videoPath = path.join(eventDir, "instagram", "reel-remotion.mp4");
const briefPath = path.join(eventDir, "brief.md");

for (const file of [handoffPath, videoPath, briefPath]) {
  if (!existsSync(file)) {
    console.error(`Brakuje pliku: ${file}`);
    process.exit(1);
  }
}

const handoff = await Bun.file(handoffPath).text();
const brief = await Bun.file(briefPath).text();
if (!brief.includes("AI-artefakty:")) {
  console.error("Brak potwierdzenia kontroli AI-artefaktów w brief.md.");
  process.exit(1);
}

if (!send) {
  console.log(
    JSON.stringify(
      {
        status: "dry-run",
        handoff: handoffPath,
        video: videoPath,
        handoffCharacters: handoff.length,
        next: "Dodaj --send dopiero po poleceniu właściciela i konfiguracji bota.",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const token = process.env.TELEGRAM_SMM_BOT_TOKEN?.trim();
const chatId = process.env.TELEGRAM_SMM_CHAT_ID?.trim();
if (!token || !chatId) {
  console.error("Brakuje TELEGRAM_SMM_BOT_TOKEN lub TELEGRAM_SMM_CHAT_ID w .env.");
  process.exit(1);
}
if (handoff.length > 4096) {
  console.error("Tekst handoff.md przekracza limit wiadomości Telegrama (4096 znaków).");
  process.exit(1);
}

const api = `https://api.telegram.org/bot${token}`;
async function call(method: string, body: BodyInit) {
  const response = await fetch(`${api}/${method}`, { method: "POST", body });
  const payload = (await response.json()) as { ok?: boolean; description?: string };
  if (!response.ok || !payload.ok) {
    throw new Error(`${method}: ${payload.description ?? response.status}`);
  }
}

await call(
  "sendMessage",
  new URLSearchParams({ chat_id: chatId, text: handoff, disable_web_page_preview: "true" }),
);

const video = Bun.file(videoPath);
const form = new FormData();
form.set("chat_id", chatId);
form.set("video", new Blob([await video.arrayBuffer()], { type: "video/mp4" }), path.basename(videoPath));
form.set("caption", "Gotowy plik Reel — użyj go razem z instrukcją powyżej.");
form.set("supports_streaming", "true");
await call("sendVideo", form);

console.log(JSON.stringify({ status: "sent", handoff: handoffPath, video: videoPath }));
