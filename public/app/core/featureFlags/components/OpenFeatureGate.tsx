import { type ReactNode } from 'react';

import { useGrafanaBooleanFlag } from '../hooks/useGrafanaBooleanFlag';

export interface OpenFeatureGateProps {
  /** OpenFeature flag key (typically matches a generated FeatureToggles property name). */
  flag: string;
  /** Default when the provider is not ready or the flag is unknown — mirrors other Grafana defaults (often false). */
  defaultValue?: boolean;
  children: ReactNode;
  /** Rendered when the flag evaluates false (optional). */
  fallback?: ReactNode;
}

/**
 * Conditional render helper for boolean flags evaluated via OpenFeature.
 *
 * Replaces patterns like `config.featureToggles.someFlag && <Foo />` when migrating to the SDK.
 * No Visual styling — composition only; wrap existing `@grafana/ui` primitives as children.
 */
export function OpenFeatureGate({
  flag,
  defaultValue = false,
  children,
  fallback = null,
}: OpenFeatureGateProps): ReactNode {
  const enabled = useGrafanaBooleanFlag(flag, defaultValue);

  if (!enabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
