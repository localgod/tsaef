import { z } from "zod";
import type { Archimate } from "./Archimate.mjs";
import type { Organization } from "./interfaces/Organization.mjs";
import type { Property } from "./interfaces/Property.mjs";
import type { Relationship } from "./interfaces/Relationship.mjs";
import type { Node } from "./interfaces/Node.mjs";
import type { RGBColor, Style } from "./interfaces/Style.mjs";
import type { View } from "./interfaces/View.mjs";
import type { ValidationResult } from "./interfaces/ValidationIssue.mjs";
import {
  ArchiMateElementTypes,
  ArchiMateRelationshipTypes,
  AccessTypes,
  DataTypes,
  ARCHIMATE_NAMESPACE,
  XSI_NAMESPACE,
} from "./constants/archimate-types.mjs";

export interface ValidationOptions {
  strict?: boolean;
  checkReferences?: boolean;
  validateNamespaces?: boolean;
}

const PropertySchema = z.object({
  definitionRef: z.string().min(1),
  value: z.string(),
  lang: z.string().optional(),
});

const ElementSchema = z.object({
  identifier: z.string().min(1),
  type: ArchiMateElementTypes,
  name: z.string(),
  lang: z.string().optional(),
  documentation: z.string().optional(),
  properties: z.array(PropertySchema).optional(),
});

const RELATIONSHIP_ATTRIBUTE_TYPES = {
  accessType: "Access",
  modifier: "Influence",
  isDirected: "Association",
} as const;

const RelationshipSchema = z
  .object({
    identifier: z.string().min(1),
    type: ArchiMateRelationshipTypes,
    source: z.string().min(1),
    target: z.string().min(1),
    accessType: AccessTypes.optional(),
    modifier: z.string().optional(),
    isDirected: z.boolean().optional(),
    name: z.string().optional(),
    documentation: z.string().optional(),
    properties: z.array(PropertySchema).optional(),
  })
  .superRefine((relationship, ctx) => {
    for (const [attribute, type] of Object.entries(RELATIONSHIP_ATTRIBUTE_TYPES)) {
      const key = attribute as keyof typeof RELATIONSHIP_ATTRIBUTE_TYPES;
      if (relationship[key] !== undefined && relationship.type !== type) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `${attribute} is only allowed on ${type} relationships`,
        });
      }
    }
  });

const PropertyDefinitionSchema = z.object({
  identifier: z.string().min(1),
  type: DataTypes,
  name: z.string().min(1),
});

const ModelSchema = z.object({
  identifier: z.string().min(1),
  name: z.string().min(1),
  elements: z.array(ElementSchema),
  relationships: z.array(RelationshipSchema),
  propertyDefinitions: z.array(PropertyDefinitionSchema),
});

const FONT_STYLES = new Set(["plain", "bold", "italic", "underline"]);

const isWholeNumber = (value: number, min: number, max = Infinity) =>
  Number.isInteger(value) && value >= min && value <= max;

export class Validator {
  validate(archimate: Archimate, options?: ValidationOptions): ValidationResult {
    const opts: Required<ValidationOptions> = {
      strict: false,
      checkReferences: true,
      validateNamespaces: false,
      ...options,
    };

    const result: ValidationResult = { success: true, errors: [], warnings: [] };
    const model = archimate.toObject();

    const parsed = ModelSchema.safeParse(model);
    if (!parsed.success) {
      result.success = false;
      for (const issue of parsed.error.issues) {
        const path = issue.path.length > 0 ? issue.path.join(".") + ": " : "";
        result.errors.push(`${path}${issue.message}`);
      }
    }

    this.checkViewValues(model.views, result);

    if (opts.checkReferences) {
      this.checkReferences(archimate, result);
    }

    if (opts.validateNamespaces) {
      this.checkNamespaces(model.xmlns, model.xsiNamespace, result);
    }

    if (opts.strict) {
      this.strictChecks(archimate, result);
    }

    return result;
  }

  private checkReferences(archimate: Archimate, result: ValidationResult): void {
    const model = archimate.toObject();
    const elementIds = new Set(model.elements.map((element) => element.identifier));
    const relationshipIds = new Set(
      model.relationships.map((relationship) => relationship.identifier),
    );
    const propertyDefinitionIds = new Set(
      model.propertyDefinitions.map((definition) => definition.identifier),
    );
    const identifiableIds = new Set([
      ...elementIds,
      ...relationshipIds,
      ...model.views.map((view) => view.identifier),
    ]);
    const addError = (message: string) => {
      result.errors.push(message);
      result.success = false;
    };
    const checkProperties = (owner: string, properties: Property[] | undefined) => {
      for (const property of properties ?? []) {
        if (!propertyDefinitionIds.has(property.definitionRef)) {
          addError(`Property on ${owner}: definition '${property.definitionRef}' not found`);
        }
      }
    };

    checkProperties(`model ${model.identifier}`, model.properties);

    for (const element of model.elements) {
      checkProperties(`element ${element.identifier}`, element.properties);
    }

    // ArchiMate allows a relationship to connect to another relationship.
    const relationshipEndpointIds = new Set([...elementIds, ...relationshipIds]);
    for (const relationship of model.relationships) {
      if (!relationshipEndpointIds.has(relationship.source)) {
        addError(
          `Relationship ${relationship.identifier}: source '${relationship.source}' not found`,
        );
      }
      if (!relationshipEndpointIds.has(relationship.target)) {
        addError(
          `Relationship ${relationship.identifier}: target '${relationship.target}' not found`,
        );
      }
      checkProperties(`relationship ${relationship.identifier}`, relationship.properties);
    }
    this.checkRelationshipCycles(model.relationships, result);

    const checkOrganization = (organization: Organization) => {
      if (organization.identifierRef && !identifiableIds.has(organization.identifierRef)) {
        addError(`Organization: identifier '${organization.identifierRef}' not found`);
      }
      for (const item of organization.items ?? []) checkOrganization(item);
    };
    for (const organization of model.organizations) checkOrganization(organization);

    const flattenNodes = (nodes: Node[]): Node[] =>
      nodes.flatMap((node) => [node, ...flattenNodes(node.nodes ?? [])]);

    for (const view of model.views) {
      checkProperties(`view ${view.identifier}`, view.properties);
      const nodes = flattenNodes(view.nodes ?? []);
      const connections = view.connections ?? [];
      const connectionEndpointIds = new Set([
        ...nodes.map((node) => node.identifier),
        ...connections.map((connection) => connection.identifier),
      ]);
      for (const node of nodes) {
        if (node.elementRef && !elementIds.has(node.elementRef)) {
          addError(`Node ${node.identifier}: element '${node.elementRef}' not found`);
        }
      }
      for (const connection of connections) {
        const type = connection.type ?? (connection.relationshipRef ? "Relationship" : "Line");
        if (type === "Relationship" && !connection.relationshipRef) {
          addError(
            `Connection ${connection.identifier}: Relationship connection has no relationshipRef`,
          );
        }
        if (type === "Line" && connection.relationshipRef) {
          addError(
            `Connection ${connection.identifier}: Line connection cannot have a relationshipRef`,
          );
        }
        if (connection.relationshipRef && !relationshipIds.has(connection.relationshipRef)) {
          addError(
            `Connection ${connection.identifier}: relationship '${connection.relationshipRef}' not found`,
          );
        }
        if (!connectionEndpointIds.has(connection.source)) {
          addError(`Connection ${connection.identifier}: source '${connection.source}' not found`);
        }
        if (!connectionEndpointIds.has(connection.target)) {
          addError(`Connection ${connection.identifier}: target '${connection.target}' not found`);
        }
      }
    }
  }

  // Ranges from archimate3_Diagram.xsd; values outside them serialize to XML the XSD rejects.
  private checkViewValues(views: View[], result: ValidationResult): void {
    type Report = (message: string) => void;
    const reporter =
      (owner: string): Report =>
      (message) => {
        result.errors.push(`${owner}: ${message}`);
        result.success = false;
      };
    const checkWhole = (
      report: Report,
      name: string,
      value: number | undefined,
      min: number,
      max?: number,
    ) => {
      if (value === undefined || isWholeNumber(value, min, max)) return;
      report(`${name} must be a whole number ${max === undefined ? `≥ ${min}` : `${min}–${max}`}`);
    };
    const checkColor = (report: Report, name: string, color: RGBColor | undefined) => {
      if (!color) return;
      for (const channel of ["r", "g", "b"] as const) {
        checkWhole(report, `${name}.${channel}`, color[channel], 0, 255);
      }
      checkWhole(report, `${name}.a`, color.a, 0, 100);
    };
    const checkStyle = (report: Report, style: Style | undefined) => {
      if (!style) return;
      checkWhole(report, "lineWidth", style.lineWidth, 1);
      checkColor(report, "lineColor", style.lineColor);
      checkColor(report, "fillColor", style.fillColor);
      const font = style.font;
      if (!font) return;
      if (font.size !== undefined && !(font.size >= 1 && Number.isInteger(font.size * 2))) {
        report("font.size must be at least 1, in steps of 0.5");
      }
      const unknown = (font.style ?? "").split(/\s+/).filter((s) => s && !FONT_STYLES.has(s));
      if (unknown.length > 0) {
        report(`font.style '${unknown.join(" ")}' is not one of plain, bold, italic, underline`);
      }
      checkColor(report, "font.color", font.color);
    };
    const checkNode = (node: Node) => {
      const report = reporter(`Node ${node.identifier}`);
      for (const key of ["x", "y", "w", "h"] as const) {
        if (node[key] === undefined) report(`${key} is required`);
      }
      checkWhole(report, "x", node.x, 0);
      checkWhole(report, "y", node.y, 0);
      checkWhole(report, "w", node.w, 1);
      checkWhole(report, "h", node.h, 1);
      checkStyle(report, node.style);
      for (const child of node.nodes ?? []) checkNode(child);
    };

    for (const view of views) {
      for (const node of view.nodes ?? []) checkNode(node);
      for (const connection of view.connections ?? []) {
        const report = reporter(`Connection ${connection.identifier}`);
        checkStyle(report, connection.style);
        connection.bendpoints?.forEach((point, index) => {
          checkWhole(report, `bendpoints[${index}].x`, point.x, 0);
          checkWhole(report, `bendpoints[${index}].y`, point.y, 0);
        });
      }
    }
  }

  // Valid against the XSD, but almost certainly a mistake, so these are warnings.
  private checkRelationshipCycles(relationships: Relationship[], result: ValidationResult): void {
    const relationshipIds = new Set(relationships.map((relationship) => relationship.identifier));
    const edges = new Map<string, string[]>();
    for (const relationship of relationships) {
      const id = relationship.identifier;
      if (relationship.source === id || relationship.target === id) {
        result.warnings.push(`Relationship ${id}: connects to itself`);
      }
      const endpoints = new Set([relationship.source, relationship.target]);
      edges.set(
        id,
        [...endpoints].filter((endpoint) => endpoint !== id && relationshipIds.has(endpoint)),
      );
    }

    // Depth-first search: an endpoint already on the current path closes a cycle. That gives one
    // warning per back edge, so every cycle is flagged, though overlapping cycles may share one.
    const visited = new Set<string>();
    const path: string[] = [];
    const visit = (id: string) => {
      path.push(id);
      for (const next of edges.get(id) ?? []) {
        const start = path.indexOf(next);
        if (start !== -1) {
          const cycle = [...path.slice(start), next].join(" → ");
          result.warnings.push(`Relationships form a cycle: ${cycle}`);
        } else if (!visited.has(next)) {
          visit(next);
        }
      }
      path.pop();
      visited.add(id);
    };
    for (const id of edges.keys()) {
      if (!visited.has(id)) visit(id);
    }
  }

  private checkNamespaces(
    xmlns: string | undefined,
    xsiNamespace: string | undefined,
    result: ValidationResult,
  ): void {
    if (xmlns && xmlns !== ARCHIMATE_NAMESPACE) {
      result.errors.push(`Invalid namespace: expected '${ARCHIMATE_NAMESPACE}', got '${xmlns}'`);
      result.success = false;
    }
    if (xsiNamespace && xsiNamespace !== XSI_NAMESPACE) {
      result.errors.push(
        `Invalid XSI namespace: expected '${XSI_NAMESPACE}', got '${xsiNamespace}'`,
      );
      result.success = false;
    }
  }

  private strictChecks(archimate: Archimate, result: ValidationResult): void {
    for (const el of archimate.getElements()) {
      if (!el.name) result.warnings.push(`Element ${el.identifier} has no name`);
      if (!el.documentation) result.warnings.push(`Element ${el.identifier} has no documentation`);
    }
  }
}
