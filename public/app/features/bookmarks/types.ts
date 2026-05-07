import { NavModelItem } from '@grafana/data';

/** Per-bookmark metadata once backend prefs include it (categories/tags). */
export interface BookmarkMetadata {
  category?: string;
  tags?: string[];
}

/** One row in the Bookmarks UI: resolved nav item + optional metadata. */
export interface BookmarkEntry {
  item: NavModelItem;
  url: string;
  category?: string;
  tags?: string[];
}

/** Serialized key for bookmarks without a category — used for grouping and i18n. */
export const UNCATEGORIZED_GROUP_KEY = '';
