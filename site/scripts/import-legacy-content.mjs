import { readdir, readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const weeks = ["content/weeks/2026-W34", "content/weeks/2026-W35"];
const events = [
  ["2026-W34/2026-08-20-bachata-night", "Bachata Night", "2026-08-20T22:00:00+02:00"],
  ["2026-W34/2026-08-22-dj-dragon", "DJ Dragon", "2026-08-22T21:00:00+02:00"],
  ["2026-W35/2026-08-28-dj-kike", "DJ Kike", "2026-08-28T21:00:00+02:00"],
  ["2026-W35/2026-08-29-dj-joyland", "DJ Joyland", "2026-08-29T21:00:00+02:00"],
];
const channels = new Set(["instagram", "threads", "facebook", "gbp"]);
const media = /\.(?:png|jpe?g|webp|mp4|mov)$/i;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => entry.isDirectory() ? walk(resolve(directory, entry.name)) : [resolve(directory, entry.name)]))).flat();
}

const records = [];
for (const [legacy, title, startsAt] of events) {
  const directory = resolve(root, "content/weeks", legacy);
  const files = (await walk(directory)).filter((file) => media.test(file));
  const publicationChannels = new Set(files.map((file) => relative(directory, file).split("/")[0]).filter((channel) => channels.has(channel)));
  const hero = files.find((file) => /\.cleaned\./.test(file)) ?? files.find((file) => /poster\.(png|jpe?g|webp)$/i.test(file)) ?? files.find((file) => /reel-remotion\.mp4$/i.test(file));
  if (!hero) throw new Error(`${title}: no confirmed hero file`);
  records.push({ title, startsAt, legacyPath: `content/weeks/${legacy}`, hero: relative(root, hero), channels: [...publicationChannels], assets: files.map((file) => relative(root, file)) });
}

if (!process.argv.includes("--dry-run") && !process.argv.includes("--apply")) throw new Error("Use --dry-run or --apply");
if (process.argv.includes("--apply")) throw new Error("Import is intentionally locked until EMDASH_API_TOKEN-backed duplicate checks are implemented.");
console.log(JSON.stringify({ events: records, totals: { events: records.length, publications: records.reduce((sum, event) => sum + event.channels.length, 0), assets: records.reduce((sum, event) => sum + event.assets.length, 0) } }, null, 2));
