import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Parser } from "../src/Parser.mjs";
import { Serializer } from "../src/Serializer.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = readFileSync(resolve(__dirname, "fixtures/basic.xml"), "utf-8");
const GENERIC = readFileSync(resolve(__dirname, "fixtures/generic.xml"), "utf-8");

describe("Roundtrip: parse → serialize → parse", () => {
  it("preserves element count", () => {
    const first = Parser.parse(FIXTURE);
    const xml = Serializer.serialize(first);
    const second = Parser.parse(xml);
    expect(second.getElements()).toHaveLength(first.getElements().length);
  });

  it("preserves relationship count", () => {
    const first = Parser.parse(FIXTURE);
    const xml = Serializer.serialize(first);
    const second = Parser.parse(xml);
    expect(second.getRelationships()).toHaveLength(first.getRelationships().length);
  });

  it("preserves element identifiers", () => {
    const first = Parser.parse(FIXTURE);
    const xml = Serializer.serialize(first);
    const second = Parser.parse(xml);
    const firstIds = first
      .getElements()
      .map((e) => e.identifier)
      .sort();
    const secondIds = second
      .getElements()
      .map((e) => e.identifier)
      .sort();
    expect(secondIds).toEqual(firstIds);
  });

  it("preserves element names", () => {
    const first = Parser.parse(FIXTURE);
    const xml = Serializer.serialize(first);
    const second = Parser.parse(xml);
    const firstNames = first
      .getElements()
      .map((e) => e.name)
      .sort();
    const secondNames = second
      .getElements()
      .map((e) => e.name)
      .sort();
    expect(secondNames).toEqual(firstNames);
  });

  it("preserves property definitions", () => {
    const first = Parser.parse(FIXTURE);
    const xml = Serializer.serialize(first);
    const second = Parser.parse(xml);
    expect(second.getPropertyDefinitions()).toHaveLength(first.getPropertyDefinitions().length);
  });

  it("preserves element properties", () => {
    const first = Parser.parse(FIXTURE);
    const appFirst = first.getElements().find((e) => e.type === "ApplicationComponent")!;
    const xml = Serializer.serialize(first);
    const second = Parser.parse(xml);
    const appSecond = second.getElements().find((e) => e.type === "ApplicationComponent")!;
    expect(appSecond.properties).toHaveLength(appFirst.properties!.length);
    expect(appSecond.properties![0].value).toBe(appFirst.properties![0].value);
  });

  it("preserves model name", () => {
    const first = Parser.parse(FIXTURE);
    const xml = Serializer.serialize(first);
    const second = Parser.parse(xml);
    expect(second.getName()).toBe(first.getName());
  });
});

describe("Roundtrip: generic fixture (extra namespaces)", () => {
  it("parses without throwing", () => {
    expect(() => Parser.parse(GENERIC)).not.toThrow();
  });

  it("preserves element count through roundtrip", () => {
    const first = Parser.parse(GENERIC);
    const xml = Serializer.serialize(first);
    const second = Parser.parse(xml);
    expect(second.getElements()).toHaveLength(first.getElements().length);
  });

  it("preserves model name through roundtrip", () => {
    const first = Parser.parse(GENERIC);
    const xml = Serializer.serialize(first);
    const second = Parser.parse(xml);
    expect(second.getName()).toBe(first.getName());
  });
});
