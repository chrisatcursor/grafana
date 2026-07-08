import type { ReactFlagEvaluationOptions } from '@openfeature/react-sdk';
import { useNumberFlagValue } from '@openfeature/react-sdk';

/**
 * Numeric flag evaluation for Grafana core OpenFeature (domain `internal-grafana-core`).
 */
export function useGrafanaNumberFlag<T extends number = number>(
  flagKey: string,
  defaultValue: T,
  options?: ReactFlagEvaluationOptions
): number {
  return useNumberFlagValue(flagKey, defaultValue, options);
}
