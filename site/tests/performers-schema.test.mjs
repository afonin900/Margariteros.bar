import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Kysely } from "kysely";
import { createDialect } from "emdash/db/sqlite";
import { runMigrations } from "emdash/db";
import { SchemaRegistry } from "emdash";

const execFileAsync = promisify(execFile);
const siteRoot = fileURLToPath(new URL("../", import.meta.url));
const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function createFixture() {
  const directory = await mkdtemp(join(tmpdir(), "margariteros-performers-test-"));
  temporaryDirectories.push(directory);
  const databasePath = join(directory, "emdash.db");
  const db = new Kysely({ dialect: createDialect({ url: databasePath }) });
  try {
    await runMigrations(db);
    const registry = new SchemaRegistry(db);
    await registry.createCollection({ slug: "events", label: "Events", titleField: "title" });
    await registry.createField("events", { slug: "title", label: "Title", type: "string", required: true });
  } finally {
    await db.destroy();
  }
  return {
    directory,
    databasePath,
    backupPath: join(directory, "before-performers.db"),
    rerunBackupPath: join(directory, "before-performers-rerun.db"),
  };
}

describe("performers EmDash schema migration", () => {
  it("creates the locale-safe performer directory and native event relation idempotently", async () => {
    const fixture = await createFixture();
    const args = ["./scripts/migrate-performers.mjs", "--apply", `--backup=${fixture.backupPath}`];
    const { stdout } = await execFileAsync(process.execPath, args, {
      cwd: siteRoot,
      env: { ...process.env, EMDASH_DATABASE_PATH: fixture.databasePath },
    });
    const report = JSON.parse(stdout);
    expect(report.mode).toBe("apply");
    expect(report.backup.rollbackRehearsal).toBe("passed");
    expect((await stat(fixture.backupPath)).size).toBeGreaterThan(0);

    const db = new Kysely({ dialect: createDialect({ url: fixture.databasePath }) });
    try {
      const registry = new SchemaRegistry(db);
      expect((await registry.getCollection("performers"))?.titleField).toBe("name");
      expect((await registry.getCollection("performers"))?.routable).toBe(false);
      expect((await registry.getField("performers", "name"))?.translatable).toBe(false);
      expect((await registry.getField("performers", "bio"))?.translatable).toBe(true);
      expect((await registry.getField("performers", "instagram_url"))?.required).toBe(true);
      expect((await registry.getField("performers", "active"))?.defaultValue).toBe(true);
      expect((await registry.getField("performers", "active"))?.indexed).toBe(true);
      expect((await registry.getField("events", "primary_performer"))?.type).toBe("reference");
      expect((await registry.getField("events", "primary_performer"))?.options?.collection).toBe("performers");
      expect((await registry.getField("events", "primary_performer"))?.translatable).toBe(false);

      const relations = await db.selectFrom("_emdash_relations")
        .selectAll()
        .where("name", "=", "event_performers")
        .orderBy("locale", "asc")
        .execute();
      expect(relations.map((row) => row.locale)).toEqual(["en", "es", "pl", "ru"]);
      expect(new Set(relations.map((row) => row.translation_group)).size).toBe(1);
      expect(relations.every((row) => row.parent_collection === "events" && row.child_collection === "performers")).toBe(true);
    } finally {
      await db.destroy();
    }

    const rerun = await execFileAsync(process.execPath, [
      "./scripts/migrate-performers.mjs", "--apply", `--backup=${fixture.rerunBackupPath}`,
    ], {
      cwd: siteRoot,
      env: { ...process.env, EMDASH_DATABASE_PATH: fixture.databasePath },
    });
    expect(JSON.parse(rerun.stdout).relation.locales.map((item) => item.state)).toEqual(["present", "present", "present", "present"]);
  });

  it("only reports the intended schema on a dry run", async () => {
    const fixture = await createFixture();
    const { stdout } = await execFileAsync(process.execPath, ["./scripts/migrate-performers.mjs"], {
      cwd: siteRoot,
      env: { ...process.env, EMDASH_DATABASE_PATH: fixture.databasePath },
    });
    const report = JSON.parse(stdout);
    expect(report.mode).toBe("dry-run");
    expect(report.schema.collection).toBe("would-create");
    expect(report.relation.locales.map((item) => item.state)).toEqual(["would-create", "would-create", "would-create", "would-create"]);
  });
});
