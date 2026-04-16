/**
 * Row model for the feature flag dashboard table (aligned with the upcoming admin API).
 * Fields will be populated when the backend endpoint is wired.
 */
export interface FeatureFlagTableRow {
  name: string;
  description: string;
  stage: string;
  enabled: boolean;
  /** Warning text from config/registry (e.g. unknown key in ini) */
  warning?: string;
}
