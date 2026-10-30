import { describe, it, expect } from "vite-plus/test";
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
        { identifier: "node-src", elementRef: src.identifier, x: 0, y: 0, w: 120, h: 55 },
        { identifier: "node-tgt", elementRef: tgt.identifier, x: 0, y: 0, w: 120, h: 55 },
        { identifier: "node-note", elementRef: note.identifier, x: 0, y: 0, w: 120, h: 55 },
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

  it("checks relationshipRef against the connection type", () => {
    const a = Archimate.create("Test");
    const src = a.upsertElement("Src", "ApplicationComponent");
    const tgt = a.upsertElement("Tgt", "Capability");
    const rel = a.upsertRelationship(src.identifier, tgt.identifier, "Realization");
    a.getViews().push({
      identifier: "view-1",
      name: "View",
      nodes: [
        { identifier: "node-src", elementRef: src.identifier, x: 0, y: 0, w: 120, h: 55 },
        { identifier: "node-tgt", elementRef: tgt.identifier, x: 0, y: 0, w: 120, h: 55 },
      ],
      connections: [
        { identifier: "conn-no-ref", type: "Relationship", source: "node-src", target: "node-tgt" },
        {
          identifier: "line-with-ref",
          type: "Line",
          relationshipRef: rel.identifier,
          source: "node-src",
          target: "node-tgt",
        },
        { identifier: "line-ok", type: "Line", source: "node-src", target: "node-tgt" },
      ],
    });

    const result = validator.validate(a, { checkReferences: true });

    expect(result.errors).toEqual([
      "Connection conn-no-ref: Relationship connection has no relationshipRef",
      "Connection line-with-ref: Line connection cannot have a relationshipRef",
    ]);
  });

  it("reports view style and position values outside the XSD ranges", () => {
    const a = Archimate.create("Test");
    const element = a.upsertElement("E", "BusinessActor");
    const rel = a.upsertRelationship(element.identifier, element.identifier, "Association");
    a.getViews().push({
      identifier: "view-1",
      name: "View",
      nodes: [
        {
          identifier: "n1",
          elementRef: element.identifier,
          x: -1,
          y: 0.5,
          w: 0,
          h: 10,
          style: {
            lineWidth: 0,
            fillColor: { r: 300, g: -1, b: 1.5, a: 150 },
            font: { size: 10.3, style: "bold heavy", color: { r: 0, g: 0, b: 256 } },
          },
          nodes: [{ identifier: "n2", elementRef: element.identifier, x: 0, y: 0 }],
        },
      ],
      connections: [
        {
          identifier: "c1",
          relationshipRef: rel.identifier,
          source: "n1",
          target: "n2",
          style: { lineColor: { r: 0, g: 0, b: 0, a: 101 }, font: { size: 0.5 } },
          bendpoints: [
            { x: 10, y: 10 },
            { x: -5, y: 2.5 },
          ],
        },
      ],
    });

    const result = validator.validate(a);

    expect(result.success).toBe(false);
    expect(result.errors).toEqual([
      "Node n1: x must be a whole number ≥ 0",
      "Node n1: y must be a whole number ≥ 0",
      "Node n1: w must be a whole number ≥ 1",
      "Node n1: lineWidth must be a whole number ≥ 1",
      "Node n1: fillColor.r must be a whole number 0–255",
      "Node n1: fillColor.g must be a whole number 0–255",
      "Node n1: fillColor.b must be a whole number 0–255",
      "Node n1: fillColor.a must be a whole number 0–100",
      "Node n1: font.size must be at least 1, in steps of 0.5",
      "Node n1: font.style 'heavy' is not one of plain, bold, italic, underline",
      "Node n1: font.color.b must be a whole number 0–255",
      "Node n2: w is required",
      "Node n2: h is required",
      "Connection c1: lineColor.a must be a whole number 0–100",
      "Connection c1: font.size must be at least 1, in steps of 0.5",
      "Connection c1: bendpoints[1].x must be a whole number ≥ 0",
      "Connection c1: bendpoints[1].y must be a whole number ≥ 0",
    ]);
  });

  it("accepts view values at the edges of the XSD ranges", () => {
    const a = Archimate.create("Test");
    const element = a.upsertElement("E", "BusinessActor");
    a.getViews().push({
      identifier: "view-1",
      name: "View",
      nodes: [
        {
          identifier: "n1",
          elementRef: element.identifier,
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          style: {
            lineWidth: 1,
            fillColor: { r: 0, g: 255, b: 128, a: 0 },
            lineColor: { r: 255, g: 255, b: 255, a: 100 },
            font: { size: 1.5, style: "plain bold italic underline" },
          },
        },
      ],
    });

    const result = validator.validate(a);

    expect(result.errors).toEqual([]);
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
