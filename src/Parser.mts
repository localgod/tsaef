import { XMLParser } from "fast-xml-parser";
import { Archimate } from "./Archimate.mjs";
import type { Model } from "./interfaces/Model.mjs";
import type { Element } from "./interfaces/Element.mjs";
import type { Relationship } from "./interfaces/Relationship.mjs";
import type { Property } from "./interfaces/Property.mjs";
import type { PropertyDefinition } from "./interfaces/PropertyDefinition.mjs";
import type { Organization } from "./interfaces/Organization.mjs";
import type { View } from "./interfaces/View.mjs";
import type { Node } from "./interfaces/Node.mjs";
import type { Connection } from "./interfaces/Connection.mjs";

const ARRAY_TAGS = new Set([
  "element",
  "relationship",
  "property",
  "propertyDefinition",
  "item",
  "view",
  "node",
  "connection",
]);

const PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  parseAttributeValue: false,
  isArray: (name: string) => ARRAY_TAGS.has(name),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawNode = Record<string, any>;

export class Parser {
  static parse(xml: string): Archimate {
    try {
      const parser = new XMLParser(PARSER_OPTIONS);
      const raw: RawNode = parser.parse(xml);
      const rawModel: RawNode = raw["model"] ?? raw;
      return new Archimate(Parser.mapModel(rawModel));
    } catch (error) {
      throw new Error("Failed to parse AEF XML", { cause: error });
    }
  }

  private static mapModel(raw: RawNode): Model {
    return {
      identifier: raw["@_identifier"] ?? "",
      xmlns: raw["@_xmlns"],
      xsiNamespace: raw["@_xmlns:xsi"],
      schemaLocation: raw["@_xsi:schemaLocation"],
      name: Parser.getText(raw["name"]),
      lang: Parser.getLang(raw["name"]),
      documentation: raw["documentation"] ? Parser.getText(raw["documentation"]) : undefined,
      elements: Parser.asArray(raw["elements"]?.["element"]).map(Parser.mapElement),
      relationships: Parser.asArray(raw["relationships"]?.["relationship"]).map(
        Parser.mapRelationship,
      ),
      propertyDefinitions: Parser.asArray(raw["propertyDefinitions"]?.["propertyDefinition"]).map(
        Parser.mapPropertyDefinition,
      ),
      organizations: Parser.asArray(raw["organizations"]?.["item"]).map(Parser.mapOrganization),
      views: Parser.asArray(raw["views"]?.["diagrams"]?.["view"]).map(Parser.mapView),
    };
  }

  private static mapElement(raw: RawNode): Element {
    const el: Element = {
      identifier: raw["@_identifier"] ?? "",
      type: raw["@_xsi:type"] ?? "",
      name: Parser.getText(raw["name"]),
      lang: Parser.getLang(raw["name"]),
    };
    if (raw["documentation"]) el.documentation = Parser.getText(raw["documentation"]);
    const props = Parser.asArray(raw["properties"]?.["property"]).map(Parser.mapProperty);
    if (props.length > 0) el.properties = props;
    return el;
  }

  private static mapRelationship(raw: RawNode): Relationship {
    const rel: Relationship = {
      identifier: raw["@_identifier"] ?? "",
      type: raw["@_xsi:type"] ?? "",
      source: raw["@_source"] ?? "",
      target: raw["@_target"] ?? "",
    };
    if (raw["name"]) rel.name = Parser.getText(raw["name"]);
    if (raw["documentation"]) rel.documentation = Parser.getText(raw["documentation"]);
    const props = Parser.asArray(raw["properties"]?.["property"]).map(Parser.mapProperty);
    if (props.length > 0) rel.properties = props;
    return rel;
  }

  private static mapProperty(raw: RawNode): Property {
    return {
      definitionRef: raw["@_propertyDefinitionRef"] ?? "",
      value: Parser.getText(raw["value"]),
      lang: Parser.getLang(raw["value"]),
    };
  }

  private static mapPropertyDefinition(raw: RawNode): PropertyDefinition {
    return {
      identifier: raw["@_identifier"] ?? "",
      type: raw["@_type"] ?? "string",
      name: Parser.getText(raw["name"]),
    };
  }

  private static mapOrganization(raw: RawNode): Organization {
    const org: Organization = {};
    if (raw["@_identifierRef"]) org.identifierRef = raw["@_identifierRef"];
    if (raw["label"]) {
      org.label = Parser.getText(raw["label"]);
      org.lang = Parser.getLang(raw["label"]);
    }
    const items = Parser.asArray(raw["item"]).map(Parser.mapOrganization);
    if (items.length > 0) org.items = items;
    return org;
  }

  private static mapView(raw: RawNode): View {
    const view: View = {
      identifier: raw["@_identifier"] ?? "",
      type: raw["@_xsi:type"],
      name: Parser.getText(raw["name"]),
      lang: Parser.getLang(raw["name"]),
    };
    if (raw["@_viewpoint"]) view.viewpoint = raw["@_viewpoint"];
    const nodes = Parser.asArray(raw["node"]).map(Parser.mapNode);
    if (nodes.length > 0) view.nodes = nodes;
    const connections = Parser.asArray(raw["connection"]).map(Parser.mapConnection);
    if (connections.length > 0) view.connections = connections;
    const props = Parser.asArray(raw["properties"]?.["property"]).map(Parser.mapProperty);
    if (props.length > 0) view.properties = props;
    return view;
  }

  private static mapNode(raw: RawNode): Node {
    const node: Node = {
      identifier: raw["@_identifier"] ?? "",
      type: raw["@_xsi:type"],
      elementRef: raw["@_elementRef"],
    };
    if (raw["@_x"] !== undefined) node.x = Number(raw["@_x"]);
    if (raw["@_y"] !== undefined) node.y = Number(raw["@_y"]);
    if (raw["@_w"] !== undefined) node.w = Number(raw["@_w"]);
    if (raw["@_h"] !== undefined) node.h = Number(raw["@_h"]);
    if (raw["label"]) node.label = Parser.getText(raw["label"]);
    const childNodes = Parser.asArray(raw["node"]).map(Parser.mapNode);
    if (childNodes.length > 0) node.nodes = childNodes;
    return node;
  }

  private static mapConnection(raw: RawNode): Connection {
    const conn: Connection = {
      identifier: raw["@_identifier"] ?? "",
      type: raw["@_xsi:type"],
      relationshipRef: raw["@_relationshipRef"] ?? "",
      source: raw["@_source"] ?? "",
      target: raw["@_target"] ?? "",
    };
    if (raw["label"]) conn.label = Parser.getText(raw["label"]);
    return conn;
  }

  private static getText(value: unknown): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      const obj = value as RawNode;
      return String(obj["#text"] ?? obj["_"] ?? "");
    }
    return String(value);
  }

  private static getLang(value: unknown): string | undefined {
    if (!value || typeof value !== "object") return undefined;
    const obj = value as RawNode;
    return obj["@_xml:lang"] as string | undefined;
  }

  private static asArray<T>(value: T | T[] | undefined): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }
}
