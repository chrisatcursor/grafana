/**
 * Response shape for GET /api/admin/feature-toggles (planned).
 * Aligns conceptually with pkg/services/featuremgmt/feature_toggle_api ToggleStatus.
 */
export interface FeatureToggleStatusDTO {
  name: string;
  description?: string;
  stage: string;
  enabled: boolean;
  writeable?: boolean;
  frontendOnly?: boolean;
  requiresRestart?: boolean;
  hideFromDocs?: boolean;
  warning?: string;
}

export interface FeatureFlagsResponseDTO {
  toggles: FeatureToggleStatusDTO[];
}
