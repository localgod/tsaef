import { describe, it, expect } from "vitest";
import { Archimate } from "../src/Archimate.mjs";

describe("Archimate.create", () => {
  it("creates a model with the given name", () => {
    const a = Archimate.create("Test Model");
    expect(a.getName()).toBe("Test Model");
    expect(a.getId()).toMatch(/^id-[a-f0-9]{32}$/);
  });

  it("uses a provided identifier", () => {
    const a = Archimate.create("Model", "my-id");
    expect(a.getId()).toBe("my-id");
  });

  it("starts with empty collections", () => {
    const a = Archimate.create("Model");
    expect(a.getElements()).toHaveLength(0);
    expect(a.getRelationships()).toHaveLength(0);
    expect(a.getViews()).toHaveLength(0);
    expect(a.getPropertyDefinitions()).toHaveLength(0);
  });
});

describe("Element operations", () => {
  it("upserts elements by name+type", () => {
    const a = Archimate.create("Model");
    const e1 = a.upsertElement("App A", "ApplicationComponent");
    const e2 = a.upsertElement("App A", "ApplicationComponent");
    expect(e1.identifier).toBe(e2.identifier);
    expect(a.getElements()).toHaveLength(1);
  });

  it("creates distinct elements for different types", () => {
    const a = Archimate.create("Model");
    a.upsertElement("Item", "ApplicationComponent");
    a.upsertElement("Item", "Capability");
    expect(a.getElements()).toHaveLength(2);
  });

  it("finds element by id", () => {
    const a = Archimate.create("Model");
    const el = a.upsertElement("Test", "Node");
    expect(a.getElementById(el.identifier)).toBe(el);
    expect(a.getElementById("missing")).toBeUndefined();
  });

  it("finds elements by type", () => {
    const a = Archimate.create("Model");
    a.upsertElement("A", "ApplicationComponent");
    a.upsertElement("B", "ApplicationComponent");
    a.upsertElement("C", "Capability");
    expect(a.findElementsByType("ApplicationComponent")).toHaveLength(2);
    expect(a.findElementsByType("Capability")).toHaveLength(1);
  });
});

describe("Relationship operations", () => {
  it("upserts relationships by source+target+type", () => {
    const a = Archimate.create("Model");
    const src = a.upsertElement("Src", "ApplicationComponent");
    const tgt = a.upsertElement("Tgt", "Capability");
    const r1 = a.upsertRelationship(src.identifier, tgt.identifier, "Realization");
    const r2 = a.upsertRelationship(src.identifier, tgt.identifier, "Realization");
    expect(r1.identifier).toBe(r2.identifier);
    expect(a.getRelationships()).toHaveLength(1);
  });

  it("finds relationships for an element", () => {
    const a = Archimate.create("Model");
    const src = a.upsertElement("Src", "ApplicationComponent");
    const tgt = a.upsertElement("Tgt", "Capability");
    a.upsertRelationship(src.identifier, tgt.identifier, "Realization");
    expect(a.findRelationshipsForElement(src.identifier, "source")).toHaveLength(1);
    expect(a.findRelationshipsForElement(tgt.identifier, "target")).toHaveLength(1);
    expect(a.findRelationshipsForElement(src.identifier, "target")).toHaveLength(0);
  });
});

describe("Property operations", () => {
  it("adds a property and auto-creates a definition", () => {
    const a = Archimate.create("Model");
    const el = a.upsertElement("App", "ApplicationComponent");
    a.addProperty(el, "vendor", "Acme");
    expect(el.properties).toHaveLength(1);
    expect(el.properties![0].value).toBe("Acme");
    expect(a.getPropertyDefinitions()).toHaveLength(1);
    expect(a.getPropertyDefinitions()[0].name).toBe("vendor");
  });

  it("updates an existing property value", () => {
    const a = Archimate.create("Model");
    const el = a.upsertElement("App", "ApplicationComponent");
    a.addProperty(el, "status", "Active");
    a.addProperty(el, "status", "Inactive");
    expect(el.properties).toHaveLength(1);
    expect(el.properties![0].value).toBe("Inactive");
  });

  it("removes a property", () => {
    const a = Archimate.create("Model");
    const el = a.upsertElement("App", "ApplicationComponent");
    a.addProperty(el, "tag", "value");
    a.removeProperty(el, "tag");
    expect(el.properties).toBeUndefined();
  });

  it("reuses the same property definition for multiple elements", () => {
    const a = Archimate.create("Model");
    const e1 = a.upsertElement("A", "ApplicationComponent");
    const e2 = a.upsertElement("B", "ApplicationComponent");
    a.addProperty(e1, "env", "prod");
    a.addProperty(e2, "env", "dev");
    expect(a.getPropertyDefinitions()).toHaveLength(1);
  });
});

describe("cleanupEmptyProperties", () => {
  it("removes empty properties arrays", () => {
    const a = Archimate.create("Model");
    const el = a.upsertElement("App", "ApplicationComponent");
    el.properties = [];
    a.cleanupEmptyProperties();
    expect(el.properties).toBeUndefined();
  });
});

describe("Element lookup helpers", () => {
  it("finds element by name", () => {
    const a = Archimate.create("Model");
    const el = a.upsertElement("Widget", "ApplicationComponent");
    expect(a.getElementByName("Widget")).toBe(el);
    expect(a.getElementByName("Nope")).toBeUndefined();
  });

  it("finds elements by name (multiple)", () => {
    const a = Archimate.create("Model");
    a.upsertElement("Same", "ApplicationComponent");
    a.upsertElement("Same", "Capability");
    expect(a.findElementsByName("Same")).toHaveLength(2);
    expect(a.findElementsByName("Other")).toHaveLength(0);
  });

  it("finds elements with a matching property value", () => {
    const a = Archimate.create("Model");
    const e1 = a.upsertElement("A", "ApplicationComponent");
    const e2 = a.upsertElement("B", "ApplicationComponent");
    a.addProperty(e1, "env", "prod");
    a.addProperty(e2, "env", "dev");
    expect(a.findElementsWithProperty("env", "prod")).toHaveLength(1);
    expect(a.findElementsWithProperty("env", "prod")[0]).toBe(e1);
    expect(a.findElementsWithProperty("env", "staging")).toHaveLength(0);
    expect(a.findElementsWithProperty("unknown", "val")).toHaveLength(0);
  });
});

describe("Relationship lookup helpers", () => {
  it("finds relationship by id", () => {
    const a = Archimate.create("Model");
    const src = a.upsertElement("Src", "ApplicationComponent");
    const tgt = a.upsertElement("Tgt", "Capability");
    const rel = a.upsertRelationship(src.identifier, tgt.identifier, "Association");
    expect(a.getRelationshipById(rel.identifier)).toBe(rel);
    expect(a.getRelationshipById("missing")).toBeUndefined();
  });

  it("checks if a relationship exists", () => {
    const a = Archimate.create("Model");
    const src = a.upsertElement("Src", "ApplicationComponent");
    const tgt = a.upsertElement("Tgt", "Capability");
    a.upsertRelationship(src.identifier, tgt.identifier, "Association");
    expect(a.hasRelationship(src.identifier, tgt.identifier, "Association")).toBe(true);
    expect(a.hasRelationship(src.identifier, tgt.identifier, "Realization")).toBe(false);
  });
});

describe("Property lookup helper", () => {
  it("gets a property by name", () => {
    const a = Archimate.create("Model");
    const el = a.upsertElement("App", "ApplicationComponent");
    a.addProperty(el, "color", "blue");
    const prop = a.getPropertyByName(el, "color");
    expect(prop).toBeDefined();
    expect(prop!.value).toBe("blue");
    expect(a.getPropertyByName(el, "size")).toBeUndefined();
  });
});

describe("View operations", () => {
  it("returns empty views initially", () => {
    const a = Archimate.create("Model");
    expect(a.getViews()).toHaveLength(0);
  });

  it("retrieves views by id and name", () => {
    const a = Archimate.create("Model");
    a.getViews().push({ identifier: "v1", name: "Main View", type: "Diagram" });
    expect(a.getViewById("v1")?.name).toBe("Main View");
    expect(a.getViewByName("Main View")?.identifier).toBe("v1");
    expect(a.getViewById("vX")).toBeUndefined();
    expect(a.getViewByName("Other")).toBeUndefined();
  });
});
