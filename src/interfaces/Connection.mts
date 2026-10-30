import type { LangString } from "./LangString.mjs";

export interface Connection {
  identifier: string;
  type?: string;
  /** Required on "Relationship" connections; "Line" connections have none. */
  relationshipRef?: string;
  source: string;
  target: string;
  label?: string;
  labelLang?: string;
  labelTranslations?: LangString[];
  documentation?: string;
  documentationLang?: string;
  documentationTranslations?: LangString[];
}
