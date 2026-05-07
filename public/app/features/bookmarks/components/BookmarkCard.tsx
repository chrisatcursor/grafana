import { css } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';
import { Badge, Stack, useStyles2 } from '@grafana/ui';
import { NavLandingPageCard } from 'app/core/components/NavLandingPage/NavLandingPageCard';

import { BookmarkEntry } from '../types';

interface Props {
  entry: BookmarkEntry;
}

/**
 * Card for one bookmark. User-defined category/tags use Badge — not NavLandingPageCard's
 * `category` prop, which is reserved for plugin card chrome (primary, secondary, …).
 */
export function BookmarkCard({ entry }: Props) {
  const styles = useStyles2(getStyles);
  const { item, category, tags } = entry;

  return (
    <div className={styles.cell}>
      <Stack direction="column" gap={1}>
        {(category?.trim() || (tags && tags.length > 0)) && (
          <Stack wrap gap={0.5}>
            {category?.trim() ? (
              <Badge text={category.trim()} color="blue" />
            ) : null}
            {tags?.map((tag) => (
              <Badge key={tag} text={tag} color="darkgrey" />
            ))}
          </Stack>
        )}
        <NavLandingPageCard description={item.subTitle} text={item.text} url={item.url ?? ''} />
      </Stack>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  cell: css({
    minWidth: 0,
  }),
});
