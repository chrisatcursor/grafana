import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';

import { Trans, t } from '@grafana/i18n';
import { getBackendSrv } from '@grafana/runtime';
import { Alert, FilterInput, Stack, RadioButtonGroup, Badge } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';

import { FeatureTogglesTable } from './FeatureTogglesTable';

export interface FeatureFlagDTO {
  name: string;
  description: string;
  stage: string;
  enabled: boolean;
  requiresDevMode?: boolean;
  frontendOnly?: boolean;
  requiresRestart?: boolean;
}

const stageOptions = [
  { label: 'All', value: '' },
  { label: 'Experimental', value: 'experimental' },
  { label: 'Private Preview', value: 'privatePreview' },
  { label: 'Preview', value: 'preview' },
  { label: 'GA', value: 'GA' },
  { label: 'Deprecated', value: 'deprecated' },
];

const enabledOptions = [
  { label: 'All', value: '' },
  { label: 'Enabled', value: 'true' },
  { label: 'Disabled', value: 'false' },
];

function AdminFeatureTogglesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [enabledFilter, setEnabledFilter] = useState('');

  const { loading, value: featureToggles } = useAsync(
    () => getBackendSrv().get<FeatureFlagDTO[]>('/api/admin/featuretoggles'),
    []
  );

  const filteredToggles = useMemo(() => {
    if (!featureToggles) {
      return [];
    }

    return featureToggles.filter((toggle) => {
      const matchesSearch =
        !searchQuery ||
        toggle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        toggle.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStage = !stageFilter || toggle.stage === stageFilter;

      const matchesEnabled =
        !enabledFilter ||
        (enabledFilter === 'true' && toggle.enabled) ||
        (enabledFilter === 'false' && !toggle.enabled);

      return matchesSearch && matchesStage && matchesEnabled;
    });
  }, [featureToggles, searchQuery, stageFilter, enabledFilter]);

  const stats = useMemo(() => {
    if (!featureToggles) {
      return { total: 0, enabled: 0, disabled: 0 };
    }
    const enabled = featureToggles.filter((t) => t.enabled).length;
    return {
      total: featureToggles.length,
      enabled,
      disabled: featureToggles.length - enabled,
    };
  }, [featureToggles]);

  return (
    <Page navId="feature-toggles">
      <Page.Contents>
        <Alert severity="info" title="">
          <Trans i18nKey="admin.feature-toggles.info-description">
            Feature toggles allow you to enable or disable features in Grafana. These settings are controlled via
            configuration file (grafana.ini) or environment variables. Changes to feature toggles typically require a
            server restart.
          </Trans>
        </Alert>

        <Stack direction="column" gap={2}>
          <Stack direction="row" gap={2} alignItems="center" justifyContent="space-between" wrap="wrap">
            <Stack direction="row" gap={2} alignItems="center" wrap="wrap">
              <FilterInput
                placeholder={t('admin.feature-toggles.search-placeholder', 'Search by name or description')}
                value={searchQuery}
                onChange={setSearchQuery}
                width={40}
              />
              <RadioButtonGroup options={stageOptions} value={stageFilter} onChange={setStageFilter} size="sm" />
              <RadioButtonGroup options={enabledOptions} value={enabledFilter} onChange={setEnabledFilter} size="sm" />
            </Stack>
            <Stack direction="row" gap={1}>
              <Badge
                text={t('admin.feature-toggles.badge-total', 'Total: {{count}}', { count: stats.total })}
                color="blue"
              />
              <Badge
                text={t('admin.feature-toggles.badge-enabled', 'Enabled: {{count}}', { count: stats.enabled })}
                color="green"
              />
              <Badge
                text={t('admin.feature-toggles.badge-disabled', 'Disabled: {{count}}', { count: stats.disabled })}
                color="orange"
              />
            </Stack>
          </Stack>

          {loading && <FeatureTogglesTable.Skeleton />}

          {featureToggles && (
            <FeatureTogglesTable
              featureToggles={filteredToggles}
              showEmpty={filteredToggles.length === 0 && featureToggles.length > 0}
            />
          )}
        </Stack>
      </Page.Contents>
    </Page>
  );
}

export default AdminFeatureTogglesPage;
