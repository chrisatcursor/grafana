import { t } from '@grafana/i18n';

import { BookmarkEntry, UNCATEGORIZED_GROUP_KEY } from './types';

const categoryCollator = new Intl.Collator(undefined, { sensitivity: 'base' });

function normalizeCategory(category: string | undefined): string {
  const trimmed = category?.trim();
  return trimmed ? trimmed : UNCATEGORIZED_GROUP_KEY;
}

export function collectCategoryOptions(entries: BookmarkEntry[]): string[] {
  const set = new Set<string>();
  for (const e of entries) {
    const key = normalizeCategory(e.category);
    if (key) {
      set.add(key);
    }
  }
  return [...set].sort(categoryCollator.compare);
}

export function filterEntriesBySearch(entries: BookmarkEntry[], query: string): BookmarkEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return entries;
  }
  return entries.filter((e) => {
    const text = [e.item.text, e.item.subTitle, e.url, e.category, ...(e.tags ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return text.includes(q);
  });
}

/** `null` = show all categories. */
export function filterEntriesByCategory(entries: BookmarkEntry[], category: string | null): BookmarkEntry[] {
  if (category === null) {
    return entries;
  }
  return entries.filter((e) => normalizeCategory(e.category) === category);
}

export function groupEntriesByCategory(entries: BookmarkEntry[]): Map<string, BookmarkEntry[]> {
  const map = new Map<string, BookmarkEntry[]>();
  for (const entry of entries) {
    const key = normalizeCategory(entry.category);
    const list = map.get(key) ?? [];
    list.push(entry);
    map.set(key, list);
  }
  return map;
}

/** Display label for a section header (uncategorized is translated). */
export function groupTitleFor(categoryKey: string): string {
  if (categoryKey === UNCATEGORIZED_GROUP_KEY) {
    return t('bookmarks-page.group.uncategorized', 'Uncategorized');
  }
  return categoryKey;
}

/** Stable section order: uncategorized first, then alphabetical category names. */
export function orderedBookmarkGroups(grouped: Map<string, BookmarkEntry[]>): Array<{ key: string; entries: BookmarkEntry[] }> {
  const keys = [...grouped.keys()].sort((a, b) => {
    if (a === UNCATEGORIZED_GROUP_KEY) {
      return -1;
    }
    if (b === UNCATEGORIZED_GROUP_KEY) {
      return 1;
    }
    return categoryCollator.compare(a, b);
  });
  return keys.map((key) => ({ key, entries: grouped.get(key)! }));
}
