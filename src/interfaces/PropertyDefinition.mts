import type { LangString } from "./LangString.mjs";

export interface PropertyDefinition {
  identifier: string;
  type: string;
  name: string;
  lang?: string;
  nameTranslations?: LangString[];
}
