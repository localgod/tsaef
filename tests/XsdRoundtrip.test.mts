import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Parser } from "../src/Parser.mjs";
import { Serializer } from "../src/Serializer.mjs";
import { Validator } from "../src/Validator.mjs";
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

const MULTI_LANGUAGE_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<model xmlns="http://www.opengroup.org/xsd/archimate/3.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengroup.org/xsd/archimate/3.0/ http://www.opengroup.org/xsd/archimate/3.1/archimate3_Diagram.xsd" identifier="model-1">
  <name xml:lang="en">Model</name>
  <name xml:lang="da">Model DA</name>
  <documentation xml:lang="en">Model docs</documentation>
  <documentation xml:lang="da">Model docs DA</documentation>
  <properties>
    <property propertyDefinitionRef="propdef-1">
      <value xml:lang="en">Value</value>
      <value xml:lang="da">Value DA</value>
    </property>
  </properties>
  <elements>
    <element identifier="element-1" xsi:type="BusinessActor">
      <name xml:lang="en">Element</name>
      <name xml:lang="da">Element DA</name>
      <documentation xml:lang="en">Element docs</documentation>
      <documentation xml:lang="da">Element docs DA</documentation>
    </element>
  </elements>
  <relationships>
    <relationship identifier="relationship-1" xsi:type="Association" source="element-1" target="element-1">
      <name xml:lang="en">Relationship</name>
      <name xml:lang="da">Relationship DA</name>
      <documentation xml:lang="en">Relationship docs</documentation>
      <documentation>Relationship docs, no lang</documentation>
    </relationship>
  </relationships>
  <organizations>
    <item>
      <label xml:lang="en">Folder</label>
      <label xml:lang="da">Folder DA</label>
      <documentation xml:lang="en">Folder docs</documentation>
      <documentation xml:lang="da">Folder docs DA</documentation>
      <item identifierRef="element-1" />
    </item>
  </organizations>
  <propertyDefinitions>
    <propertyDefinition identifier="propdef-1" type="string">
      <name xml:lang="en">Owner</name>
      <name xml:lang="da">Ejer</name>
    </propertyDefinition>
  </propertyDefinitions>
  <views>
    <diagrams>
      <view identifier="view-1" xsi:type="Diagram">
        <name xml:lang="en">View</name>
        <name xml:lang="da">View DA</name>
        <documentation xml:lang="en">View docs</documentation>
        <documentation xml:lang="da">View docs DA</documentation>
        <node identifier="node-1" xsi:type="Element" elementRef="element-1" x="0" y="0" w="120" h="55">
          <label xml:lang="en">Node</label>
          <label xml:lang="da">Node DA</label>
          <documentation xml:lang="en">Node docs</documentation>
          <documentation xml:lang="da">Node docs DA</documentation>
        </node>
        <connection identifier="connection-1" xsi:type="Relationship" relationshipRef="relationship-1" source="node-1" target="node-1">
          <label xml:lang="en">Connection</label>
          <label xml:lang="da">Connection DA</label>
          <documentation xml:lang="en">Connection docs</documentation>
          <documentation xml:lang="da">Connection docs DA</documentation>
        </connection>
      </view>
    </diagrams>
  </views>
</model>`;

const RELATIONSHIP_ATTRIBUTES_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<model xmlns="http://www.opengroup.org/xsd/archimate/3.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengroup.org/xsd/archimate/3.0/ http://www.opengroup.org/xsd/archimate/3.1/archimate3_Diagram.xsd" identifier="model-1">
  <name xml:lang="en">Model</name>
  <elements>
    <element identifier="app" xsi:type="ApplicationComponent"><name>App</name></element>
    <element identifier="data" xsi:type="DataObject"><name>Data</name></element>
    <element identifier="goal" xsi:type="Goal"><name>Goal</name></element>
    <element identifier="driver" xsi:type="Driver"><name>Driver</name></element>
    <element identifier="note" xsi:type="BusinessObject"><name>Note</name></element>
  </elements>
  <relationships>
    <relationship identifier="access" xsi:type="Access" source="app" target="data" accessType="ReadWrite" />
    <relationship identifier="access-default" xsi:type="Access" source="app" target="data" />
    <relationship identifier="influence" xsi:type="Influence" source="driver" target="goal" modifier="++" />
    <relationship identifier="association" xsi:type="Association" source="note" target="access" isDirected="true" />
    <relationship identifier="association-numeric" xsi:type="Association" source="note" target="goal" isDirected="0" />
  </relationships>
  <views>
    <diagrams>
      <view identifier="view-1" xsi:type="Diagram">
        <name xml:lang="en">View</name>
        <node identifier="node-app" xsi:type="Element" elementRef="app" x="0" y="0" w="120" h="55" />
        <node identifier="node-data" xsi:type="Element" elementRef="data" x="300" y="0" w="120" h="55" />
        <node identifier="node-note" xsi:type="Element" elementRef="note" x="150" y="150" w="120" h="55" />
        <connection identifier="conn-access" xsi:type="Relationship" relationshipRef="access" source="node-app" target="node-data" />
        <connection identifier="conn-association" xsi:type="Relationship" relationshipRef="association" source="node-note" target="conn-access" />
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

describe("XSD: multi-language text", () => {
  it("fixture is valid against the XSD", async () => {
    expect(await xsdErrors(MULTI_LANGUAGE_FIXTURE)).toEqual([]);
  });

  it("keeps every language through a round-trip and serializes to valid XML", async () => {
    const { first, second, serialized } = roundtrip(MULTI_LANGUAGE_FIXTURE);
    expect(second.toObject()).toEqual(first.toObject());
    expect(await xsdErrors(serialized)).toEqual([]);
    expect(serialized.match(/xml:lang="da"/g)).toHaveLength(
      MULTI_LANGUAGE_FIXTURE.match(/xml:lang="da"/g)!.length,
    );

    const da = (text: string) => [{ text, lang: "da" }];
    const model = second.toObject();
    expect(model).toMatchObject({
      name: "Model",
      lang: "en",
      nameTranslations: da("Model DA"),
      documentation: "Model docs",
      documentationLang: "en",
      documentationTranslations: da("Model docs DA"),
    });
    expect(model.properties![0]).toMatchObject({
      value: "Value",
      lang: "en",
      valueTranslations: da("Value DA"),
    });
    expect(model.elements[0]).toMatchObject({
      name: "Element",
      nameTranslations: da("Element DA"),
      documentation: "Element docs",
      documentationTranslations: da("Element docs DA"),
    });
    expect(model.relationships[0]).toMatchObject({
      name: "Relationship",
      nameLang: "en",
      nameTranslations: da("Relationship DA"),
      documentationTranslations: [{ text: "Relationship docs, no lang" }],
    });
    expect(model.organizations[0]).toMatchObject({
      label: "Folder",
      labelTranslations: da("Folder DA"),
      documentationTranslations: da("Folder docs DA"),
    });
    expect(model.propertyDefinitions[0]).toMatchObject({
      name: "Owner",
      lang: "en",
      nameTranslations: da("Ejer"),
    });
    const view = model.views[0];
    expect(view).toMatchObject({
      name: "View",
      nameTranslations: da("View DA"),
      documentationTranslations: da("View docs DA"),
    });
    expect(view.nodes![0]).toMatchObject({
      label: "Node",
      labelTranslations: da("Node DA"),
      documentationTranslations: da("Node docs DA"),
    });
    expect(view.connections![0]).toMatchObject({
      label: "Connection",
      labelTranslations: da("Connection DA"),
      documentationTranslations: da("Connection docs DA"),
    });
  });

  it("leaves translation fields unset for single-language text", () => {
    const element = Parser.parse(
      MULTI_LANGUAGE_FIXTURE.replace(/\n\s*<name xml:lang="da">Element DA<\/name>/, ""),
    ).toObject().elements[0];
    expect(element.name).toBe("Element");
    expect(element).not.toHaveProperty("nameTranslations");
  });
});

describe("XSD: relationship attributes and relationship/connection endpoints", () => {
  it("fixture is valid against the XSD", async () => {
    expect(await xsdErrors(RELATIONSHIP_ATTRIBUTES_FIXTURE)).toEqual([]);
  });

  it("round-trips accessType, modifier and isDirected and serializes to valid XML", async () => {
    const { first, second, serialized } = roundtrip(RELATIONSHIP_ATTRIBUTES_FIXTURE);
    expect(second.toObject()).toEqual(first.toObject());
    expect(await xsdErrors(serialized)).toEqual([]);

    const byId = Object.fromEntries(
      second
        .toObject()
        .relationships.map((relationship) => [relationship.identifier, relationship]),
    );
    expect(byId["access"].accessType).toBe("ReadWrite");
    expect(byId["access-default"]).not.toHaveProperty("accessType");
    expect(byId["influence"].modifier).toBe("++");
    expect(byId["association"].isDirected).toBe(true);
    expect(byId["association-numeric"].isDirected).toBe(false);
    expect(serialized).not.toMatch(/identifier="access-default"[^>]*accessType/);
  });

  it("validates relationship and connection endpoints with checkReferences", () => {
    const result = new Validator().validate(Parser.parse(RELATIONSHIP_ATTRIBUTES_FIXTURE), {
      checkReferences: true,
    });
    expect(result.errors).toEqual([]);
    expect(result.success).toBe(true);
  });
});
