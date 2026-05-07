import { css } from '@emotion/css';
import { useMemo } from 'react';

import { GrafanaTheme2, SelectableValue } from '@grafana/data';
import { t } from '@grafana/i18n';
import { FilterInput, Select, Stack, useStyles2 } from '@grafana/ui';

import { collectCategoryOptions } from '../bookmarkModel';
import { BookmarkEntry } from '../types';

interface Props {
  entries: BookmarkEntry[];
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string | null;
  onCategoryFilterChange: (value: string | null) => void;
}

export function BookmarksToolbar({
  entries,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
}: Props) {
  const styles = useStyles2(getStyles);
  const categoryNames = useMemo(() => collectCategoryOptions(entries), [entries]);

  const selectOptions: Array<SelectableValue<string>> = useMemo(
    () => [
      {
        label: t('bookmarks-page.toolbar.filter-category-all', 'All categories'),
        value: '',
      },
      ...categoryNames.map((name) => ({ label: name, value: name })),
    ],
    [categoryNames]
  );

  const selectValue = useMemo(() => {
    if (categoryFilter === null) {
      return selectOptions[0];
    }
    return selectOptions.find((o) => o.value === categoryFilter) ?? selectOptions[0];
  }, [categoryFilter, selectOptions]);

  return (
    <Stack direction="row" gap={2} wrap alignItems="center" className={styles.toolbar}>
      <div className={styles.search}>
        <FilterInput
          placeholder={t('bookmarks-page.toolbar.search-placeholder', 'Search bookmarks')}
          value={search}
          escapeRegex={false}
          onChange={onSearchChange}
        />
      </div>
      {categoryNames.length > 0 && (
        <Select
          inputId="bookmarks-category-filter"
          width={28}
          options={selectOptions}
          value={selectValue}
          isClearable={false}
          onChange={(v) => {
            if (!v || v.value === '') {
              onCategoryFilterChange(null);
            } else {
              onCategoryFilterChange(v.value);
            }
          }}
        />
      )}
    </Stack>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  toolbar: css({
    marginBottom: theme.spacing(2),
  }),
  search: css({
    flex: '1 1 200px',
    minWidth: theme.spacing(30),
  }),
});
