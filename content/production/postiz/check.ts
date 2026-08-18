import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

async function loadEnv() {
  const envPath = path.join(repoRoot, ".env");
  let text = "";
  try {
    text = await readFile(envPath, "utf8");
  } catch {
    return;
  }
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

await loadEnv();

const key = process.env.POSTIZ_API_KEY?.trim();
const base = (process.env.POSTIZ_BASE_URL ?? "https://postiz.margariteros.bar").replace(/\/+$/, "");

if (!key) {
  console.error("Нет POSTIZ_API_KEY. Положи ключ в .env.");
  process.exit(1);
}

const url = `${base}/api/public/v1/integrations`;
const response = await fetch(url, { headers: { Authorization: key } });
if (!response.ok) {
  console.error(`Postiz ответил ${response.status}. Ключ не принят.`);
  process.exit(1);
}

const payload: unknown = await response.json();
const used = "/api/public/v1/integrations";

const list = Array.isArray(payload)
  ? payload
  : payload && typeof payload === "object" && Array.isArray((payload as { integrations?: unknown }).integrations)
    ? (payload as { integrations: unknown[] }).integrations
    : [];

console.log(`Ключ принят. Хост: ${base.replace("https://", "")}`);
console.log(`Эндпоинт: ${used || "ok"}`);
if (!Array.isArray(list) || list.length === 0) {
  console.log("Каналов пока нет.");
  process.exit(0);
}

console.log(`Каналов: ${list.length}`);
for (const item of list) {
  if (!item || typeof item !== "object") continue;
  const row = item as { name?: string; platform?: string; identifier?: string };
  const name = row.name ?? "без имени";
  const platform = row.platform ?? row.identifier ?? "unknown";
  console.log(`- ${platform}: ${name}`);
}
