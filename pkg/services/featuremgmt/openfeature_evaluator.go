package featuremgmt

import (
	"context"

	"github.com/open-feature/go-sdk/openfeature"
)

// OpenFeatureIsEnabled evaluates a boolean feature flag with the global OpenFeature
// client. When OpenFeature has not been initialized (the global provider is the
// no-op provider), it falls back to the legacy FeatureToggles implementation so
// existing tests that only set up a FeatureManager continue to work.
//
// This helper is the recommended replacement for FeatureToggles.IsEnabled in
// request-scoped call sites. The provided ctx flows through OpenFeature's
// transaction context, so any per-request evaluation context (set in middleware)
// is honored.
func OpenFeatureIsEnabled(ctx context.Context, fallback FeatureToggles, flag string) bool {
	if shouldFallbackToLegacy(fallback) {
		return fallback.IsEnabled(ctx, flag) //nolint:staticcheck
	}

	client := openfeature.NewDefaultClient()
	return client.Boolean(ctx, flag, false, openfeature.TransactionContext(ctx))
}

// OpenFeatureIsEnabledGlobally evaluates a boolean feature flag without a request
// context. It is the OpenFeature replacement for FeatureToggles.IsEnabledGlobally
// and behaves like that method by ignoring per-request context.
//
// It falls back to the legacy FeatureToggles implementation when OpenFeature has
// not been initialized.
func OpenFeatureIsEnabledGlobally(fallback FeatureToggles, flag string) bool {
	if shouldFallbackToLegacy(fallback) {
		return fallback.IsEnabledGlobally(flag) //nolint:staticcheck
	}

	client := openfeature.NewDefaultClient()
	return client.Boolean(context.Background(), flag, false, openfeature.EvaluationContext{})
}

// OpenFeatureAnyEnabledGlobally returns true if at least one of the supplied
// flags evaluates to true. It is the OpenFeature replacement for AnyEnabled.
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
		if client.Boolean(ctx, flag, false, evalCtx) {
			return true
		}
	}
	return false
}

// shouldFallbackToLegacy reports whether the caller should defer to the legacy
// FeatureToggles implementation. We fall back when no OpenFeature provider has
// been registered (the SDK exposes a NoopProvider in that case), which is the
// typical situation in unit tests that only construct a FeatureManager via
// WithFeatures(...).
func shouldFallbackToLegacy(fallback FeatureToggles) bool {
	if fallback == nil {
		return false
	}
	return openfeature.ProviderMetadata().Name == "NoopProvider"
}
