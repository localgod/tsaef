import type { AccessType } from "../constants/archimate-types.mjs";
import type { LangString } from "./LangString.mjs";
import type { Property } from "./Property.mjs";

export interface Relationship {
  identifier: string;
  type: string;
  source: string;
  target: string;
  /** Access relationships only. */
  accessType?: AccessType;
  /** Influence relationships only, e.g. "+", "++", "-", "--" or "0"–"10". */
  modifier?: string;
  /** Association relationships only. */
  isDirected?: boolean;
  name?: string;
  nameLang?: string;
  nameTranslations?: LangString[];
  documentation?: string;
  documentationLang?: string;
  documentationTranslations?: LangString[];
  properties?: Property[];
}
