import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Parser } from "../src/Parser.mjs";
import { Serializer } from "../src/Serializer.mjs";
import { xsdErrors } from "./xsd.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXAMPLES_DIR = resolve(__dirname, "fixtures/opengroup/examples");
const EXAMPLES = readdirSync(EXAMPLES_DIR).filter((name) => name.endsWith(".xml"));
const readExample = (name: string) => readFileSync(resolve(EXAMPLES_DIR, name), "utf-8");

const DOCUMENTED_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<model xmlns="http://www.opengroup.org/xsd/archimate/3.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengroup.org/xsd/archimate/3.0/ http://www.opengroup.org/xsd/archimate/3.1/archimate3_Diagram.xsd" identifier="model-1">
  <name xml:lang="en">Model</name>
  <documentation xml:lang="en">Model documentation</documentation>
  <properties>
    <property propertyDefinitionRef="propdef-1">
      <value xml:lang="en">Model property</value>
    </property>
  </properties>
  <elements>
    <element identifier="element-1" xsi:type="ApplicationComponent">
      <name xml:lang="en">Element</name>
    </element>
    <element identifier="element-2" xsi:type="Grouping">
      <name xml:lang="en">Group</name>
    </element>
  </elements>
  <relationships>
    <relationship identifier="relationship-1" xsi:type="Association" source="element-1" target="element-2" />
  </relationships>
  <organizations>
    <item>
      <label xml:lang="en">Folder</label>
      <documentation xml:lang="da">Folder documentation</documentation>
      <item identifierRef="element-1" />
    </item>
  </organizations>
  <propertyDefinitions>
    <propertyDefinition identifier="propdef-1" type="string">
      <name>Owner</name>
    </propertyDefinition>
  </propertyDefinitions>
  <views>
    <diagrams>
      <view identifier="view-1" xsi:type="Diagram">
        <name xml:lang="en">View</name>
        <documentation xml:lang="en">View documentation</documentation>
        <properties>
          <property propertyDefinitionRef="propdef-1">
            <value>View property</value>
          </property>
        </properties>
        <node identifier="node-1" xsi:type="Element" elementRef="element-2" x="0" y="0" w="300" h="200">
          <label xml:lang="en">Group node</label>
          <documentation xml:lang="en">Node documentation</documentation>
          <node identifier="node-2" xsi:type="Element" elementRef="element-1" x="10" y="10" w="120" h="55">
            <documentation>Nested node documentation</documentation>
          </node>
        </node>
        <connection identifier="connection-1" xsi:type="Relationship" relationshipRef="relationship-1" source="node-2" target="node-1">
          <label xml:lang="en">Connection</label>
          <documentation xml:lang="en">Connection documentation</documentation>
        </connection>
      </view>
    </diagrams>
  </views>
</model>`;

function roundtrip(xml: string) {
  const first = Parser.parse(xml);
  const serialized = Serializer.serialize(first);
  const second = Parser.parse(serialized);
  return { first, second, serialized };
}

describe("XSD: Open Group example models", () => {
  it.each(EXAMPLES)("%s is valid against the XSD as shipped", async (name) => {
    expect(await xsdErrors(readExample(name))).toEqual([]);
  });

  it.each(EXAMPLES)("%s round-trips and serializes to valid XML", async (name) => {
    const { first, second, serialized } = roundtrip(readExample(name));
    expect(second.toObject()).toEqual(first.toObject());
    expect(await xsdErrors(serialized)).toEqual([]);
  });

  it("keeps view documentation from Model_View.xml", () => {
    const { second } = roundtrip(readExample("Model_View.xml"));
    const view = second.toObject().views[0];
    expect(view.documentation).toBe("Basic Documentation");
    expect(view.documentationLang).toBe("en");
  });

  it("keeps model properties from Basic_Model_Properties.xml", () => {
    const { second } = roundtrip(readExample("Basic_Model_Properties.xml"));
    expect(second.toObject().properties).toEqual([
      { definitionRef: "propdef-2", value: "A new property value", lang: undefined },
    ]);
  });
});

describe("XSD: documentation on views, organizations, nodes and connections", () => {
  it("fixture is valid against the XSD", async () => {
    expect(await xsdErrors(DOCUMENTED_FIXTURE)).toEqual([]);
  });

  it("round-trips every new field and serializes to valid XML", async () => {
    const { first, second, serialized } = roundtrip(DOCUMENTED_FIXTURE);
    expect(second.toObject()).toEqual(first.toObject());
    expect(await xsdErrors(serialized)).toEqual([]);

    const model = second.toObject();
    expect(model.properties).toEqual([
      { definitionRef: "propdef-1", value: "Model property", lang: "en" },
    ]);
    expect(model.organizations[0]).toMatchObject({
      documentation: "Folder documentation",
      documentationLang: "da",
    });

    const view = model.views[0];
    expect(view).toMatchObject({
      documentation: "View documentation",
      documentationLang: "en",
    });
    const node = view.nodes![0];
    expect(node).toMatchObject({ documentation: "Node documentation", documentationLang: "en" });
    expect(node.nodes![0].documentation).toBe("Nested node documentation");
    expect(node.nodes![0].documentationLang).toBeUndefined();
    expect(view.connections![0]).toMatchObject({
      documentation: "Connection documentation",
      documentationLang: "en",
    });
  });
});
