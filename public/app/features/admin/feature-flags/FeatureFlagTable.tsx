import { useMemo } from 'react';

import { Trans, t } from '@grafana/i18n';
import { Badge, InteractiveTable, Text, type CellProps, type Column } from '@grafana/ui';

import type { FeatureToggleStatusDTO } from './types';

type Row = FeatureToggleStatusDTO;

type Cell<T extends keyof Row = keyof Row> = CellProps<Row, Row[T]>;

interface Props {
  toggles: Row[];
}

export function FeatureFlagTable({ toggles }: Props) {
  const columns: Array<Column<Row>> = useMemo(
    () => [
      {
        id: 'name',
        header: () => <Trans i18nKey="admin.feature-flags.column-name">Name</Trans>,
        cell: ({ row: { original } }: Cell<'name'>) => (
          <Text element="span" weight="medium">
            {original.name}
          </Text>
        ),
        sortType: 'string',
      },
      {
        id: 'stage',
        header: () => <Trans i18nKey="admin.feature-flags.column-stage">Stage</Trans>,
        cell: ({ row: { original } }: Cell<'stage'>) => <StageBadge stage={original.stage} />,
      },
      {
        id: 'enabled',
        header: () => <Trans i18nKey="admin.feature-flags.column-enabled">Enabled</Trans>,
        cell: ({ row: { original } }: Cell<'enabled'>) => (
          <Badge
            text={
              original.enabled
                ? t('admin.feature-flags.enabled-on', 'On')
                : t('admin.feature-flags.enabled-off', 'Off')
            }
            color={original.enabled ? 'green' : 'red'}
          />
        ),
      },
      {
        id: 'description',
        header: () => <Trans i18nKey="admin.feature-flags.column-description">Description</Trans>,
        cell: ({ row: { original } }: Cell<'description'>) => (
          <Text color="secondary" truncate>
            {original.description ?? '—'}
          </Text>
        ),
      },
      {
        id: 'attributes',
        header: () => <Trans i18nKey="admin.feature-flags.column-attributes">Attributes</Trans>,
        cell: ({ row: { original } }: Cell) => (
          <Text color="secondary">
            {[original.frontendOnly && 'Frontend', original.requiresRestart && 'Restart']
              .filter(Boolean)
              .join(' · ') || '—'}
          </Text>
        ),
      },
    ],
    []
  );

  return <InteractiveTable columns={columns} data={toggles} getRowId={(row) => row.name} />;
}

function StageBadge({ stage }: { stage: string }) {
  const color =
    stage === 'GA' || stage === 'generalAvailability'
      ? 'blue'
      : stage === 'deprecated'
        ? 'red'
        : stage === 'experimental' || stage === 'privatePreview'
          ? 'orange'
          : 'purple';

  return <Badge text={stage || 'unknown'} color={color} />;
}
