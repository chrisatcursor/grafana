import { getBackendSrv } from '@grafana/runtime';

export interface FeatureFlagAdminDTO {
  name: string;
  description: string;
  stage: string;
  enabled: boolean;
  expression: string;
  requiresDevMode: boolean;
  requiresRestart: boolean;
  frontendOnly: boolean;
  owner?: string;
  warning?: string;
}

export const getFeatureTogglesAdmin = async (): Promise<FeatureFlagAdminDTO[]> => {
  return getBackendSrv().get('/api/admin/feature-toggles');
};
