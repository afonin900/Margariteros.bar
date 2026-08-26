import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const execFile = promisify(execFileCallback);
const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const tag = `margariteros-verify-${process.pid}`;
const container = `margariteros-verify-${process.pid}`;

async function docker(...args) {
  return execFile("docker", args, { cwd: siteRoot });
}

async function waitForHealthy() {
  for (let attempt = 0; attempt < 45; attempt += 1) {
    const { stdout } = await docker("inspect", "--format", "{{.State.Health.Status}}", container);
    if (stdout.trim() === "healthy") return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Container did not become healthy within 22.5 seconds");
}

try {
  await docker("build", "--tag", tag, ".");
  await docker("run", "--rm", "--detach", "--network", "none", "--name", container, tag);
  await waitForHealthy();

  const { stdout: user } = await docker("inspect", "--format", "{{.Config.User}}", container);
  if (user.trim() !== "astro") throw new Error(`Expected non-root user astro, got ${user.trim() || "root"}`);

  const { stdout: healthResponse } = await docker(
    "exec", "--user", "astro", container, "node", "-e",
    "fetch('http://127.0.0.1:4321/healthz').then(async (response) => { if (!response.ok || await response.text() !== 'ok') process.exit(1); })",
  );
  if (healthResponse.trim()) throw new Error("Health probe must not write unexpected output");
  console.log("Docker verification passed: non-root runtime and in-container /healthz.");
} finally {
  await docker("rm", "--force", container).catch(() => undefined);
  await docker("image", "rm", tag).catch(() => undefined);
}
