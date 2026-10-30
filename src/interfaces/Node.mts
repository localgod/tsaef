import type { LangString } from "./LangString.mjs";
import type { Style } from "./Style.mjs";

export interface Node {
  identifier: string;
  type?: string;
  elementRef?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  label?: string;
  labelLang?: string;
  labelTranslations?: LangString[];
  documentation?: string;
  documentationLang?: string;
  documentationTranslations?: LangString[];
  style?: Style;
  nodes?: Node[];
}
