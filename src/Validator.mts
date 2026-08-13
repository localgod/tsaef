import { z } from "zod";
import type { Archimate } from "./Archimate.mjs";
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
    const ids = new Set(archimate.getElements().map((e) => e.identifier));

    for (const rel of archimate.getRelationships()) {
      if (!ids.has(rel.source)) {
        result.errors.push(`Relationship ${rel.identifier}: source '${rel.source}' not found`);
        result.success = false;
      }
      if (!ids.has(rel.target)) {
        result.errors.push(`Relationship ${rel.identifier}: target '${rel.target}' not found`);
        result.success = false;
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
