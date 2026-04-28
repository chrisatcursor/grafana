import { Trans } from '@grafana/i18n';
import { Alert } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';

import { FeatureFlagTable } from './FeatureFlagTable';

/**
 * Server admin view listing feature toggles and their effective state.
 * Mirrors the shell pattern from AdminSettings: Page + Alert + content.
 */
export default function FeatureFlagDashboardPage() {
  return (
    <Page navId="feature-toggles">
      <Page.Contents>
        <Alert severity="info" title="">
          <Trans i18nKey="admin.feature-flag-dashboard.info">
            Values reflect this Grafana process. Changes to many flags require a configuration update and restart.
          </Trans>
        </Alert>
        <FeatureFlagTable />
      </Page.Contents>
    </Page>
  );
}
