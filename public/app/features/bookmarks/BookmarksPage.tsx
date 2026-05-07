import { useMemo, useState } from 'react';

import { Trans, t } from '@grafana/i18n';
import { EmptyState } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';

import {
  filterEntriesByCategory,
  filterEntriesBySearch,
  groupEntriesByCategory,
  orderedBookmarkGroups,
} from './bookmarkModel';
import { BookmarksGroupedView } from './components/BookmarksGroupedView';
import { BookmarksToolbar } from './components/BookmarksToolbar';
import { useBookmarkEntries } from './hooks/useBookmarkEntries';

export function BookmarksPage() {
  const allEntries = useBookmarkEntries();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    const bySearch = filterEntriesBySearch(allEntries, search);
    return filterEntriesByCategory(bySearch, categoryFilter);
  }, [allEntries, categoryFilter, search]);

  const groupedOrdered = useMemo(() => {
    return orderedBookmarkGroups(groupEntriesByCategory(filteredEntries));
  }, [filteredEntries]);

  const hadBookmarks = allEntries.length > 0;
  const hasVisibleBookmarks = filteredEntries.length > 0;

  return (
    <Page navId="bookmarks">
      <Page.Contents>
        {!hadBookmarks ? (
          <EmptyState
            variant="call-to-action"
            message={t('bookmarks-page.empty.message', 'It looks like you haven’t created any bookmarks yet')}
          >
            <Trans i18nKey="bookmarks-page.empty.tip">
              Hover over any item in the nav menu and click on the bookmark icon to add it here.
            </Trans>
          </EmptyState>
        ) : (
          <>
            <BookmarksToolbar
              entries={allEntries}
              search={search}
              onSearchChange={setSearch}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
            />
            {hasVisibleBookmarks ? (
              <BookmarksGroupedView groupedOrdered={groupedOrdered} />
            ) : (
              <EmptyState
                variant="not-found"
                message={t(
                  'bookmarks-page.filtered-empty.message',
                  'No bookmarks match your filters. Try adjusting search or category.'
                )}
              />
            )}
          </>
        )}
      </Page.Contents>
    </Page>
  );
}

export default BookmarksPage;
