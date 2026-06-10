import type { ComponentProps } from 'react';

import { render, screen } from 'test/test-utils';

import { DashboardViewItem } from 'app/features/search/types';

import { type DashboardsTreeItem } from '../types';

import { LastViewedCell } from './LastViewedCell';

function makeProps(data: DashboardsTreeItem): ComponentProps<typeof LastViewedCell> {
  return {
    row: { original: data },
    column: { id: 'lastViewed' },
    cell: {} as ComponentProps<typeof LastViewedCell>['cell'],
    value: undefined,
  } as ComponentProps<typeof LastViewedCell>;
}

describe('LastViewedCell', () => {
  it('shows Never for a dashboard with no lastViewed', () => {
    const item: DashboardViewItem = {
      kind: 'dashboard',
      uid: 'a',
      title: 'My dash',
      tags: [],
    };
    const data: DashboardsTreeItem = { item, level: 0, isOpen: false };
    render(<LastViewedCell {...makeProps(data)} />);
    expect(screen.getByText('Never')).toBeInTheDocument();
  });

  it('renders nothing for a folder row', () => {
    const item: DashboardViewItem = {
      kind: 'folder',
      uid: 'f',
      title: 'Folder',
      url: '/x',
    };
    const data: DashboardsTreeItem = { item, level: 0, isOpen: false };
    const { container } = render(<LastViewedCell {...makeProps(data)} />);
    expect(container).toBeEmptyDOMElement();
  });
});
