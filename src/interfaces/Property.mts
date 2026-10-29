import type { LangString } from "./LangString.mjs";

export interface Property {
  definitionRef: string;
  value: string;
  lang?: string;
  valueTranslations?: LangString[];
}
