import type { Element } from "./Element.mjs";
import type { Relationship } from "./Relationship.mjs";
import type { PropertyDefinition } from "./PropertyDefinition.mjs";
import type { Organization } from "./Organization.mjs";
import type { View } from "./View.mjs";

export interface Model {
  identifier: string;
  name: string;
  lang?: string;
  documentation?: string;
  xmlns?: string;
  xsiNamespace?: string;
  schemaLocation?: string;
  elements: Element[];
  relationships: Relationship[];
  propertyDefinitions: PropertyDefinition[];
  organizations: Organization[];
  views: View[];
}
