/**
 * Response from GET /api/admin/feature-toggles (see pkg/api/admin_feature_toggles.go).
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
