import { getFeatureFlagClient } from '@grafana/runtime/internal';

import { resolveGrafanaBooleanFlagDefault } from './resolveGrafanaBooleanFlagDefault';
import type { GrafanaFeatureFlagKey } from './types';

/**
 * Imperative boolean flag evaluation for non-React code (RTK queryFn, services, etc.).
 * Uses the Grafana core OpenFeature client; falls back to boot config when evaluation fails.
 */
export function getGrafanaBooleanFlag(flagKey: GrafanaFeatureFlagKey | string, defaultValue?: boolean): boolean {
  const resolvedDefault = resolveGrafanaBooleanFlagDefault(flagKey, defaultValue);
  return getFeatureFlagClient().getBooleanValue(flagKey, resolvedDefault);
}
