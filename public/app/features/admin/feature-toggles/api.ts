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

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function isFeatureFlagAdminList(data: unknown): data is FeatureFlagAdminDTO[] {
  if (!Array.isArray(data)) {
    return false;
  }
  for (const item of data) {
    if (!isRecord(item) || typeof item.name !== 'string') {
      return false;
    }
  }
  return true;
}

export const getFeatureTogglesAdmin = async (): Promise<FeatureFlagAdminDTO[]> => {
  const data: unknown = await getBackendSrv().get('/api/admin/feature-toggles');
  if (!isFeatureFlagAdminList(data)) {
    throw new Error('Invalid feature toggles response');
  }
  return data;
};
