import type { Property } from "./Property.mjs";
import type { Node } from "./Node.mjs";
import type { Connection } from "./Connection.mjs";

export interface View {
  identifier: string;
  type?: string;
  name: string;
  lang?: string;
  documentation?: string;
  documentationLang?: string;
  viewpoint?: string;
  nodes?: Node[];
  connections?: Connection[];
  properties?: Property[];
}
