import { useAsync } from 'react-use';

import { Trans, t } from '@grafana/i18n';
import { Alert, Stack } from '@grafana/ui';

import { ServerStatsCard } from '../ServerStatsCard';

import { getUnifiedStorageMigrationReport } from './api';
import { UnifiedStorageMigrationTable } from './UnifiedStorageMigrationTable';

export function UnifiedStorageMigrationReport() {
  const { loading, value: report, error } = useAsync(() => getUnifiedStorageMigrationReport(), []);

  if (error) {
    return (
      <Alert severity="error" title={t('admin.unified-storage-migration.load-error-title', 'Failed to load report')}>
        {String(error)}
      </Alert>
    );
  }

  if (!loading && !report) {
    return (
      <Alert severity="warning" title={t('admin.unified-storage-migration.empty-title', 'No data')}>
        <Trans i18nKey="admin.unified-storage-migration.empty-body">
          Could not load unified storage migration status. Check that you have server statistics permission.
        </Trans>
      </Alert>
    );
  }

  return (
    <Stack direction="column" gap={3}>
      <Alert severity="info" title="">
        <Trans i18nKey="admin.unified-storage-migration.info">
          This report shows the effective storage mode per registered resource (legacy, dual-write, or unified), based on
          Grafana configuration and the unified storage migration log. If the migration log cannot be read, the mode may
          fall back to configuration only and the row is marked degraded.
        </Trans>
      </Alert>

      {report?.degraded && (
        <Alert severity="warning" title={t('admin.unified-storage-migration.degraded-title', 'Degraded')}>
          <Trans i18nKey="admin.unified-storage-migration.degraded-body">
            At least one resource could not read the migration log; see the Migration log column for details.
          </Trans>
        </Alert>
      )}

      <ServerStatsCard
        isLoading={loading}
        content={[
          {
            name: t('admin.unified-storage-migration.stat-disable-migrations', 'Data migrations disabled'),
            value: report ? (report.disableDataMigrations ? 'yes' : 'no') : undefined,
          },
          {
            name: t('admin.unified-storage-migration.stat-resource-count', 'Registered resources'),
            value: report?.resources.length,
          },
        ]}
      />

      {report && <UnifiedStorageMigrationTable rows={report.resources} />}
    </Stack>
  );
}
