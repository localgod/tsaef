export interface Connection {
  identifier: string;
  type?: string;
  relationshipRef: string;
  source: string;
  target: string;
  label?: string;
  labelLang?: string;
  documentation?: string;
  documentationLang?: string;
}
