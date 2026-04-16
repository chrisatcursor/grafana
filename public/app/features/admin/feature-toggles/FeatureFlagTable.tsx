import { t } from '@grafana/i18n';
import { EmptyState } from '@grafana/ui';

/**
 * Tabular view of registered feature toggles. Implementation will use `InteractiveTable`
 * (see LDAP admin pages) once data is available from `GET /api/admin/feature-toggles`.
 */
export function FeatureFlagTable() {
  return (
    <EmptyState
      variant="completed"
      message={t(
        'admin.feature-flag-dashboard.table-placeholder',
        'Feature flag details will appear here after the admin API is connected.'
      )}
    />
  );
}
