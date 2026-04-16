import { NavModelItem } from '@grafana/data';
import { Trans, t } from '@grafana/i18n';
import { Alert } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';

import { FeatureFlagTable } from './FeatureFlagTable';

function getPageNav(): NavModelItem {
  return {
    icon: 'toggle-on',
    id: 'feature-toggles',
    text: t('nav.feature-toggles.title', 'Feature flags'),
    subTitle: t('nav.feature-toggles.subtitle', 'View registered feature toggles and their effective state'),
  };
}

/**
 * Server admin view listing feature toggles and their effective state.
 * Mirrors the shell pattern from AdminSettings: Page + Alert + content.
 * Uses `pageNav` until the server nav entry and `/admin/feature-flags` route ship in a backend PR.
 */
export default function FeatureFlagDashboardPage() {
  return (
    <Page navId="cfg" pageNav={getPageNav()}>
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
