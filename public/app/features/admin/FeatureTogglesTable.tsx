import { css } from '@emotion/css';
import { Fragment } from 'react';
import Skeleton from 'react-loading-skeleton';

import { GrafanaTheme2 } from '@grafana/data';
import { Trans, t } from '@grafana/i18n';
import { Badge, EmptyState, Icon, ScrollContainer, Text, Tooltip, useStyles2 } from '@grafana/ui';
import { SkeletonComponent, attachSkeleton } from '@grafana/ui/unstable';

import { FeatureFlagDTO } from './AdminFeatureTogglesPage';

interface Props {
  featureToggles: FeatureFlagDTO[];
  showEmpty?: boolean;
}

function getStageBadgeColor(stage: string): 'blue' | 'orange' | 'green' | 'red' | 'purple' {
  switch (stage) {
    case 'experimental':
      return 'purple';
    case 'privatePreview':
      return 'orange';
    case 'preview':
      return 'blue';
    case 'GA':
      return 'green';
    case 'deprecated':
      return 'red';
    default:
      return 'blue';
  }
}

function getStageLabel(stage: string): string {
  switch (stage) {
    case 'experimental':
      return 'Experimental';
    case 'privatePreview':
      return 'Private Preview';
    case 'preview':
      return 'Preview';
    case 'GA':
      return 'GA';
    case 'deprecated':
      return 'Deprecated';
    case 'unknown':
      return 'Unknown';
    default:
      return stage;
  }
}

const FeatureTogglesTableComponent = ({ featureToggles, showEmpty }: Props) => {
  const styles = useStyles2(getStyles);

  if (showEmpty) {
    return (
      <EmptyState variant="not-found" message="No feature toggles found">
        <Trans i18nKey="admin.feature-toggles.empty-state">
          No feature toggles match your search criteria. Try adjusting your filters.
        </Trans>
      </EmptyState>
    );
  }

  return (
    <ScrollContainer overflowY="visible" overflowX="auto" width="100%">
      <table className="filter-table">
        <thead>
          <tr>
            <th>
              <Trans i18nKey="admin.feature-toggles.column-status">Status</Trans>
            </th>
            <th>
              <Trans i18nKey="admin.feature-toggles.column-name">Name</Trans>
            </th>
            <th>
              <Trans i18nKey="admin.feature-toggles.column-description">Description</Trans>
            </th>
            <th>
              <Trans i18nKey="admin.feature-toggles.column-stage">Stage</Trans>
            </th>
            <th>
              <Trans i18nKey="admin.feature-toggles.column-info">Info</Trans>
            </th>
          </tr>
        </thead>
        <tbody>
          {featureToggles.map((toggle) => (
            <tr key={toggle.name}>
              <td className={styles.statusCell}>
                {toggle.enabled ? (
                  <Icon name="check-circle" className={styles.enabledIcon} />
                ) : (
                  <Icon name="circle" className={styles.disabledIcon} />
                )}
              </td>
              <td>
                <Text weight="medium">{toggle.name}</Text>
              </td>
              <td className={styles.descriptionCell}>
                <Text color="secondary">{toggle.description || '-'}</Text>
              </td>
              <td>
                <Badge text={getStageLabel(toggle.stage)} color={getStageBadgeColor(toggle.stage)} />
              </td>
              <td className={styles.infoCell}>
                <div className={styles.infoIcons}>
                  {toggle.requiresDevMode && (
                    <Tooltip
                      content={t('admin.feature-toggles.tooltip-requires-dev-mode', 'Requires dev mode')}
                      placement="top"
                    >
                      <Icon name="code-branch" className={styles.infoIcon} />
                    </Tooltip>
                  )}
                  {toggle.frontendOnly && (
                    <Tooltip
                      content={t('admin.feature-toggles.tooltip-frontend-only', 'Frontend only')}
                      placement="top"
                    >
                      <Icon name="browser-alt" className={styles.infoIcon} />
                    </Tooltip>
                  )}
                  {toggle.requiresRestart && (
                    <Tooltip
                      content={t('admin.feature-toggles.tooltip-requires-restart', 'Requires restart')}
                      placement="top"
                    >
                      <Icon name="sync" className={styles.infoIcon} />
                    </Tooltip>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollContainer>
  );
};

const randomValues = new Array(20).fill(null).map(() => Math.random());

const FeatureTogglesTableSkeleton: SkeletonComponent = ({ rootProps }) => {
  return (
    <ScrollContainer overflowY="visible" overflowX="auto" width="100%">
      <table className="filter-table" {...rootProps}>
        <thead>
          <tr>
            <th>
              <Trans i18nKey="admin.feature-toggles.column-status">Status</Trans>
            </th>
            <th>
              <Trans i18nKey="admin.feature-toggles.column-name">Name</Trans>
            </th>
            <th>
              <Trans i18nKey="admin.feature-toggles.column-description">Description</Trans>
            </th>
            <th>
              <Trans i18nKey="admin.feature-toggles.column-stage">Stage</Trans>
            </th>
            <th>
              <Trans i18nKey="admin.feature-toggles.column-info">Info</Trans>
            </th>
          </tr>
        </thead>
        <tbody>
          {randomValues.map((randomValue, index) => (
            <Fragment key={index}>
              <tr>
                <td style={{ width: '60px' }}>
                  <Skeleton width={20} circle height={20} />
                </td>
                <td>
                  <Skeleton width={getRandomInRange(100, 200, randomValue)} />
                </td>
                <td>
                  <Skeleton width={getRandomInRange(200, 400, randomValue)} />
                </td>
                <td style={{ width: '120px' }}>
                  <Skeleton width={80} />
                </td>
                <td style={{ width: '80px' }}>
                  <Skeleton width={40} />
                </td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </ScrollContainer>
  );
};

function getRandomInRange(min: number, max: number, randomSeed: number) {
  return randomSeed * (max - min) + min;
}

const getStyles = (theme: GrafanaTheme2) => ({
  statusCell: css({
    width: '60px',
  }),
  enabledIcon: css({
    color: theme.colors.success.main,
  }),
  disabledIcon: css({
    color: theme.colors.text.disabled,
  }),
  descriptionCell: css({
    maxWidth: '400px',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  }),
  infoCell: css({
    width: '80px',
  }),
  infoIcons: css({
    display: 'flex',
    gap: theme.spacing(1),
  }),
  infoIcon: css({
    color: theme.colors.text.secondary,
  }),
});

export const FeatureTogglesTable = attachSkeleton(FeatureTogglesTableComponent, FeatureTogglesTableSkeleton);
