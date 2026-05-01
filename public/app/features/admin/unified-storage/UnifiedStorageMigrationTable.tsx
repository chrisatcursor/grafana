import { useMemo } from 'react';

import { t } from '@grafana/i18n';
import { CellProps, Column, InteractiveTable, Text, Tooltip, Icon, Stack } from '@grafana/ui';

import { StorageModeBadge } from './StorageModeBadge';
import type { UnifiedStorageMigrationResource } from './types';

type Cell<T extends keyof UnifiedStorageMigrationResource = keyof UnifiedStorageMigrationResource> = CellProps<
  UnifiedStorageMigrationResource,
  UnifiedStorageMigrationResource[T]
>;

interface Props {
  rows: UnifiedStorageMigrationResource[];
}

export function UnifiedStorageMigrationTable({ rows }: Props) {
  const columns: Array<Column<UnifiedStorageMigrationResource>> = useMemo(
    () => [
      {
        id: 'resource',
        header: t('admin.unified-storage-migration.column-resource', 'Resource'),
        cell: ({ row: { original } }: Cell) => (
          <Text>
            {original.resource}.{original.group}
          </Text>
        ),
        sortType: 'string',
      },
      {
        id: 'configKey',
        header: t('admin.unified-storage-migration.column-config-key', 'Config key'),
        cell: ({ cell: { value } }: Cell<'configKey'>) => value,
        sortType: 'string',
      },
      {
        id: 'storageMode',
        header: t('admin.unified-storage-migration.column-storage-mode', 'Storage mode'),
        cell: ({ cell: { value } }: Cell<'storageMode'>) => <StorageModeBadge mode={value} />,
        sortType: 'string',
      },
      {
        id: 'dualWriterMode',
        header: t('admin.unified-storage-migration.column-dual-writer-mode', 'Dual writer mode'),
        cell: ({ cell: { value } }: Cell<'dualWriterMode'>) => value,
        sortType: 'number',
      },
      {
        id: 'enableMigration',
        header: t('admin.unified-storage-migration.column-enable-migration', 'Enable migration'),
        cell: ({ cell: { value } }: Cell<'enableMigration'>) => (value ? 'true' : 'false'),
        sortType: 'basic',
      },
      {
        id: 'migrationDefinitionId',
        header: t('admin.unified-storage-migration.column-migration-def', 'Migration definition'),
        cell: ({ cell: { value } }: Cell<'migrationDefinitionId'>) => value,
        sortType: 'string',
      },
      {
        id: 'migrationLogError',
        header: t('admin.unified-storage-migration.column-log-status', 'Migration log'),
        cell: ({ row: { original } }: Cell) =>
          original.migrationLogError ? (
            <Stack direction="row" gap={1} alignItems="center">
              <Tooltip content={original.migrationLogError}>
                <Icon name="exclamation-triangle" />
              </Tooltip>
              <Text color="secondary">{t('admin.unified-storage-migration.log-degraded', 'Degraded')}</Text>
            </Stack>
          ) : (
            '—'
          ),
      },
    ],
    []
  );

  return (
    <InteractiveTable
      columns={columns}
      data={rows}
      getRowId={(row) => `${row.resource}.${row.group}`}
      pageSize={20}
    />
  );
}
