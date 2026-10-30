import { describe, it, expect } from "vitest";
import { Archimate } from "../src/Archimate.mjs";
import { Serializer } from "../src/Serializer.mjs";

describe("Serializer.serialize", () => {
  it("produces a valid XML declaration", () => {
    const a = Archimate.create("Test");
    const xml = Serializer.serialize(a);
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  });

  it("includes the ArchiMate namespace", () => {
    const a = Archimate.create("Test");
    const xml = Serializer.serialize(a);
    expect(xml).toContain('xmlns="http://www.opengroup.org/xsd/archimate/3.0/"');
  });

  it("serializes model name", () => {
    const a = Archimate.create("My Model");
    const xml = Serializer.serialize(a);
    expect(xml).toContain("My Model");
  });

  it("serializes elements with type and name", () => {
    const a = Archimate.create("Test");
    a.upsertElement("App A", "ApplicationComponent", "An application");
    const xml = Serializer.serialize(a);
    expect(xml).toContain('xsi:type="ApplicationComponent"');
    expect(xml).toContain("App A");
  });

  it("serializes relationships", () => {
    const a = Archimate.create("Test");
    const src = a.upsertElement("Src", "ApplicationComponent");
    const tgt = a.upsertElement("Tgt", "Capability");
    a.upsertRelationship(src.identifier, tgt.identifier, "Realization");
    const xml = Serializer.serialize(a);
    expect(xml).toContain('xsi:type="Realization"');
  });

  it("serializes properties with definitions", () => {
    const a = Archimate.create("Test");
    const el = a.upsertElement("App", "ApplicationComponent");
    a.addProperty(el, "vendor", "Acme");
    const xml = Serializer.serialize(a);
    expect(xml).toContain("propertyDefinitionRef=");
    expect(xml).toContain("Acme");
    expect(xml).toContain("vendor");
  });

  it("writes relationship attributes only on the type that defines them", () => {
    const a = Archimate.create("Test");
    const src = a.upsertElement("Src", "ApplicationComponent");
    const tgt = a.upsertElement("Tgt", "DataObject");
    const access = a.upsertRelationship(src.identifier, tgt.identifier, "Access");
    access.accessType = "Write";
    const serving = a.upsertRelationship(src.identifier, tgt.identifier, "Serving");
    serving.accessType = "Read";
    serving.modifier = "+";
    serving.isDirected = true;

    const xml = Serializer.serialize(a);

    expect(xml).toContain('accessType="Write"');
    expect(xml).not.toContain('accessType="Read"');
    expect(xml).not.toContain("modifier=");
    expect(xml).not.toContain("isDirected=");
  });

  it("omits empty properties elements", () => {
    const a = Archimate.create("Test");
    const el = a.upsertElement("App", "ApplicationComponent");
    el.properties = [];
    const xml = Serializer.serialize(a);
    expect(xml).not.toContain("<properties");
    expect(el.properties).toEqual([]);
  });
});
