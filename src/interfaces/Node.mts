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
  documentation?: string;
  documentationLang?: string;
  nodes?: Node[];
}
