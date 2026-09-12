import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Parser } from "../src/Parser.mjs";
import { Serializer } from "../src/Serializer.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = readFileSync(resolve(__dirname, "fixtures/basic.xml"), "utf-8");
const GENERIC = readFileSync(resolve(__dirname, "fixtures/generic.xml"), "utf-8");
const LANGUAGE_FIXTURE = `
<model xmlns="http://www.opengroup.org/xsd/archimate/3.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengroup.org/xsd/archimate/3.0/ http://www.opengroup.org/xsd/archimate/3.1/archimate3_Diagram.xsd" identifier="model-1">
  <name xml:lang="en">Model</name>
  <documentation xml:lang="da">Model documentation</documentation>
  <elements>
    <element identifier="element-1" xsi:type="ApplicationComponent">
      <name xml:lang="en">Element</name>
      <documentation xml:lang="da">Element documentation</documentation>
    </element>
  </elements>
  <relationships>
    <relationship identifier="relationship-1" xsi:type="Association" source="element-1" target="element-1">
      <name xml:lang="da">Relationship</name>
      <documentation xml:lang="da">Relationship documentation</documentation>
    </relationship>
  </relationships>
  <propertyDefinitions />
  <views>
    <diagrams>
      <view identifier="view-1" xsi:type="Diagram">
        <name xml:lang="en">View</name>
        <node identifier="node-1" xsi:type="Element" elementRef="element-1">
          <label xml:lang="da">Node label</label>
        </node>
        <connection identifier="connection-1" xsi:type="Connection" relationshipRef="relationship-1" source="node-1" target="node-1">
          <label xml:lang="da">Connection label</label>
        </connection>
      </view>
    </diagrams>
  </views>
</model>`;

function expectRoundtrip(xml: string): void {
  const first = Parser.parse(xml);
  const second = Parser.parse(Serializer.serialize(first));
  expect(second.toObject()).toEqual(first.toObject());
}

describe("Roundtrip: parse → serialize → parse", () => {
  it("preserves the basic fixture", () => {
    expectRoundtrip(FIXTURE);
  });

  it("preserves language attributes for supported text fields", () => {
    expectRoundtrip(LANGUAGE_FIXTURE);
  });
});

describe("Roundtrip: generic fixture (extra namespaces)", () => {
  it("parses without throwing", () => {
    expect(() => Parser.parse(GENERIC)).not.toThrow();
  });

  it("preserves the normalized model through roundtrip", () => {
    expectRoundtrip(GENERIC);
  });
});
