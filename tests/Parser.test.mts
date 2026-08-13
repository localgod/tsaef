import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Parser } from "../src/Parser.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = readFileSync(resolve(__dirname, "fixtures/basic.xml"), "utf-8");

describe("Parser.parse", () => {
  it("parses model metadata", () => {
    const a = Parser.parse(FIXTURE);
    expect(a.getName()).toBe("Basic");
    expect(a.getId()).toBe("id-23f8077b20654942947e7923380625de");
  });

  it("parses elements", () => {
    const a = Parser.parse(FIXTURE);
    const elements = a.getElements();
    expect(elements).toHaveLength(2);

    const capability = elements.find((e) => e.type === "Capability");
    expect(capability).toBeDefined();
    expect(capability!.name).toBe("Capability");
    expect(capability!.documentation).toBe(
      "This is a dummy capability used for testing DataWrangler",
    );

    const app = elements.find((e) => e.type === "ApplicationComponent");
    expect(app).toBeDefined();
    expect(app!.name).toBe("Application Component");
    expect(app!.properties).toHaveLength(1);
    expect(app!.properties![0].value).toBe("tytter");
  });

  it("parses relationships", () => {
    const a = Parser.parse(FIXTURE);
    const rels = a.getRelationships();
    expect(rels).toHaveLength(1);
    expect(rels[0].type).toBe("Realization");
    expect(rels[0].name).toBe("Realization");
    expect(rels[0].documentation).toBe("this is a Realization");
    expect(rels[0].properties).toHaveLength(1);
    expect(rels[0].properties![0].value).toBe("yes");
  });

  it("parses property definitions", () => {
    const a = Parser.parse(FIXTURE);
    const defs = a.getPropertyDefinitions();
    expect(defs).toHaveLength(2);
    const names = defs.map((d) => d.name);
    expect(names).toContain("test");
    expect(names).toContain("awesome");
  });

  it("parses views", () => {
    const a = Parser.parse(FIXTURE);
    const views = a.getViews();
    expect(views).toHaveLength(1);
    expect(views[0].name).toBe("Default View");
  });

  it("correctly links property definitions to element properties", () => {
    const a = Parser.parse(FIXTURE);
    const app = a.getElements().find((e) => e.type === "ApplicationComponent")!;
    const propDef = a.getPropertyDefinitions().find((d) => d.name === "test")!;
    expect(app.properties![0].definitionRef).toBe(propDef.identifier);
  });

  it("throws a descriptive error for malformed XML", () => {
    expect(() => Parser.parse("<unclosed")).toThrow("Failed to parse AEF XML");
  });
});
