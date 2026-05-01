import { Trans, t } from '@grafana/i18n';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv } from 'app/core/services/context_srv';
import { AccessControlAction } from 'app/types/accessControl';

import { UnifiedStorageMigrationReport } from './UnifiedStorageMigrationReport';

export default function UnifiedStorageMigrationPage() {
  if (!contextSrv.hasPermission(AccessControlAction.ActionServerStatsRead)) {
    return (
      <Page navId="unified-storage-migration">
        <Page.Contents>
          <p>{t('admin.unified-storage-migration.forbidden', 'You do not have permission to view this page.')}</p>
        </Page.Contents>
      </Page>
    );
  }

  return (
    <Page navId="unified-storage-migration">
      <Page.Contents>
        <h2>
          <Trans i18nKey="admin.unified-storage-migration.page-title">Unified storage migration</Trans>
        </h2>
        <p>
          <Trans i18nKey="admin.unified-storage-migration.page-subtitle">
            Status of unified storage data migration for resources managed by the migration registry.
          </Trans>
        </p>
        <UnifiedStorageMigrationReport />
      </Page.Contents>
    </Page>
  );
}
