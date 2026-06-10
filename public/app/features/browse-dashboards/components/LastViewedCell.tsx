import { css } from '@emotion/css';
import Skeleton from 'react-loading-skeleton';

import { dateTime, dateTimeFormat, dateTimeFormatTimeAgo, GrafanaTheme2 } from '@grafana/data';
import { t } from '@grafana/i18n';
import { Text, Tooltip, useStyles2 } from '@grafana/ui';

import { DashboardsTreeCellProps } from '../types';

/**
 * Displays relative "last viewed" time for dashboard rows in the Browse tree.
 * Folders and placeholder rows leave this cell empty; dashboards without data show a muted "Never".
 *
 * Patterns: {@link TagsCell} structure, {@link NameCell} Text + theme tokens, dates via `dateTimeFormat*` (@grafana/data).
 */
export function LastViewedCell({ row: { original: data } }: DashboardsTreeCellProps) {
  const styles = useStyles2(getStyles);
  const item = data.item;

  if (item.kind === 'ui') {
    if (item.uiKind === 'pagination-placeholder') {
      return <Skeleton width={72} />;
    }
    return null;
  }

  if (item.kind === 'folder') {
    return null;
  }

  const raw = item.lastViewed;
  if (raw === undefined || raw === null || raw === '') {
    return (
      <Text element="span" variant="bodySmall" color="secondary" truncate className={styles.muted}>
        {t('browse-dashboards.last-viewed-cell.never', 'Never')}
      </Text>
    );
  }

  const dt = dateTime(raw);
  if (!dt.isValid()) {
    return (
      <Text element="span" variant="bodySmall" color="secondary" truncate>
        {t('browse-dashboards.last-viewed-cell.invalid-date', '—')}
      </Text>
    );
  }

  const absolute = dateTimeFormat(dt, { format: 'LL LTS' });
  const relative = dateTimeFormatTimeAgo(dt);

  return (
    <Tooltip content={absolute}>
      <Text element="span" variant="bodySmall" truncate className={styles.relative}>
        {relative}
      </Text>
    </Tooltip>
  );
}

function getStyles(theme: GrafanaTheme2) {
  return {
    muted: css({
      fontStyle: 'italic',
    }),
    relative: css({
      cursor: 'default',
      borderBottom: `1px dotted ${theme.colors.border.medium}`,
    }),
  };
}
