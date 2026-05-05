import { useEffect, useMemo, useState } from 'react';

import { Trans, t } from '@grafana/i18n';
import { isFetchError } from '@grafana/runtime';
import { Alert, Field, Input, LoadingPlaceholder, Stack } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv } from 'app/core/services/context_srv';
import { AccessControlAction } from 'app/types/accessControl';

import { featureFlagsApi } from './api';
import { FeatureFlagTable } from './FeatureFlagTable';
import type { FeatureToggleStatusDTO } from './types';

function filterToggles(toggles: FeatureToggleStatusDTO[], query: string): FeatureToggleStatusDTO[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return toggles;
  }
  return toggles.filter((row) => {
    const haystack = `${row.name} ${row.description ?? ''} ${row.stage} ${row.warning ?? ''}`.toLowerCase();
    return haystack.includes(q);
  });
}

export default function FeatureFlagsPage() {
  const [toggles, setToggles] = useState<FeatureToggleStatusDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const canRead = contextSrv.hasPermission(AccessControlAction.SettingsRead);

  const filteredToggles = useMemo(() => {
    if (!toggles) {
      return null;
    }
    return filterToggles(toggles, filter);
  }, [toggles, filter]);

  useEffect(() => {
    if (!canRead) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    featureFlagsApi
      .getResolvedToggles()
      .then((res) => {
        if (!cancelled) {
          setToggles(res.toggles ?? []);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = isFetchError(err)
            ? (err.data?.message as string | undefined) ?? err.message
            : t('admin.feature-flags.load-error', 'Failed to load feature toggles.');
          setError(message);
          setToggles(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [canRead]);

  if (!canRead) {
    return (
      <Page navId="feature-flags">
        <Page.Contents>
          <Alert severity="warning" title="">
            <Trans i18nKey="admin.feature-flags.no-access">
              You do not have permission to view feature toggles.
            </Trans>
          </Alert>
        </Page.Contents>
      </Page>
    );
  }

  return (
    <Page navId="feature-flags">
      <Page.Contents>
        <Stack direction="column" gap={2}>
          <Alert severity="info" title="">
            <Trans i18nKey="admin.feature-flags.info">
              Feature toggles are defined in code and overridden in your Grafana configuration (for example
              custom.ini). Changes typically require a Grafana restart.
            </Trans>
          </Alert>

          {loading && <LoadingPlaceholder text={t('admin.feature-flags.loading', 'Loading feature toggles…')} />}

          {error && (
            <Alert severity="error" title={t('admin.feature-flags.error-title', 'Could not load feature toggles')}>
              {error}
            </Alert>
          )}

          {!loading && !error && toggles && toggles.length === 0 && (
            <Alert severity="warning" title="">
              <Trans i18nKey="admin.feature-flags.empty">No feature toggles were returned.</Trans>
            </Alert>
          )}

          {!loading && !error && toggles && toggles.length > 0 && (
            <>
              <Field label={t('admin.feature-flags.filter-label', 'Filter')} description="">
                <Input
                  width={50}
                  placeholder={t('admin.feature-flags.filter-placeholder', 'Search by name, description, stage…')}
                  value={filter}
                  onChange={(e) => setFilter(e.currentTarget.value)}
                />
              </Field>

              {filteredToggles && filteredToggles.length === 0 ? (
                <Alert severity="info" title="">
                  <Trans i18nKey="admin.feature-flags.filter-empty">No toggles match your filter.</Trans>
                </Alert>
              ) : (
                filteredToggles && <FeatureFlagTable toggles={filteredToggles} />
              )}
            </>
          )}
        </Stack>
      </Page.Contents>
    </Page>
  );
}
