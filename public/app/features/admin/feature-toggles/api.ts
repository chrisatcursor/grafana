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

function parseFeatureFlagAdminItem(item: unknown): FeatureFlagAdminDTO | null {
  if (!isRecord(item) || typeof item.name !== 'string' || typeof item.enabled !== 'boolean') {
    return null;
  }
  return {
    name: item.name,
    description: typeof item.description === 'string' ? item.description : '',
    stage: typeof item.stage === 'string' ? item.stage : '',
    enabled: item.enabled,
    expression: typeof item.expression === 'string' ? item.expression : '',
    requiresDevMode: typeof item.requiresDevMode === 'boolean' ? item.requiresDevMode : false,
    requiresRestart: typeof item.requiresRestart === 'boolean' ? item.requiresRestart : false,
    frontendOnly: typeof item.frontendOnly === 'boolean' ? item.frontendOnly : false,
    owner: typeof item.owner === 'string' ? item.owner : undefined,
    warning: typeof item.warning === 'string' ? item.warning : undefined,
  };
}

export const getFeatureTogglesAdmin = async (): Promise<FeatureFlagAdminDTO[]> => {
  const data: unknown = await getBackendSrv().get('/api/admin/feature-toggles');
  if (!Array.isArray(data)) {
    throw new Error('Invalid feature toggles response');
  }
  const out: FeatureFlagAdminDTO[] = [];
  for (const item of data) {
    const row = parseFeatureFlagAdminItem(item);
    if (!row) {
      throw new Error('Invalid feature toggles response');
    }
    out.push(row);
  }
  return out;
};
