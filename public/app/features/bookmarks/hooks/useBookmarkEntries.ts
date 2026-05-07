import { useMemo } from 'react';

import { usePinnedItems } from 'app/core/components/AppChrome/MegaMenu/hooks';
import { findByUrl } from 'app/core/components/AppChrome/MegaMenu/utils';
import { useSelector } from 'app/types/store';

import { BookmarkEntry, BookmarkMetadata } from '../types';

function bookmarkMetadataPlaceholder(): Record<string, BookmarkMetadata> {
  // TODO: map from user preferences when backend exposes bookmark metadata.
  return {};
}

export function useBookmarkEntries(): BookmarkEntry[] {
  const pinnedItems = usePinnedItems();
  const navTree = useSelector((state) => state.navBarTree);
  const metadataByUrl = bookmarkMetadataPlaceholder();

  return useMemo(() => {
    return pinnedItems.reduce((acc: BookmarkEntry[], url) => {
      const item = findByUrl(navTree, url);
      if (!item) {
        return acc;
      }
      const meta = metadataByUrl[url] ?? {};
      acc.push({
        item,
        url,
        category: meta.category,
        tags: meta.tags,
      });
      return acc;
    }, []);
  }, [metadataByUrl, navTree, pinnedItems]);
}
