export interface ValidationIssue {
  message: string;
  path?: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}
