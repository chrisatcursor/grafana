import { OpenFeature } from '@openfeature/web-sdk';

import { FeatureToggles } from '@grafana/data';

type FeatureToggleName = keyof FeatureToggles;

const GRAFANA_CORE_OPEN_FEATURE_DOMAIN = 'internal-grafana-core';

/**
 * Check a featureToggle
 * @param featureName featureToggle name
 * @param def default value if featureToggles aren't defined, false if not provided
 * @returns featureToggle value or def.
 */
export function getFeatureToggle(featureName: FeatureToggleName, def = false) {
  const fallback = window.grafanaBootData?.settings.featureToggles[featureName] ?? def;
  return OpenFeature.getClient(GRAFANA_CORE_OPEN_FEATURE_DOMAIN).getBooleanValue(featureName, fallback);
}
