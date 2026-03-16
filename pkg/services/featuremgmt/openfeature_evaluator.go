package featuremgmt

import (
	"context"

	"github.com/open-feature/go-sdk/openfeature"
)

func OpenFeatureIsEnabled(ctx context.Context, fallback FeatureToggles, flag string) bool {
	if shouldFallbackToLegacy(fallback) {
		return fallback.IsEnabled(ctx, flag) //nolint:staticcheck
	}

	client := openfeature.NewDefaultClient()
	enabled, _ := client.BooleanValue(ctx, flag, false, openfeature.TransactionContext(ctx))
	return enabled
}

func OpenFeatureIsEnabledGlobally(fallback FeatureToggles, flag string) bool {
	if shouldFallbackToLegacy(fallback) {
		return fallback.IsEnabledGlobally(flag) //nolint:staticcheck
	}

	client := openfeature.NewDefaultClient()
	enabled, _ := client.BooleanValue(context.Background(), flag, false, openfeature.EvaluationContext{})
	return enabled
}

func OpenFeatureAnyEnabledGlobally(fallback FeatureToggles, flags ...string) bool {
	if shouldFallbackToLegacy(fallback) {
		for _, flag := range flags {
			if fallback.IsEnabledGlobally(flag) { //nolint:staticcheck
				return true
			}
		}
		return false
	}

	client := openfeature.NewDefaultClient()
	ctx := context.Background()
	evalCtx := openfeature.EvaluationContext{}

	for _, flag := range flags {
		enabled, _ := client.BooleanValue(ctx, flag, false, evalCtx)
		if enabled {
			return true
		}
	}

	return false
}

func shouldFallbackToLegacy(fallback FeatureToggles) bool {
	if fallback == nil {
		return false
	}

	return openfeature.ProviderMetadata().Name == "NoopProvider"
}
