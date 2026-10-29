import type { LangString } from "./LangString.mjs";
import type { Property } from "./Property.mjs";

export interface Element {
  identifier: string;
  type: string;
  name: string;
  lang?: string;
  nameTranslations?: LangString[];
  documentation?: string;
  documentationLang?: string;
  documentationTranslations?: LangString[];
  properties?: Property[];
}
