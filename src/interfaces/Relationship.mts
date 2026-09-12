import type { Property } from "./Property.mjs";

export interface Relationship {
  identifier: string;
  type: string;
  source: string;
  target: string;
  name?: string;
  nameLang?: string;
  documentation?: string;
  documentationLang?: string;
  properties?: Property[];
}
