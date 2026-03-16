import { config } from '@grafana/runtime';

import { getPreviewToggle } from './previewToggles';
import { isAdmin } from './utils/misc';

export const shouldUsePrometheusRulesPrimary = () => config.isFeatureEnabled('alertingPrometheusRulesPrimary') ?? false;

export const shouldUseAlertingListViewV2 = () => {
  const previewToggleValue = getPreviewToggle('alertingListViewV2');

  // If the preview toggle is enabled and has configured value it should take precedence over the feature toggle
  if (config.isFeatureEnabled('alertingListViewV2PreviewToggle') && previewToggleValue !== undefined) {
    return previewToggleValue;
  }

  return config.isFeatureEnabled('alertingListViewV2');
};

export const shouldAllowRecoveringDeletedRules = () =>
  (isAdmin() && config.isFeatureEnabled('alertingRuleRecoverDeleted') && config.isFeatureEnabled('alertRuleRestore')) ??
  false;

export const shouldAllowPermanentlyDeletingRules = () =>
  (shouldAllowRecoveringDeletedRules() && config.isFeatureEnabled('alertingRulePermanentlyDelete')) ?? false;

export const shouldUseBackendFilters = () => config.isFeatureEnabled('alertingUIUseBackendFilters') ?? false;

export const shouldUseFullyCompatibleBackendFilters = () =>
  config.isFeatureEnabled('alertingUIUseFullyCompatBackendFilters') ?? false;

/**
 * Saved searches feature - allows users to save and apply search queries on the Alert Rules page.
 */
export const shouldUseSavedSearches = () => config.isFeatureEnabled('alertingSavedSearches') ?? false;

/**
 * Saved searches feature for Alert Activity (Triage) page.
 */
export const shouldUseTriageSavedSearches = () => config.isFeatureEnabled('alertingTriageSavedSearches') ?? false;

/**
 * Alerts Activity Banner - shows a promotional banner on the Rule List page
 * directing users to try the new Alerts Activity (triage) view.
 *
 * The banner is only shown if:
 * 1. This feature toggle is enabled (alertingAlertsActivityBanner)
 * 2. The Alerts Activity feature itself is enabled (alertingTriage)
 */
export const shouldShowAlertsActivityBanner = () =>
  (config.isFeatureEnabled('alertingAlertsActivityBanner') && config.isFeatureEnabled('alertingTriage')) ?? false;
