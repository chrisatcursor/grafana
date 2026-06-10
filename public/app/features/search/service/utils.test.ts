import { queryResultToViewItem } from './utils';
import { DashboardQueryResult } from './types';

describe('queryResultToViewItem', () => {
  it('maps lastViewed from search results', () => {
    const item: DashboardQueryResult = {
      kind: 'dashboard',
      name: 'My Dashboard',
      uid: 'abc',
      url: '/d/abc/my-dashboard',
      panel_type: '',
      tags: [],
      location: 'general',
      ds_uid: [],
      score: 0,
      explain: {},
      lastViewed: '2024-06-01T12:00:00Z',
    };

    const viewItem = queryResultToViewItem(item);
    expect(viewItem.lastViewed).toBe('2024-06-01T12:00:00Z');
  });
});
