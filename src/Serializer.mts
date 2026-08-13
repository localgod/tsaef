import { XMLBuilder } from "fast-xml-parser";
import type { Archimate } from "./Archimate.mjs";
import type { Model } from "./interfaces/Model.mjs";
import type { Element } from "./interfaces/Element.mjs";
import type { Relationship } from "./interfaces/Relationship.mjs";
import type { Property } from "./interfaces/Property.mjs";
import type { PropertyDefinition } from "./interfaces/PropertyDefinition.mjs";
import type { Organization } from "./interfaces/Organization.mjs";
import type { View } from "./interfaces/View.mjs";
import type { Node } from "./interfaces/Node.mjs";
import type { Connection } from "./interfaces/Connection.mjs";
import {
  ARCHIMATE_NAMESPACE,
  XSI_NAMESPACE,
  SCHEMA_LOCATION,
} from "./constants/archimate-types.mjs";

const BUILDER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  format: true,
  indentBy: "  ",
  suppressEmptyNode: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawNode = Record<string, any>;

export class Serializer {
  static serialize(archimate: Archimate): string {
    archimate.cleanupEmptyProperties();
    const model = archimate.toObject();
    const raw = Serializer.buildModel(model);
    const builder = new XMLBuilder(BUILDER_OPTIONS);
    const xml: string = builder.build({ model: raw });
    return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
  }

  private static buildModel(model: Model): RawNode {
    const raw: RawNode = {
      "@_xmlns": model.xmlns ?? ARCHIMATE_NAMESPACE,
      "@_xmlns:xsi": model.xsiNamespace ?? XSI_NAMESPACE,
      "@_xsi:schemaLocation": model.schemaLocation ?? SCHEMA_LOCATION,
      "@_identifier": model.identifier,
      name: Serializer.langString(model.name, model.lang),
    };

    if (model.documentation) {
      raw["documentation"] = Serializer.langString(model.documentation);
    }

    if (model.elements.length > 0) {
      raw["elements"] = { element: model.elements.map(Serializer.buildElement) };
    }

    if (model.relationships.length > 0) {
      raw["relationships"] = {
        relationship: model.relationships.map(Serializer.buildRelationship),
      };
    }

    if (model.organizations.length > 0) {
      raw["organizations"] = { item: model.organizations.map(Serializer.buildOrganization) };
    }

    if (model.propertyDefinitions.length > 0) {
      raw["propertyDefinitions"] = {
        propertyDefinition: model.propertyDefinitions.map(Serializer.buildPropertyDefinition),
      };
    }

    if (model.views.length > 0) {
      raw["views"] = { diagrams: { view: model.views.map(Serializer.buildView) } };
    }

    return raw;
  }

  private static buildElement(el: Element): RawNode {
    const raw: RawNode = {
      "@_identifier": el.identifier,
      "@_xsi:type": el.type,
      name: Serializer.langString(el.name, el.lang),
    };
    if (el.documentation) raw["documentation"] = Serializer.langString(el.documentation);
    if (el.properties && el.properties.length > 0) {
      raw["properties"] = { property: el.properties.map(Serializer.buildProperty) };
    }
    return raw;
  }

  private static buildRelationship(rel: Relationship): RawNode {
    const raw: RawNode = {
      "@_identifier": rel.identifier,
      "@_xsi:type": rel.type,
      "@_source": rel.source,
      "@_target": rel.target,
    };
    if (rel.name) raw["name"] = Serializer.langString(rel.name);
    if (rel.documentation) raw["documentation"] = Serializer.langString(rel.documentation);
    if (rel.properties && rel.properties.length > 0) {
      raw["properties"] = { property: rel.properties.map(Serializer.buildProperty) };
    }
    return raw;
  }

  private static buildProperty(prop: Property): RawNode {
    return {
      "@_propertyDefinitionRef": prop.definitionRef,
      value: Serializer.langString(prop.value, prop.lang),
    };
  }

  private static buildPropertyDefinition(def: PropertyDefinition): RawNode {
    return {
      "@_identifier": def.identifier,
      "@_type": def.type,
      name: def.name,
    };
  }

  private static buildOrganization(org: Organization): RawNode {
    const raw: RawNode = {};
    if (org.identifierRef) raw["@_identifierRef"] = org.identifierRef;
    if (org.label) raw["label"] = Serializer.langString(org.label, org.lang);
    if (org.items && org.items.length > 0) {
      raw["item"] = org.items.map(Serializer.buildOrganization);
    }
    return raw;
  }

  private static buildView(view: View): RawNode {
    const raw: RawNode = {
      "@_identifier": view.identifier,
      "@_xsi:type": view.type ?? "Diagram",
      name: Serializer.langString(view.name, view.lang),
    };
    if (view.viewpoint) raw["@_viewpoint"] = view.viewpoint;
    if (view.properties && view.properties.length > 0) {
      raw["properties"] = { property: view.properties.map(Serializer.buildProperty) };
    }
    if (view.nodes && view.nodes.length > 0) {
      raw["node"] = view.nodes.map(Serializer.buildNode);
    }
    if (view.connections && view.connections.length > 0) {
      raw["connection"] = view.connections.map(Serializer.buildConnection);
    }
    return raw;
  }

  private static buildNode(node: Node): RawNode {
    const raw: RawNode = {
      "@_identifier": node.identifier,
      "@_xsi:type": node.type ?? "Element",
    };
    if (node.elementRef) raw["@_elementRef"] = node.elementRef;
    if (node.x !== undefined) raw["@_x"] = node.x;
    if (node.y !== undefined) raw["@_y"] = node.y;
    if (node.w !== undefined) raw["@_w"] = node.w;
    if (node.h !== undefined) raw["@_h"] = node.h;
    if (node.label) raw["label"] = Serializer.langString(node.label);
    if (node.nodes && node.nodes.length > 0) {
      raw["node"] = node.nodes.map(Serializer.buildNode);
    }
    return raw;
  }

  private static buildConnection(conn: Connection): RawNode {
    const raw: RawNode = {
      "@_identifier": conn.identifier,
      "@_xsi:type": conn.type ?? "Connection",
      "@_relationshipRef": conn.relationshipRef,
      "@_source": conn.source,
      "@_target": conn.target,
    };
    if (conn.label) raw["label"] = Serializer.langString(conn.label);
    return raw;
  }

  private static langString(text: string, lang?: string): RawNode {
    const node: RawNode = { "#text": text };
    if (lang) node["@_xml:lang"] = lang;
    return node;
  }
}
