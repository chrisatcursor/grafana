import { useBooleanFlagValue } from '@openfeature/react-sdk';

/**
 * Boolean evaluation against the Grafana core OpenFeature client (domain `internal-grafana-core`).
 * Prefer this over importing `@openfeature/react-sdk` directly in feature code so hooks stay discoverable
 * and we can extend behavior (logging, metrics) in one place during the migration from `config.featureToggles`.
 *
 * @see OpenFeatureProvider in AppWrapper — hooks only work under this tree after initOpenFeature().
 */
export function useGrafanaBooleanFlag(flagKey: string, defaultValue = false): boolean {
  return useBooleanFlagValue(flagKey, defaultValue);
}
