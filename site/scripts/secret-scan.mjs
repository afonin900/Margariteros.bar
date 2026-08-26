import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repositoryRoot = resolve(siteRoot, "..");
const autopilotRoot = resolve(repositoryRoot, ".autopilot/2026-08-26-first-party-astro-home--wip");
const ignoredDirectories = new Set(["node_modules", ".astro", "dist", ".git"]);
const ignoredFiles = new Set(["package-lock.json"]);
const patterns = [
  { name: "private key", expression: /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/ },
  { name: "GitHub token", expression: /gh[pous]_[A-Za-z0-9_]{20,}/ },
  { name: "OpenAI key", expression: /sk-[A-Za-z0-9_-]{20,}/ },
  { name: "AWS access key", expression: /AKIA[0-9A-Z]{16}/ },
  { name: "credential URL", expression: /https?:\/\/[^\s/:]+:[^\s@]+@/ },
];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...await collectFiles(join(directory, entry.name)));
    } else if (entry.isFile() && !ignoredFiles.has(entry.name)) {
      files.push(join(directory, entry.name));
    }
  }
  return files;
}

const findings = [];
for (const root of [siteRoot, autopilotRoot]) {
  for (const file of await collectFiles(root)) {
    const contents = await readFile(file, "utf8");
    for (const pattern of patterns) {
      if (pattern.expression.test(contents)) findings.push(`${relative(repositoryRoot, file)}: ${pattern.name}`);
    }
  }
}

if (findings.length > 0) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log("Secret scan passed: no credential values in site or active Autopilot run.");
