/**
 * Grafana core OpenFeature UI layer — hooks and composition helpers for flags backed by
 * `initOpenFeature()` / OFREP. Lazy-loaded panels and code paths outside React should continue to use
 * `getFeatureFlagClient()` from `@grafana/runtime/internal`.
 *
 * Existing patterns this builds on:
 * - Boot snapshot: `config.featureToggles` (legacy, broad usage).
 * - `@grafana/ui` `getFeatureToggle()` reads boot without React hooks.
 * - `@openfeature/react-sdk` hooks — wrapped here for consistent imports during migration.
 */

export type { GrafanaFeatureFlagKey } from './types';
export { useGrafanaBooleanFlag } from './hooks/useGrafanaBooleanFlag';
export { OpenFeatureGate, type OpenFeatureGateProps } from './components/OpenFeatureGate';
