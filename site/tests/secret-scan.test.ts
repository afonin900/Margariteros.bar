import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveActiveAutopilotRoot } from "../scripts/secret-scan.mjs";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("active Autopilot run resolution", () => {
  it("prefers the stable current run over its legacy WIP sibling without scanning other runs", async () => {
    const repositoryRoot = await mkdtemp(join(tmpdir(), "margariteros-secret-scan-"));
    temporaryRoots.push(repositoryRoot);
    const autopilot = join(repositoryRoot, ".autopilot");
    const stable = join(autopilot, "2026-08-26-first-party-astro-home");

    await Promise.all([
      mkdir(stable, { recursive: true }),
      mkdir(join(autopilot, "2026-08-26-first-party-astro-home--wip"), { recursive: true }),
      mkdir(join(autopilot, "unrelated-run"), { recursive: true }),
    ]);

    await expect(resolveActiveAutopilotRoot(repositoryRoot)).resolves.toBe(stable);
  });
});
