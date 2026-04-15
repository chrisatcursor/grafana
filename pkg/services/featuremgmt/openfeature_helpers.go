package featuremgmt

import (
	"context"

	"github.com/open-feature/go-sdk/openfeature"
)

// OpenFeature helper functions to simplify migration from the deprecated FeatureToggles interface.
// These functions provide a cleaner API for common feature flag operations.

// BoolValue evaluates a boolean feature flag using the OpenFeature SDK.
// This is the recommended replacement for FeatureToggles.IsEnabled().
//
// Example usage:
//
//	if featuremgmt.BoolValue(ctx, featuremgmt.FlagMyFeature, false) {
//	    // feature is enabled
//	}
func BoolValue(ctx context.Context, flag string, defaultValue bool) bool {
	return openfeature.NewDefaultClient().Boolean(ctx, flag, defaultValue, openfeature.TransactionContext(ctx))
}

// BoolValueWithClient evaluates a boolean feature flag using a provided OpenFeature client.
// Use this when you need to reuse a client instance across multiple evaluations.
func BoolValueWithClient(ctx context.Context, client openfeature.IClient, flag string, defaultValue bool) bool {
	return client.Boolean(ctx, flag, defaultValue, openfeature.TransactionContext(ctx))
}

// StringValue evaluates a string feature flag using the OpenFeature SDK.
func StringValue(ctx context.Context, flag string, defaultValue string) string {
	return openfeature.NewDefaultClient().String(ctx, flag, defaultValue, openfeature.TransactionContext(ctx))
}

// StringValueWithClient evaluates a string feature flag using a provided OpenFeature client.
func StringValueWithClient(ctx context.Context, client openfeature.IClient, flag string, defaultValue string) string {
	return client.String(ctx, flag, defaultValue, openfeature.TransactionContext(ctx))
}

// IntValue evaluates an integer feature flag using the OpenFeature SDK.
func IntValue(ctx context.Context, flag string, defaultValue int64) int64 {
	return openfeature.NewDefaultClient().Int(ctx, flag, defaultValue, openfeature.TransactionContext(ctx))
}

// IntValueWithClient evaluates an integer feature flag using a provided OpenFeature client.
func IntValueWithClient(ctx context.Context, client openfeature.IClient, flag string, defaultValue int64) int64 {
	return client.Int(ctx, flag, defaultValue, openfeature.TransactionContext(ctx))
}

// FloatValue evaluates a float feature flag using the OpenFeature SDK.
func FloatValue(ctx context.Context, flag string, defaultValue float64) float64 {
	return openfeature.NewDefaultClient().Float(ctx, flag, defaultValue, openfeature.TransactionContext(ctx))
}

// FloatValueWithClient evaluates a float feature flag using a provided OpenFeature client.
func FloatValueWithClient(ctx context.Context, client openfeature.IClient, flag string, defaultValue float64) float64 {
	return client.Float(ctx, flag, defaultValue, openfeature.TransactionContext(ctx))
}

// ObjectValue evaluates an object/structured feature flag using the OpenFeature SDK.
func ObjectValue(ctx context.Context, flag string, defaultValue any) any {
	return openfeature.NewDefaultClient().Object(ctx, flag, defaultValue, openfeature.TransactionContext(ctx))
}

// ObjectValueWithClient evaluates an object feature flag using a provided OpenFeature client.
func ObjectValueWithClient(ctx context.Context, client openfeature.IClient, flag string, defaultValue any) any {
	return client.Object(ctx, flag, defaultValue, openfeature.TransactionContext(ctx))
}

// NewClient creates a new OpenFeature client. This is a convenience wrapper
// that can be used when you need to perform multiple flag evaluations.
//
// Example usage:
//
//	client := featuremgmt.NewClient()
//	if client.Boolean(ctx, featuremgmt.FlagFeatureA, false, openfeature.TransactionContext(ctx)) {
//	    // ...
//	}
//	if client.Boolean(ctx, featuremgmt.FlagFeatureB, false, openfeature.TransactionContext(ctx)) {
//	    // ...
//	}
func NewClient() openfeature.IClient {
	return openfeature.NewDefaultClient()
}

// AnyEnabledOF checks if any of the provided flags are enabled using OpenFeature.
// This is the OpenFeature replacement for the AnyEnabled helper function.
func AnyEnabledOF(ctx context.Context, flags ...string) bool {
	client := openfeature.NewDefaultClient()
	evalCtx := openfeature.TransactionContext(ctx)
	for _, flag := range flags {
		if client.Boolean(ctx, flag, false, evalCtx) {
			return true
		}
	}
	return false
}

// AllEnabledOF checks if all of the provided flags are enabled using OpenFeature.
func AllEnabledOF(ctx context.Context, flags ...string) bool {
	client := openfeature.NewDefaultClient()
	evalCtx := openfeature.TransactionContext(ctx)
	for _, flag := range flags {
		if !client.Boolean(ctx, flag, false, evalCtx) {
			return false
		}
	}
	return true
}
