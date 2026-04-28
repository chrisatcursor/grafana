import { css } from '@emotion/css';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';

import { GrafanaTheme2 } from '@grafana/data';
import { t } from '@grafana/i18n';
import {
  Badge,
  CellProps,
  Column,
  Icon,
  Input,
  InteractiveTable,
  LoadingPlaceholder,
  Stack,
  Text,
  Tooltip,
  useStyles2,
} from '@grafana/ui';

import { FeatureFlagAdminDTO, getFeatureTogglesAdmin } from './api';

function nameMatchesQuery(row: FeatureFlagAdminDTO, q: string): boolean {
  if (!q) {
    return true;
  }
  const needle = q.toLowerCase();
  return (
    row.name.toLowerCase().includes(needle) ||
    row.description.toLowerCase().includes(needle) ||
    row.stage.toLowerCase().includes(needle) ||
    (row.owner && row.owner.toLowerCase().includes(needle))
  );
}

export function FeatureFlagTable() {
  const styles = useStyles2(getStyles);
  const [filter, setFilter] = useState('');
  const { value: rows, loading, error } = useAsync(async () => getFeatureTogglesAdmin(), []);

  const filtered = useMemo(() => {
    if (!rows) {
      return [];
    }
    return rows.filter((r) => nameMatchesQuery(r, filter.trim()));
  }, [rows, filter]);

  const columns = useMemo<Array<Column<FeatureFlagAdminDTO>>>(
    () => [
      {
        id: 'name',
        header: t('admin.feature-flag-dashboard.column-name', 'Name'),
        sortType: 'alphanumeric',
        cell: (cell: CellProps<FeatureFlagAdminDTO>) => {
          const row = cell.row.original;
          return (
            <Stack gap={1} alignItems="center">
              <Text weight="medium">{row.name}</Text>
              {row.warning ? (
                <Tooltip content={row.warning}>
                  <Icon name="exclamation-triangle" className={styles.warnIcon} />
                </Tooltip>
              ) : null}
            </Stack>
          );
        },
      },
      {
        id: 'stage',
        header: t('admin.feature-flag-dashboard.column-stage', 'Stage'),
        sortType: 'alphanumeric',
        disableGrow: true,
      },
      {
        id: 'enabled',
        header: t('admin.feature-flag-dashboard.column-enabled', 'Enabled'),
        sortType: 'basic',
        disableGrow: true,
        cell: (cell: CellProps<FeatureFlagAdminDTO>) => {
          const row = cell.row.original;
          return row.enabled ? (
            <Badge text={t('admin.feature-flag-dashboard.enabled-yes', 'Yes')} color="green" />
          ) : (
            <Badge text={t('admin.feature-flag-dashboard.enabled-no', 'No')} color="orange" />
          );
        },
      },
      {
        id: 'description',
        header: t('admin.feature-flag-dashboard.column-description', 'Description'),
        sortType: 'alphanumeric',
        cell: (cell: CellProps<FeatureFlagAdminDTO>) => (
          <Text color="secondary">{cell.row.original.description}</Text>
        ),
      },
      {
        id: 'flags',
        header: t('admin.feature-flag-dashboard.column-attributes', 'Attributes'),
        disableGrow: true,
        cell: (cell: CellProps<FeatureFlagAdminDTO>) => {
          const row = cell.row.original;
          return (
            <Stack gap={0.5} direction="row" wrap>
              {row.requiresRestart ? (
                <Badge text={t('admin.feature-flag-dashboard.attr-restart', 'Restart')} color="blue" />
              ) : null}
              {row.requiresDevMode ? (
                <Badge text={t('admin.feature-flag-dashboard.attr-dev', 'Dev')} color="purple" />
              ) : null}
              {row.frontendOnly ? (
                <Badge text={t('admin.feature-flag-dashboard.attr-frontend', 'Frontend')} color="blue" />
              ) : null}
            </Stack>
          );
        },
      },
    ],
    [styles.warnIcon]
  );

  if (loading) {
    return <LoadingPlaceholder text={t('admin.feature-flag-dashboard.loading', 'Loading feature toggles…')} />;
  }

  if (error) {
    return (
      <Text color="error">
        {t('admin.feature-flag-dashboard.load-error', 'Could not load feature toggles. Try again later.')}
      </Text>
    );
  }

  return (
    <Stack direction="column" gap={2}>
      <Input
        width={50}
        placeholder={t(
          'admin.feature-flag-dashboard.search-placeholder',
          'Search by name, description, stage, or owner'
        )}
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
        prefix={<Icon name="search" />}
      />
      <InteractiveTable data={filtered} columns={columns} getRowId={(row) => row.name} pageSize={50} />
    </Stack>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  warnIcon: css({
    color: theme.colors.warning.main,
  }),
});
