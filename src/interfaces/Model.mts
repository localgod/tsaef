import type { LangString } from "./LangString.mjs";
import type { Element } from "./Element.mjs";
import type { Property } from "./Property.mjs";
import type { Relationship } from "./Relationship.mjs";
import type { PropertyDefinition } from "./PropertyDefinition.mjs";
import type { Organization } from "./Organization.mjs";
import type { View } from "./View.mjs";

export interface Model {
  identifier: string;
  name: string;
  lang?: string;
  nameTranslations?: LangString[];
  documentation?: string;
  documentationLang?: string;
  documentationTranslations?: LangString[];
  properties?: Property[];
  xmlns?: string;
  xsiNamespace?: string;
  schemaLocation?: string;
  elements: Element[];
  relationships: Relationship[];
  propertyDefinitions: PropertyDefinition[];
  organizations: Organization[];
  views: View[];
}
