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

  it("accepts a relationship and a connection as endpoints", () => {
    const a = Archimate.create("Test");
    const src = a.upsertElement("Src", "ApplicationComponent");
    const tgt = a.upsertElement("Tgt", "Capability");
    const note = a.upsertElement("Note", "BusinessObject");
    const realization = a.upsertRelationship(src.identifier, tgt.identifier, "Realization");
    const association = a.upsertRelationship(
      note.identifier,
      realization.identifier,
      "Association",
    );
    a.getViews().push({
      identifier: "view-1",
      name: "View",
      nodes: [
        { identifier: "node-src", elementRef: src.identifier },
        { identifier: "node-tgt", elementRef: tgt.identifier },
        { identifier: "node-note", elementRef: note.identifier },
      ],
      connections: [
        {
          identifier: "conn-realization",
          relationshipRef: realization.identifier,
          source: "node-src",
          target: "node-tgt",
        },
        {
          identifier: "conn-association",
          relationshipRef: association.identifier,
          source: "node-note",
          target: "conn-realization",
        },
      ],
    });

    const result = validator.validate(a, { checkReferences: true });

    expect(result.errors).toEqual([]);
    expect(result.success).toBe(true);
  });

  it("warns about relationships that connect to themselves or form a cycle", () => {
    const a = Archimate.create("Test");
    const element = a.upsertElement("A", "BusinessActor");
    a.getRelationships().push(
      { identifier: "r1", type: "Association", source: element.identifier, target: "r1" },
      { identifier: "r2", type: "Association", source: "r3", target: element.identifier },
      { identifier: "r3", type: "Association", source: "r2", target: element.identifier },
      { identifier: "r4", type: "Association", source: "r4", target: "r4" },
    );

    const result = validator.validate(a, { checkReferences: true });

    expect(result.errors).toEqual([]);
    expect(result.success).toBe(true);
    expect(result.warnings).toEqual([
      "Relationship r1: connects to itself",
      "Relationship r4: connects to itself",
      "Relationships form a cycle: r2 → r3 → r2",
    ]);
  });

  it("finds longer cycles through sources and targets", () => {
    const a = Archimate.create("Test");
    const element = a.upsertElement("A", "BusinessActor");
    a.getRelationships().push(
      { identifier: "r1", type: "Association", source: element.identifier, target: "r2" },
      { identifier: "r2", type: "Association", source: "r3", target: element.identifier },
      { identifier: "r3", type: "Association", source: element.identifier, target: "r1" },
    );

    const result = validator.validate(a, { checkReferences: true });

    expect(result.warnings).toEqual(["Relationships form a cycle: r1 → r2 → r3 → r1"]);
  });

  it("does not warn about relationships that point to other relationships without a cycle", () => {
    const a = Archimate.create("Test");
    const src = a.upsertElement("Src", "ApplicationComponent");
    const tgt = a.upsertElement("Tgt", "Capability");
    const realization = a.upsertRelationship(src.identifier, tgt.identifier, "Realization");
    const first = a.upsertRelationship(src.identifier, realization.identifier, "Association");
    a.upsertRelationship(first.identifier, realization.identifier, "Association");

    const result = validator.validate(a, { checkReferences: true });

    expect(result.success).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("rejects relationship attributes on the wrong relationship type", () => {
    const a = Archimate.create("Test");
    const src = a.upsertElement("Src", "ApplicationComponent");
    const tgt = a.upsertElement("Tgt", "DataObject");
    const serving = a.upsertRelationship(src.identifier, tgt.identifier, "Serving");
    serving.accessType = "Read";
    serving.modifier = "+";
    serving.isDirected = true;

    const result = validator.validate(a);

    expect(result.success).toBe(false);
    expect(result.errors.join(" ")).toContain("accessType is only allowed on Access relationships");
    expect(result.errors.join(" ")).toContain(
      "modifier is only allowed on Influence relationships",
    );
    expect(result.errors.join(" ")).toContain(
      "isDirected is only allowed on Association relationships",
    );
  });

  it("rejects an invalid accessType", () => {
    const a = Archimate.create("Test");
    const src = a.upsertElement("Src", "ApplicationComponent");
    const tgt = a.upsertElement("Tgt", "DataObject");
    const access = a.upsertRelationship(src.identifier, tgt.identifier, "Access");
    (access as { accessType?: string }).accessType = "Readwrite";

    const result = validator.validate(a);

    expect(result.success).toBe(false);
    expect(result.errors.join(" ")).toContain("accessType");
  });

  it("detects missing property, organization, node, and connection references", () => {
    const a = Archimate.create("Test");
    const element = a.upsertElement("Element", "ApplicationComponent");
    element.properties = [{ definitionRef: "missing-property", value: "value" }];
    a.toObject().organizations.push({ identifierRef: "missing-organization" });
    a.getViews().push({
      identifier: "view-1",
      name: "View",
      nodes: [{ identifier: "node-1", elementRef: "missing-element" }],
      connections: [
        {
          identifier: "connection-1",
          relationshipRef: "missing-relationship",
          source: "node-1",
          target: "missing-node",
        },
      ],
    });

    const result = validator.validate(a, { checkReferences: true });

    expect(result.success).toBe(false);
    expect(result.errors.join(" ")).toContain("missing-property");
    expect(result.errors.join(" ")).toContain("missing-organization");
    expect(result.errors.join(" ")).toContain("missing-element");
    expect(result.errors.join(" ")).toContain("missing-relationship");
    expect(result.errors.join(" ")).toContain("missing-node");
  });

  it("detects missing property definitions on model-level properties", () => {
    const a = Archimate.create("Test");
    a.toObject().properties = [{ definitionRef: "missing-model-property", value: "value" }];

    const result = validator.validate(a, { checkReferences: true });

    expect(result.success).toBe(false);
    expect(result.errors.join(" ")).toContain("missing-model-property");
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
