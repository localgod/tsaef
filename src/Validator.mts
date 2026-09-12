import { z } from "zod";
import type { Archimate } from "./Archimate.mjs";
import type { Organization } from "./interfaces/Organization.mjs";
import type { Property } from "./interfaces/Property.mjs";
import type { Node } from "./interfaces/Node.mjs";
import type { ValidationResult } from "./interfaces/ValidationIssue.mjs";
import {
  ArchiMateElementTypes,
  ArchiMateRelationshipTypes,
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

const RelationshipSchema = z.object({
  identifier: z.string().min(1),
  type: ArchiMateRelationshipTypes,
  source: z.string().min(1),
  target: z.string().min(1),
  name: z.string().optional(),
  documentation: z.string().optional(),
  properties: z.array(PropertySchema).optional(),
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
    const relationshipIds = new Set(model.relationships.map((relationship) => relationship.identifier));
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

    for (const element of model.elements) {
      checkProperties(`element ${element.identifier}`, element.properties);
    }

    for (const relationship of model.relationships) {
      if (!elementIds.has(relationship.source)) {
        addError(`Relationship ${relationship.identifier}: source '${relationship.source}' not found`);
      }
      if (!elementIds.has(relationship.target)) {
        addError(`Relationship ${relationship.identifier}: target '${relationship.target}' not found`);
      }
      checkProperties(`relationship ${relationship.identifier}`, relationship.properties);
    }

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
      const nodeIds = new Set(nodes.map((node) => node.identifier));
      for (const node of nodes) {
        if (node.elementRef && !elementIds.has(node.elementRef)) {
          addError(`Node ${node.identifier}: element '${node.elementRef}' not found`);
        }
      }
      for (const connection of view.connections ?? []) {
        if (!relationshipIds.has(connection.relationshipRef)) {
          addError(
            `Connection ${connection.identifier}: relationship '${connection.relationshipRef}' not found`,
          );
        }
        if (!nodeIds.has(connection.source)) {
          addError(`Connection ${connection.identifier}: source node '${connection.source}' not found`);
        }
        if (!nodeIds.has(connection.target)) {
          addError(`Connection ${connection.identifier}: target node '${connection.target}' not found`);
        }
      }
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
