import { css } from '@emotion/css';
import { useEffect, useMemo, useState } from 'react';

import { GrafanaTheme2, PageLayoutType } from '@grafana/data';
import { t } from '@grafana/i18n';
import { getBackendSrv, getDataSourceSrv } from '@grafana/runtime';
import { UrlSyncContextProvider } from '@grafana/scenes';
import { Alert, Box, Spinner, Stack, Text, useStyles2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';

import { DashboardScene } from '../../dashboard-scene/scene/DashboardScene';

import { buildNovaComInfraScene } from './buildNovaComInfraScene';

const TESTDATA_TYPE = 'grafana-testdata-datasource';

export function NovaComInfraDemoPage() {
  const styles = useStyles2(getStyles);
  const [datasourceUid, setDatasourceUid] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const resolveTestdataUid = async () => {
      const fromSrv = getDataSourceSrv().getList({ type: TESTDATA_TYPE })[0]?.uid;
      if (fromSrv) {
        if (!cancelled) {
          setDatasourceUid(fromSrv);
          setChecked(true);
        }
        return;
      }
      try {
        const list = await getBackendSrv().get<Array<{ type: string; uid: string }>>('/api/datasources');
        const uid = list.find((d) => d.type === TESTDATA_TYPE)?.uid ?? null;
        if (!cancelled) {
          setDatasourceUid(uid);
        }
      } catch {
        if (!cancelled) {
          setDatasourceUid(null);
        }
      } finally {
        if (!cancelled) {
          setChecked(true);
        }
      }
    };
    void resolveTestdataUid();
    return () => {
      cancelled = true;
    };
  }, []);

  const dashboard = useMemo(() => {
    if (!datasourceUid) {
      return null;
    }
    return buildNovaComInfraScene(datasourceUid);
  }, [datasourceUid]);

  useEffect(() => {
    if (!dashboard) {
      return;
    }
    const deactivate = dashboard.activate();
    return () => deactivate();
  }, [dashboard]);

  if (!checked) {
    return (
      <Page
        navId="dashboards/browse"
        layout={PageLayoutType.Standard}
        pageNav={{
          text: t('demo.novacom.page-title', 'NovaCom infrastructure demo'),
        }}
      >
        <Box padding={4} display="flex" justifyContent="center">
          <Spinner />
        </Box>
      </Page>
    );
  }

  if (!datasourceUid || !dashboard) {
    return (
      <Page
        navId="dashboards/browse"
        layout={PageLayoutType.Standard}
        pageNav={{
          text: t('demo.novacom.page-title', 'NovaCom infrastructure demo'),
        }}
      >
        <Box padding={3} className={styles.wrap}>
          <Alert
            severity="warning"
            title={t('demo.novacom.missing-testdata-title', 'TestData datasource required')}
          >
            {t(
              'demo.novacom.missing-testdata-body',
              'Add a Grafana TestData datasource to view this demo dashboard.'
            )}
          </Alert>
        </Box>
      </Page>
    );
  }

  return (
    <Page
      navId="dashboards/browse"
      layout={PageLayoutType.Canvas}
      pageNav={{
        text: t('demo.novacom.page-title', 'NovaCom infrastructure demo'),
        subTitle: t('demo.novacom.page-subtitle', 'Cloud infrastructure monitoring (synthetic data)'),
      }}
      data-testid="novacom-infra-demo-page"
    >
      <div className={styles.canvas}>
        <div
          className={styles.grafanaBanner}
          role="banner"
          data-testid="novacom-grafana-banner"
          aria-label={t('demo.novacom.banner-aria', 'Grafana demo dashboard banner')}
        >
          <Stack direction="row" alignItems="center" gap={1} wrap="wrap">
            <Text element="span" variant="bodySmall" weight="bold" className={styles.grafanaBannerTitle}>
              {t('demo.novacom.banner-title', 'Grafana')}
            </Text>
            <Text element="span" variant="bodySmall" className={styles.grafanaBannerText}>
              {t(
                'demo.novacom.banner-body',
                'Demo dashboard · NovaCom cloud infrastructure monitoring (synthetic TestData)'
              )}
            </Text>
          </Stack>
        </div>
        <UrlSyncContextProvider scene={dashboard} updateUrlOnInit={true} createBrowserHistorySteps={true}>
          <NovaComDashboardSceneView dashboard={dashboard} />
        </UrlSyncContextProvider>
      </div>
    </Page>
  );
}

function getStyles(theme: GrafanaTheme2) {
  return {
    wrap: css({
      maxWidth: theme.breakpoints.values.lg,
      margin: '0 auto',
    }),
    canvas: css({
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
    }),
    grafanaBanner: css({
      flexShrink: 0,
      width: '100%',
      marginBottom: theme.spacing(1),
      padding: theme.spacing(1, 2),
      borderRadius: theme.shape.radius.default,
      background: theme.colors.gradients.brandHorizontal,
      boxShadow: theme.shadows.z1,
    }),
    grafanaBannerTitle: css({
      color: theme.colors.text.maxContrast,
      letterSpacing: 0.02,
    }),
    grafanaBannerText: css({
      color: theme.colors.text.maxContrast,
      opacity: 0.95,
    }),
  };
}

export default NovaComInfraDemoPage;

/**
 * Renders controls + body only. Avoids DashboardSceneRenderer (toolbar/share flows expect
 * getDashboardSrv().getCurrent()); this demo scene is not registered there.
 */
function NovaComDashboardSceneView({ dashboard }: { dashboard: DashboardScene }) {
  const viewStyles = useStyles2(getDemoViewStyles);
  const controls = dashboard.state.controls;
  const body = dashboard.state.body;

  return (
    <div className={viewStyles.shell}>
      {controls && <controls.Component model={controls} />}
      <div className={viewStyles.bodyScroll}>
        <body.Component model={body} />
      </div>
    </div>
  );
}

function getDemoViewStyles(theme: GrafanaTheme2) {
  return {
    shell: css({
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      width: '100%',
    }),
    bodyScroll: css({
      flex: 1,
      minHeight: 360,
      overflow: 'auto',
    }),
  };
}
