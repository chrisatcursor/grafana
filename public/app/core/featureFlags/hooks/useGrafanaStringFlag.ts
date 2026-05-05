import type { ReactFlagEvaluationOptions } from '@openfeature/react-sdk';
import { useStringFlagValue } from '@openfeature/react-sdk';

/**
 * String flag evaluation for Grafana core OpenFeature (domain `internal-grafana-core`).
 */
export function useGrafanaStringFlag<T extends string = string>(
  flagKey: string,
  defaultValue: T,
  options?: ReactFlagEvaluationOptions
): string {
  return useStringFlagValue(flagKey, defaultValue, options);
}
