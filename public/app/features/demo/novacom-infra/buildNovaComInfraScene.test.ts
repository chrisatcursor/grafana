import { AutoGridLayoutManager } from 'app/features/dashboard-scene/scene/layout-auto-grid/AutoGridLayoutManager';

import { buildNovaComInfraScene } from './buildNovaComInfraScene';

describe('buildNovaComInfraScene', () => {
  it('places overview KPIs in a single auto-grid row with five panels', () => {
    const scene = buildNovaComInfraScene('testdata-uid');
    const overviewRow = scene.state.body.state.rows[0];
    expect(overviewRow.state.title).toBe('Overview');
    const layout = overviewRow.state.layout;
    expect(layout).toBeInstanceOf(AutoGridLayoutManager);
    const autoGrid = layout.state.layout;
    expect(autoGrid.state.templateColumns).toBe('repeat(5, minmax(0, 1fr))');
    expect(autoGrid.state.children).toHaveLength(5);
  });
});
