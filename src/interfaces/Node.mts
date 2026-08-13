export interface Node {
  identifier: string;
  type?: string;
  elementRef?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  label?: string;
  nodes?: Node[];
}
