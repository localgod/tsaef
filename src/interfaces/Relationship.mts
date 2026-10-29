import type { LangString } from "./LangString.mjs";
import type { Property } from "./Property.mjs";

export interface Relationship {
  identifier: string;
  type: string;
  source: string;
  target: string;
  name?: string;
  nameLang?: string;
  nameTranslations?: LangString[];
  documentation?: string;
  documentationLang?: string;
  documentationTranslations?: LangString[];
  properties?: Property[];
}
