import { getBackendSrv } from '@grafana/runtime';

import type { UnifiedStorageMigrationReport } from './types';

export async function getUnifiedStorageMigrationReport(): Promise<UnifiedStorageMigrationReport | null> {
  return getBackendSrv()
    .get<UnifiedStorageMigrationReport>('/api/admin/unified-storage/migration-status')
    .catch((err) => {
      console.error(err);
      return null;
    });
}
