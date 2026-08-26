import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repositoryRoot = resolve(siteRoot, "..");
const activeRunSlug = "2026-08-26-first-party-astro-home";
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

export async function resolveActiveAutopilotRoot(root) {
  const candidates = [
    join(root, ".autopilot", activeRunSlug),
    join(root, ".autopilot", `${activeRunSlug}--wip`),
  ];

  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isDirectory()) return candidate;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  throw new Error(`Active Autopilot run not found: ${candidates.join(" or ")}`);
}

export async function scanForKnownSecrets(root = repositoryRoot) {
  const autopilotRoot = await resolveActiveAutopilotRoot(root);
  const findings = [];
  for (const scanRoot of [resolve(root, "site"), autopilotRoot]) {
    for (const file of await collectFiles(scanRoot)) {
      const contents = await readFile(file, "utf8");
      for (const pattern of patterns) {
        if (pattern.expression.test(contents)) findings.push(`${relative(root, file)}: ${pattern.name}`);
      }
    }
  }
  return findings;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : undefined;
if (import.meta.url === invokedPath) {
  const findings = await scanForKnownSecrets();
  if (findings.length > 0) {
    console.error(findings.join("\n"));
    process.exit(1);
  }

  console.log("Secret scan passed: no credential values in site or active Autopilot run.");
}
