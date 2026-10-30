import type { LangString } from "./LangString.mjs";
import type { Point, Style } from "./Style.mjs";

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
  style?: Style;
  /** Absolute positions in the view, in order from source to target. */
  bendpoints?: Point[];
}
