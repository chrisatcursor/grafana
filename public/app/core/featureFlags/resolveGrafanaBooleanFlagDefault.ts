import type { FeatureToggles } from '@grafana/data';
import { config } from '@grafana/runtime';

import type { GrafanaFeatureFlagKey } from './types';

/**
 * Default used when OpenFeature cannot evaluate a flag.
 * During migration, prefer the boot snapshot (`config.featureToggles`) so UI/API stay consistent
 * if the OFREP provider is slow or fails to initialize.
 */
export function resolveGrafanaBooleanFlagDefault(
  flagKey: GrafanaFeatureFlagKey | string,
  explicitDefault?: boolean
): boolean {
  const bootValue = config.featureToggles[flagKey as keyof FeatureToggles];
  if (bootValue !== undefined) {
    return bootValue;
  }
  return explicitDefault ?? false;
}
