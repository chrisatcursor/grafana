import type { FeatureToggles } from '@grafana/data';

/**
 * Keys of the generated TypeScript feature toggle map. Prefer this for compile-time safety on
 * flags that exist in {@link FeatureToggles}. Dynamic / runtime-only flag keys should stay `string`.
 */
export type GrafanaFeatureFlagKey = keyof FeatureToggles;
