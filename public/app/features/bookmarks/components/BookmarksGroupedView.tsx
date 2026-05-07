import { css } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';
import { Text, useStyles2 } from '@grafana/ui';

import { groupTitleFor } from '../bookmarkModel';
import { BookmarkEntry } from '../types';

import { BookmarkCard } from './BookmarkCard';

interface Props {
  groupedOrdered: Array<{ key: string; entries: BookmarkEntry[] }>;
}

/**
 * Renders bookmark groups (by category) using the same grid metrics as NavLandingPage.
 */
export function BookmarksGroupedView({ groupedOrdered }: Props) {
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.root}>
      {groupedOrdered.map((group) => (
        <section key={group.key || '_uncategorized'} className={styles.section}>
          <Text element="h2" variant="h5">
            {groupTitleFor(group.key)}
          </Text>
          <div className={styles.grid}>
            {group.entries.map((entry) => (
              <BookmarkCard key={entry.item.id || entry.url} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  root: css({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  }),
  section: css({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
  }),
  grid: css({
    display: 'grid',
    gap: theme.spacing(3),
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gridAutoRows: 'auto',
    padding: theme.spacing(2, 0),
  }),
});
