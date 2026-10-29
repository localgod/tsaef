import type { LangString } from "./LangString.mjs";

export interface Organization {
  label?: string;
  lang?: string;
  labelTranslations?: LangString[];
  documentation?: string;
  documentationLang?: string;
  documentationTranslations?: LangString[];
  identifierRef?: string;
  items?: Organization[];
}
