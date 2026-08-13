import type { Property } from "./Property.mjs";

export interface Relationship {
  identifier: string;
  type: string;
  source: string;
  target: string;
  name?: string;
  documentation?: string;
  properties?: Property[];
}
