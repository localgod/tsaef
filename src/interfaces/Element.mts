import type { Property } from "./Property.mjs";

export interface Element {
  identifier: string;
  type: string;
  name: string;
  lang?: string;
  documentation?: string;
  properties?: Property[];
}
