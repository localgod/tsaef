import { describe, it, expect, afterEach } from "vitest";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, unlinkSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { TsAEF } from "../src/TsAEF.mjs";
import { Archimate } from "../src/Archimate.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = resolve(__dirname, "fixtures/basic.xml");
const TMP_PATH = resolve(tmpdir(), `tsaef-test-${Date.now()}.xml`);

const tsaef = new TsAEF();

afterEach(() => {
  if (existsSync(TMP_PATH)) unlinkSync(TMP_PATH);
});

describe("TsAEF.load", () => {
  it("loads a valid AEF file and returns an Archimate instance", async () => {
    const model = await tsaef.load(FIXTURE_PATH);
    expect(model).toBeInstanceOf(Archimate);
    expect(model.getName()).toBe("Basic");
    expect(model.getElements()).toHaveLength(2);
  });

  it("wraps missing-file error with context", async () => {
    await expect(tsaef.load("/nonexistent/path/model.xml")).rejects.toThrow(
      "Failed to load AEF file: /nonexistent/path/model.xml",
    );
  });
});

describe("TsAEF.save", () => {
  it("saves an Archimate model to disk and produces valid XML", async () => {
    const model = Archimate.create("Save Test");
    model.upsertElement("App", "ApplicationComponent");
    await tsaef.save(TMP_PATH, model);
    const written = readFileSync(TMP_PATH, "utf-8");
    expect(written).toContain('<?xml version="1.0"');
    expect(written).toContain("Save Test");
    expect(written).toContain("ApplicationComponent");
  });

  it("round-trips load → save → load without data loss", async () => {
    const original = await tsaef.load(FIXTURE_PATH);
    await tsaef.save(TMP_PATH, original);
    const reloaded = await tsaef.load(TMP_PATH);
    expect(reloaded.getName()).toBe(original.getName());
    expect(reloaded.getElements()).toHaveLength(original.getElements().length);
    expect(reloaded.getRelationships()).toHaveLength(original.getRelationships().length);
  });

  it("wraps save error with context", async () => {
    const model = Archimate.create("Test");
    await expect(tsaef.save("/nonexistent/directory/model.xml", model)).rejects.toThrow(
      "Failed to save AEF file: /nonexistent/directory/model.xml",
    );
  });
});
