/* eslint-disable @grafana/i18n/no-untranslated-strings -- DEV-29 demo: fixed NovaCom copy per PRD */
import {
  FieldColorModeId,
  MappingType,
  ThresholdsMode,
  VizOrientation,
} from '@grafana/data';
import { config } from '@grafana/runtime';
import {
  behaviors,
  SceneGridLayout,
  SceneQueryRunner,
  SceneRefreshPicker,
  SceneTimePicker,
  SceneTimeRange,
  VizPanel,
} from '@grafana/scenes';
import { DashboardCursorSync } from '@grafana/schema';

import { DashboardControls } from '../../dashboard-scene/scene/DashboardControls';
import { DashboardScene } from '../../dashboard-scene/scene/DashboardScene';
import { AutoGridItem } from '../../dashboard-scene/scene/layout-auto-grid/AutoGridItem';
import { AutoGridLayout } from '../../dashboard-scene/scene/layout-auto-grid/AutoGridLayout';
import { AutoGridLayoutManager } from '../../dashboard-scene/scene/layout-auto-grid/AutoGridLayoutManager';
import { DashboardGridItem } from '../../dashboard-scene/scene/layout-default/DashboardGridItem';
import { DefaultGridLayoutManager } from '../../dashboard-scene/scene/layout-default/DefaultGridLayoutManager';
import { RowItem } from '../../dashboard-scene/scene/layout-rows/RowItem';
import { RowsLayoutManager } from '../../dashboard-scene/scene/layout-rows/RowsLayoutManager';

const DS_TYPE = 'grafana-testdata-datasource';

function td(uid: string, refId: string, query: Record<string, unknown>) {
  return {
    refId,
    datasource: { type: DS_TYPE, uid },
    ...query,
  };
}

const SERVICE_TABLE_CSV = `service,status,version,region
api-gateway,healthy,2.4.1,us-east-1
auth-service,healthy,1.9.0,us-east-1
orders-service,degraded,3.2.0,eu-west-1
payment-service,healthy,2.1.3,us-west-2
inventory-api,healthy,1.4.2,us-east-1
notifications,down,0.9.1,ap-south-1
search-indexer,healthy,4.0.0,us-east-1
billing-worker,healthy,2.0.8,eu-west-1
cdn-edge,healthy,1.1.0,global
analytics-pipeline,healthy,5.2.1,us-east-1`;

const LATENCY_CSV = `Service,P50_ms,P90_ms,P99_ms
API Gateway,14,48,112
Auth Service,9,35,89
Orders Service,22,61,140
Payment Service,11,40,95
Inventory API,18,55,118
Notifications,45,120,240
Search Indexer,8,28,72
Billing Worker,16,52,105
CDN Edge,4,12,28
Analytics,31,88,195`;

const DISK_CSV = `volume,usage_pct
/data/prod-db,78
/data/analytics,91
/var/log/aggr,64
/mnt/cache-ssd,45
/data/backup,88
/opt/app-config,33`;

const CAPACITY_CSV = `volume,projected_90pct,days_to_threshold
/data/prod-db,2026-03-29,12
/data/analytics,2026-03-24,7
/var/log/aggr,2026-04-02,16
/mnt/cache-ssd,2026-05-01,45
/data/backup,2026-03-26,9`;

/**
 * DEV-29: NovaCom Cloud Infrastructure Monitoring demo — TestData only, Scenes-based.
 */
export function buildNovaComInfraScene(datasourceUid: string): DashboardScene {
  const uid = datasourceUid;

  // Auto grid keeps five overview tiles in one horizontal row; DefaultGridLayout stacks at width < 768px.
  const overviewGrid = new AutoGridLayout({
    isDraggable: false,
    templateColumns: 'repeat(5, minmax(0, 1fr))',
    autoRows: 'minmax(175px, auto)',
    rowGap: 1,
    columnGap: 1,
    md: {
      templateColumns: 'repeat(5, minmax(0, 1fr))',
      autoRows: 'minmax(155px, auto)',
      rowGap: 1,
      columnGap: 0.5,
    },
    children: [
      new AutoGridItem({
        key: 'ag-novacom-hosts',
        body: new VizPanel({
          title: 'Total Hosts',
          key: 'panel-hosts',
          pluginId: 'stat',
          $data: new SceneQueryRunner({
            datasource: { type: DS_TYPE, uid },
            queries: [
              td(uid, 'A', {
                scenarioId: 'predictable_pulse',
                pulseWave: { onValue: 248, offValue: 248, onCount: 50, offCount: 0, timeStep: 60 },
              }),
            ],
          }),
          fieldConfig: {
            defaults: {
              unit: 'short',
              decimals: 0,
              color: { mode: FieldColorModeId.Fixed, fixedColor: 'blue' },
            },
            overrides: [],
          },
        }),
      }),
      new AutoGridItem({
        key: 'ag-novacom-alerts',
        body: new VizPanel({
          title: 'Active Alerts',
          key: 'panel-alerts',
          pluginId: 'stat',
          $data: new SceneQueryRunner({
            datasource: { type: DS_TYPE, uid },
            queries: [td(uid, 'A', { scenarioId: 'random_walk', seriesCount: 1, spread: 4, noise: 0.5 })],
          }),
          fieldConfig: {
            defaults: {
              unit: 'short',
              decimals: 0,
              thresholds: {
                mode: ThresholdsMode.Absolute,
                steps: [
                  { value: 0, color: 'green' },
                  { value: 6, color: 'yellow' },
                  { value: 14, color: 'red' },
                ],
              },
            },
            overrides: [],
          },
        }),
      }),
      new AutoGridItem({
        key: 'ag-novacom-cpu-gauge',
        body: new VizPanel({
          title: 'Avg CPU Usage',
          key: 'panel-cpu-g',
          pluginId: 'gauge',
          $data: new SceneQueryRunner({
            datasource: { type: DS_TYPE, uid },
            queries: [td(uid, 'A', { scenarioId: 'random_walk', seriesCount: 1, spread: 15, noise: 1 })],
          }),
          fieldConfig: {
            defaults: {
              min: 0,
              max: 100,
              unit: 'percent',
              thresholds: {
                mode: ThresholdsMode.Absolute,
                steps: [
                  { value: 0, color: 'green' },
                  { value: 60, color: 'yellow' },
                  { value: 85, color: 'red' },
                ],
              },
            },
            overrides: [],
          },
        }),
      }),
      new AutoGridItem({
        key: 'ag-novacom-mem-gauge',
        body: new VizPanel({
          title: 'Avg Memory',
          key: 'panel-mem-g',
          pluginId: 'gauge',
          $data: new SceneQueryRunner({
            datasource: { type: DS_TYPE, uid },
            queries: [td(uid, 'A', { scenarioId: 'random_walk', seriesCount: 1, spread: 12, noise: 1 })],
          }),
          fieldConfig: {
            defaults: {
              min: 0,
              max: 100,
              unit: 'percent',
              thresholds: {
                mode: ThresholdsMode.Absolute,
                steps: [
                  { value: 0, color: 'green' },
                  { value: 70, color: 'yellow' },
                  { value: 90, color: 'red' },
                ],
              },
            },
            overrides: [],
          },
        }),
      }),
      new AutoGridItem({
        key: 'ag-novacom-uptime',
        body: new VizPanel({
          title: 'Uptime (30d)',
          key: 'panel-uptime',
          pluginId: 'stat',
          $data: new SceneQueryRunner({
            datasource: { type: DS_TYPE, uid },
            queries: [
              td(uid, 'A', {
                scenarioId: 'predictable_pulse',
                pulseWave: { onValue: 99.94, offValue: 99.94, onCount: 100, offCount: 0, timeStep: 60 },
              }),
            ],
          }),
          fieldConfig: {
            defaults: {
              unit: 'percent',
              decimals: 2,
              thresholds: {
                mode: ThresholdsMode.Absolute,
                steps: [
                  { value: 0, color: 'red' },
                  { value: 99, color: 'yellow' },
                  { value: 99.9, color: 'green' },
                ],
              },
            },
            overrides: [],
          },
        }),
      }),
    ],
  });

  const rowOverview = new RowItem({
    title: 'Overview',
    layout: new AutoGridLayoutManager({
      maxColumnCount: 5,
      columnWidth: 'narrow',
      rowHeight: 'short',
      layout: overviewGrid,
    }),
  });

  const rowSeries = new RowItem({
    title: 'Resource metrics (7d)',
    layout: new DefaultGridLayoutManager({
      grid: new SceneGridLayout({
        children: [
          new DashboardGridItem({
            key: 'novacom-cpu-ts',
            x: 0,
            y: 0,
            width: 24,
            height: 9,
            body: new VizPanel({
              title: 'CPU Utilization by Host',
              key: 'panel-cpu-ts',
              pluginId: 'timeseries',
              $data: new SceneQueryRunner({
                datasource: { type: DS_TYPE, uid },
                queries: [
                  td(uid, 'A', {
                    scenarioId: 'random_walk',
                    seriesCount: 6,
                    spread: 25,
                    noise: 2,
                    labels: 'host=host-$seriesIndex',
                  }),
                ],
              }),
              options: {
                legend: { showLegend: true, displayMode: 'list', placement: 'bottom' },
                tooltip: { mode: 'multi', sort: 'desc' },
              },
              fieldConfig: {
                defaults: {
                  unit: 'percent',
                  custom: {
                    drawStyle: 'line',
                    fillOpacity: 8,
                    showPoints: 'never',
                  },
                },
                overrides: [],
              },
            }),
          }),
          new DashboardGridItem({
            key: 'novacom-mem-ts',
            x: 0,
            y: 9,
            width: 24,
            height: 9,
            body: new VizPanel({
              title: 'Memory Consumption by Host',
              key: 'panel-mem-ts',
              pluginId: 'timeseries',
              $data: new SceneQueryRunner({
                datasource: { type: DS_TYPE, uid },
                queries: [
                  td(uid, 'A', {
                    scenarioId: 'random_walk',
                    seriesCount: 6,
                    spread: 18,
                    noise: 1.5,
                    labels: 'host=host-$seriesIndex',
                  }),
                ],
              }),
              options: {
                legend: { showLegend: true, displayMode: 'list', placement: 'bottom' },
                tooltip: { mode: 'multi', sort: 'desc' },
              },
              fieldConfig: {
                defaults: {
                  unit: 'deckbytes',
                  custom: {
                    drawStyle: 'line',
                    fillOpacity: 10,
                    showPoints: 'never',
                  },
                  thresholds: {
                    mode: ThresholdsMode.Absolute,
                    steps: [
                      { value: 0, color: 'green' },
                      { value: 8000000000, color: 'yellow' },
                      { value: 12000000000, color: 'red' },
                    ],
                  },
                },
                overrides: [],
              },
            }),
          }),
          new DashboardGridItem({
            key: 'novacom-net-ts',
            x: 0,
            y: 18,
            width: 24,
            height: 9,
            body: new VizPanel({
              title: 'Network I/O (bytes/s)',
              key: 'panel-net-ts',
              pluginId: 'timeseries',
              $data: new SceneQueryRunner({
                datasource: { type: DS_TYPE, uid },
                queries: [
                  td(uid, 'A', {
                    scenarioId: 'random_walk',
                    seriesCount: 1,
                    spread: 400000,
                    labels: 'direction=ingress',
                  }),
                  td(uid, 'B', {
                    scenarioId: 'random_walk',
                    seriesCount: 1,
                    spread: 320000,
                    labels: 'direction=egress',
                  }),
                ],
              }),
              options: {
                legend: { showLegend: true, displayMode: 'list', placement: 'bottom' },
                tooltip: { mode: 'multi', sort: 'desc' },
              },
              fieldConfig: {
                defaults: {
                  unit: 'Bps',
                  custom: { drawStyle: 'line', fillOpacity: 15, showPoints: 'never' },
                },
                overrides: [],
              },
            }),
          }),
        ],
      }),
    }),
  });

  const rowHealth = new RowItem({
    title: 'Service health',
    layout: new DefaultGridLayoutManager({
      grid: new SceneGridLayout({
        children: [
          new DashboardGridItem({
            key: 'novacom-svc-table',
            x: 0,
            y: 0,
            width: 10,
            height: 12,
            body: new VizPanel({
              title: 'Service Status',
              key: 'panel-svc-table',
              pluginId: 'table',
              $data: new SceneQueryRunner({
                datasource: { type: DS_TYPE, uid },
                queries: [
                  td(uid, 'A', {
                    scenarioId: 'csv_content',
                    csvContent: SERVICE_TABLE_CSV,
                  }),
                ],
              }),
              fieldConfig: {
                defaults: {},
                overrides: [
                  {
                    matcher: { id: 'byName', options: 'status' },
                    properties: [
                      {
                        id: 'mappings',
                        value: [
                          {
                            type: MappingType.ValueToText,
                            options: {
                              healthy: { text: 'Healthy', color: 'green' },
                              degraded: { text: 'Degraded', color: 'yellow' },
                              down: { text: 'Down', color: 'red' },
                            },
                          },
                        ],
                      },
                      { id: 'custom.cellOptions', value: { type: 'color-text' } },
                    ],
                  },
                ],
              },
            }),
          }),
          new DashboardGridItem({
            key: 'novacom-latency-bar',
            x: 10,
            y: 0,
            width: 14,
            height: 12,
            body: new VizPanel({
              title: 'Request Latency by Service (ms)',
              key: 'panel-latency-bar',
              pluginId: 'barchart',
              $data: new SceneQueryRunner({
                datasource: { type: DS_TYPE, uid },
                queries: [
                  td(uid, 'A', {
                    scenarioId: 'csv_content',
                    csvContent: LATENCY_CSV,
                  }),
                ],
              }),
              options: {
                orientation: VizOrientation.Horizontal,
                xField: 'Service',
                legend: { showLegend: true, placement: 'bottom' },
                stacking: 'none',
              },
            }),
          }),
          new DashboardGridItem({
            key: 'novacom-err-ts',
            x: 0,
            y: 12,
            width: 24,
            height: 8,
            body: new VizPanel({
              title: '5xx Error Rate by Service',
              key: 'panel-err-ts',
              pluginId: 'timeseries',
              $data: new SceneQueryRunner({
                datasource: { type: DS_TYPE, uid },
                queries: [
                  td(uid, 'A', {
                    scenarioId: 'random_walk',
                    seriesCount: 5,
                    spread: 2.5,
                    noise: 0.3,
                    labels: 'service=svc-$seriesIndex',
                  }),
                ],
              }),
              options: {
                legend: { showLegend: true, displayMode: 'list', placement: 'bottom' },
                tooltip: { mode: 'multi', sort: 'desc' },
              },
              fieldConfig: {
                defaults: {
                  unit: 'reqps',
                  custom: { drawStyle: 'line', fillOpacity: 20, showPoints: 'never' },
                  color: { mode: FieldColorModeId.PaletteClassic },
                },
                overrides: [],
              },
            }),
          }),
        ],
      }),
    }),
  });

  const rowCapacity = new RowItem({
    title: 'Capacity planning',
    layout: new DefaultGridLayoutManager({
      grid: new SceneGridLayout({
        children: [
          new DashboardGridItem({
            key: 'novacom-disk-bar',
            x: 0,
            y: 0,
            width: 12,
            height: 10,
            body: new VizPanel({
              title: 'Disk Usage by Volume (%)',
              key: 'panel-disk-bar',
              pluginId: 'barchart',
              $data: new SceneQueryRunner({
                datasource: { type: DS_TYPE, uid },
                queries: [
                  td(uid, 'A', {
                    scenarioId: 'csv_content',
                    csvContent: DISK_CSV,
                  }),
                ],
              }),
              options: {
                orientation: VizOrientation.Horizontal,
                xField: 'volume',
                legend: { showLegend: false },
              },
              fieldConfig: {
                defaults: {
                  unit: 'percent',
                  min: 0,
                  max: 100,
                  thresholds: {
                    mode: ThresholdsMode.Absolute,
                    steps: [
                      { value: 0, color: 'green' },
                      { value: 75, color: 'yellow' },
                      { value: 90, color: 'red' },
                    ],
                  },
                },
                overrides: [],
              },
            }),
          }),
          new DashboardGridItem({
            key: 'novacom-capacity-table',
            x: 12,
            y: 0,
            width: 12,
            height: 10,
            body: new VizPanel({
              title: 'Projected Capacity (90% within 14d)',
              key: 'panel-cap-table',
              pluginId: 'table',
              $data: new SceneQueryRunner({
                datasource: { type: DS_TYPE, uid },
                queries: [
                  td(uid, 'A', {
                    scenarioId: 'csv_content',
                    csvContent: CAPACITY_CSV,
                  }),
                ],
              }),
              fieldConfig: {
                defaults: {
                  custom: {
                    align: 'auto',
                    inspect: false,
                  },
                },
                overrides: [
                  {
                    matcher: { id: 'byName', options: 'days_to_threshold' },
                    properties: [
                      {
                        id: 'thresholds',
                        value: {
                          mode: ThresholdsMode.Absolute,
                          steps: [
                            { value: 0, color: 'green' },
                            { value: 10, color: 'yellow' },
                            { value: 14, color: 'red' },
                          ],
                        },
                      },
                      { id: 'color', value: { mode: FieldColorModeId.Thresholds } },
                    ],
                  },
                ],
              },
            }),
          }),
        ],
      }),
    }),
  });

  return new DashboardScene({
    title: 'NovaCom — Cloud Infrastructure Monitoring',
    description: 'Demo dashboard (NovaCom Technologies). Synthetic data via TestData.',
    uid: 'novacom-infra-demo',
    tags: ['nova-com', 'demo', 'infrastructure'],
    editable: false,
    meta: {
      canEdit: false,
      canSave: false,
      canDelete: false,
      canShare: true,
    },
    $timeRange: new SceneTimeRange({
      from: 'now-7d',
      to: 'now',
      timeZone: 'browser',
    }),
    controls: new DashboardControls({
      timePicker: new SceneTimePicker({
        quickRanges: config.quickRanges,
        defaultQuickRanges: config.quickRanges,
      }),
      refreshPicker: new SceneRefreshPicker({
        intervals: ['5s', '10s', '30s', '1m', '5m'],
        refresh: '30s',
        withText: true,
      }),
    }),
    $behaviors: [new behaviors.CursorSync({ sync: DashboardCursorSync.Crosshair })],
    body: new RowsLayoutManager({
      rows: [rowOverview, rowSeries, rowHealth, rowCapacity],
    }),
  });
}
