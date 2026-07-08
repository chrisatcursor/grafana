import type { FlagValue } from '@openfeature/web-sdk';
import type { ReactFlagEvaluationOptions } from '@openfeature/react-sdk';
import { useFlag } from '@openfeature/react-sdk';

/**
 * Generic flag query (value, details, error state) for Grafana core OpenFeature.
 * Prefer {@link useGrafanaBooleanFlag} / {@link useGrafanaStringFlag} when the type is known.
 */
export function useGrafanaFlag<T extends FlagValue = FlagValue>(
  flagKey: string,
  defaultValue: T,
  options?: ReactFlagEvaluationOptions
) {
  return useFlag(flagKey, defaultValue, options);
}
