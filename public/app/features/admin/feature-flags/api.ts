import { getBackendSrv } from '@grafana/runtime';

import type { FeatureFlagsResponseDTO } from './types';

export const featureFlagsApi = {
  getResolvedToggles: () => getBackendSrv().get<FeatureFlagsResponseDTO>('/api/admin/feature-toggles'),
};
