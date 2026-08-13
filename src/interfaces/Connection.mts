export interface Connection {
  identifier: string;
  type?: string;
  relationshipRef: string;
  source: string;
  target: string;
  label?: string;
}
