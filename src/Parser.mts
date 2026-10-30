import { XMLParser, XMLValidator } from "fast-xml-parser";
import { Archimate } from "./Archimate.mjs";
import { ParseError } from "./errors.mjs";
import type { Model } from "./interfaces/Model.mjs";
import type { Element } from "./interfaces/Element.mjs";
import type { Relationship } from "./interfaces/Relationship.mjs";
import type { Property } from "./interfaces/Property.mjs";
import type { LangString } from "./interfaces/LangString.mjs";
import type { PropertyDefinition } from "./interfaces/PropertyDefinition.mjs";
import type { Organization } from "./interfaces/Organization.mjs";
import type { View } from "./interfaces/View.mjs";
import type { Node } from "./interfaces/Node.mjs";
import type { Connection } from "./interfaces/Connection.mjs";
import type { Font, Point, RGBColor, Style } from "./interfaces/Style.mjs";

const ARRAY_TAGS = new Set([
  "element",
  "relationship",
  "property",
  "propertyDefinition",
  "item",
  "view",
  "node",
  "connection",
  "bendpoint",
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
      const validation = XMLValidator.validate(xml);
      if (validation !== true) {
        throw new ParseError(`Invalid XML: ${validation.err.msg}`);
      }
      const parser = new XMLParser(PARSER_OPTIONS);
      const raw: RawNode = parser.parse(xml);
      const rawModel: RawNode = raw["model"] ?? raw;
      return new Archimate(Parser.mapModel(rawModel));
    } catch (error) {
      if (error instanceof ParseError) throw error;
      throw new ParseError("Failed to parse AEF XML", { cause: error });
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
      ...Parser.translations("nameTranslations", raw["name"]),
      documentation: raw["documentation"] ? Parser.getText(raw["documentation"]) : undefined,
      documentationLang: raw["documentation"] ? Parser.getLang(raw["documentation"]) : undefined,
      ...Parser.translations("documentationTranslations", raw["documentation"]),
      ...Parser.mapProperties(raw),
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
      ...Parser.translations("nameTranslations", raw["name"]),
    };
    if (raw["documentation"]) {
      el.documentation = Parser.getText(raw["documentation"]);
      el.documentationLang = Parser.getLang(raw["documentation"]);
      Object.assign(el, Parser.translations("documentationTranslations", raw["documentation"]));
    }
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
    if (raw["@_accessType"] !== undefined) rel.accessType = raw["@_accessType"];
    if (raw["@_modifier"] !== undefined) rel.modifier = raw["@_modifier"];
    if (raw["@_isDirected"] !== undefined) {
      rel.isDirected = ["true", "1"].includes(String(raw["@_isDirected"]).trim());
    }
    if (raw["name"]) {
      rel.name = Parser.getText(raw["name"]);
      rel.nameLang = Parser.getLang(raw["name"]);
      Object.assign(rel, Parser.translations("nameTranslations", raw["name"]));
    }
    if (raw["documentation"]) {
      rel.documentation = Parser.getText(raw["documentation"]);
      rel.documentationLang = Parser.getLang(raw["documentation"]);
      Object.assign(rel, Parser.translations("documentationTranslations", raw["documentation"]));
    }
    const props = Parser.asArray(raw["properties"]?.["property"]).map(Parser.mapProperty);
    if (props.length > 0) rel.properties = props;
    return rel;
  }

  private static mapProperty(raw: RawNode): Property {
    return {
      definitionRef: raw["@_propertyDefinitionRef"] ?? "",
      value: Parser.getText(raw["value"]),
      lang: Parser.getLang(raw["value"]),
      ...Parser.translations("valueTranslations", raw["value"]),
    };
  }

  private static mapPropertyDefinition(raw: RawNode): PropertyDefinition {
    return {
      identifier: raw["@_identifier"] ?? "",
      type: raw["@_type"] ?? "string",
      name: Parser.getText(raw["name"]),
      lang: Parser.getLang(raw["name"]),
      ...Parser.translations("nameTranslations", raw["name"]),
    };
  }

  private static mapOrganization(raw: RawNode): Organization {
    const org: Organization = {};
    if (raw["@_identifierRef"]) org.identifierRef = raw["@_identifierRef"];
    if (raw["label"]) {
      org.label = Parser.getText(raw["label"]);
      org.lang = Parser.getLang(raw["label"]);
      Object.assign(org, Parser.translations("labelTranslations", raw["label"]));
    }
    if (raw["documentation"]) {
      org.documentation = Parser.getText(raw["documentation"]);
      org.documentationLang = Parser.getLang(raw["documentation"]);
      Object.assign(org, Parser.translations("documentationTranslations", raw["documentation"]));
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
      ...Parser.translations("nameTranslations", raw["name"]),
    };
    if (raw["documentation"]) {
      view.documentation = Parser.getText(raw["documentation"]);
      view.documentationLang = Parser.getLang(raw["documentation"]);
      Object.assign(view, Parser.translations("documentationTranslations", raw["documentation"]));
    }
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
    if (raw["label"]) {
      node.label = Parser.getText(raw["label"]);
      node.labelLang = Parser.getLang(raw["label"]);
      Object.assign(node, Parser.translations("labelTranslations", raw["label"]));
    }
    if (raw["documentation"]) {
      node.documentation = Parser.getText(raw["documentation"]);
      node.documentationLang = Parser.getLang(raw["documentation"]);
      Object.assign(node, Parser.translations("documentationTranslations", raw["documentation"]));
    }
    if (raw["style"]) node.style = Parser.mapStyle(raw["style"]);
    const childNodes = Parser.asArray(raw["node"]).map(Parser.mapNode);
    if (childNodes.length > 0) node.nodes = childNodes;
    return node;
  }

  private static mapConnection(raw: RawNode): Connection {
    const conn: Connection = {
      identifier: raw["@_identifier"] ?? "",
      type: raw["@_xsi:type"],
      source: raw["@_source"] ?? "",
      target: raw["@_target"] ?? "",
    };
    if (raw["@_relationshipRef"]) conn.relationshipRef = raw["@_relationshipRef"];
    if (raw["label"]) {
      conn.label = Parser.getText(raw["label"]);
      conn.labelLang = Parser.getLang(raw["label"]);
      Object.assign(conn, Parser.translations("labelTranslations", raw["label"]));
    }
    if (raw["documentation"]) {
      conn.documentation = Parser.getText(raw["documentation"]);
      conn.documentationLang = Parser.getLang(raw["documentation"]);
      Object.assign(conn, Parser.translations("documentationTranslations", raw["documentation"]));
    }
    if (raw["style"]) conn.style = Parser.mapStyle(raw["style"]);
    const bendpoints = Parser.asArray(raw["bendpoint"]).map(Parser.mapPoint);
    if (bendpoints.length > 0) conn.bendpoints = bendpoints;
    return conn;
  }

  private static mapStyle(raw: RawNode): Style {
    const style: Style = {};
    if (raw["lineColor"]) style.lineColor = Parser.mapColor(raw["lineColor"]);
    if (raw["fillColor"]) style.fillColor = Parser.mapColor(raw["fillColor"]);
    if (raw["@_lineWidth"] !== undefined) style.lineWidth = Number(raw["@_lineWidth"]);
    if (raw["font"]) {
      const rawFont: RawNode = raw["font"];
      const font: Font = {};
      if (rawFont["@_name"] !== undefined) font.name = rawFont["@_name"];
      if (rawFont["@_size"] !== undefined) font.size = Number(rawFont["@_size"]);
      if (rawFont["@_style"] !== undefined) font.style = rawFont["@_style"];
      if (rawFont["color"]) font.color = Parser.mapColor(rawFont["color"]);
      style.font = font;
    }
    return style;
  }

  private static mapColor(raw: RawNode): RGBColor {
    const color: RGBColor = {
      r: Number(raw["@_r"]),
      g: Number(raw["@_g"]),
      b: Number(raw["@_b"]),
    };
    if (raw["@_a"] !== undefined) color.a = Number(raw["@_a"]);
    return color;
  }

  private static mapPoint(raw: RawNode): Point {
    return { x: Number(raw["@_x"]), y: Number(raw["@_y"]) };
  }

  private static mapProperties(raw: RawNode): { properties?: Property[] } {
    const props = Parser.asArray(raw["properties"]?.["property"]).map(Parser.mapProperty);
    return props.length > 0 ? { properties: props } : {};
  }

  // A repeated lang string (one entry per xml:lang) parses as an array; the first
  // entry fills the primary field and the rest go into the matching *Translations field.
  private static getText(value: unknown): string {
    if (Array.isArray(value)) return Parser.getText(value[0]);
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      const obj = value as RawNode;
      return String(obj["#text"] ?? obj["_"] ?? "");
    }
    return String(value);
  }

  private static getLang(value: unknown): string | undefined {
    if (Array.isArray(value)) return Parser.getLang(value[0]);
    if (!value || typeof value !== "object") return undefined;
    const obj = value as RawNode;
    return obj["@_xml:lang"] as string | undefined;
  }

  private static translations<K extends string>(
    key: K,
    value: unknown,
  ): Partial<Record<K, LangString[]>> {
    if (!Array.isArray(value) || value.length < 2) return {};
    const rest: LangString[] = value.slice(1).map((entry) => {
      const lang = Parser.getLang(entry);
      return lang ? { text: Parser.getText(entry), lang } : { text: Parser.getText(entry) };
    });
    return { [key]: rest } as Partial<Record<K, LangString[]>>;
  }

  private static asArray<T>(value: T | T[] | undefined): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }
}
