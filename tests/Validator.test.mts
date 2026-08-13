import { describe, it, expect } from "vitest";
import { Archimate } from "../src/Archimate.mjs";
import { Validator } from "../src/Validator.mjs";

const validator = new Validator();

describe("Validator.validate", () => {
  it("passes a valid model", () => {
    const a = Archimate.create("Valid Model");
    a.upsertElement("App", "ApplicationComponent", "An app");
    const result = validator.validate(a);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("catches invalid element types", () => {
    const a = Archimate.create("Test");
    a.getElements().push({ identifier: "id-1", type: "NotARealType", name: "Bad" });
    const result = validator.validate(a);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("catches invalid relationship types", () => {
    const a = Archimate.create("Test");
    const src = a.upsertElement("Src", "ApplicationComponent");
    const tgt = a.upsertElement("Tgt", "Capability");
    a.getRelationships().push({
      identifier: "id-rel",
      type: "BadRelationship",
      source: src.identifier,
      target: tgt.identifier,
    });
    const result = validator.validate(a);
    expect(result.success).toBe(false);
  });

  it("detects missing references with checkReferences", () => {
    const a = Archimate.create("Test");
    a.getRelationships().push({
      identifier: "id-rel",
      type: "Association",
      source: "does-not-exist",
      target: "also-missing",
    });
    const result = validator.validate(a, { checkReferences: true });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes("does-not-exist"))).toBe(true);
  });

  it("rejects relationship IDs used as relationship source/target", () => {
    const a = Archimate.create("Test");
    const src = a.upsertElement("Src", "ApplicationComponent");
    const tgt = a.upsertElement("Tgt", "Capability");
    const rel = a.upsertRelationship(src.identifier, tgt.identifier, "Association");
    // Create a second relationship pointing at the first relationship's ID — invalid
    a.getRelationships().push({
      identifier: "id-bad",
      type: "Association",
      source: src.identifier,
      target: rel.identifier,
    });
    const result = validator.validate(a, { checkReferences: true });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes(rel.identifier))).toBe(true);
  });

  it("adds warnings in strict mode for missing documentation", () => {
    const a = Archimate.create("Test");
    a.upsertElement("App", "ApplicationComponent");
    const result = validator.validate(a, { strict: true });
    expect(result.warnings.some((w) => w.includes("no documentation"))).toBe(true);
  });

  it("validates namespaces when requested", () => {
    const a = Archimate.create("Test");
    a.toObject().xmlns = "http://wrong-namespace.example.com/";
    const result = validator.validate(a, { validateNamespaces: true });
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.includes("Invalid namespace"))).toBe(true);
  });
});
