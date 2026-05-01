package featuremgmt

import (
	"context"
	"sync"
	"testing"

	"github.com/open-feature/go-sdk/openfeature"
	"github.com/open-feature/go-sdk/openfeature/memprovider"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// openFeatureMu serializes tests in this file because OpenFeature relies on a
// process-global provider. Other featuremgmt tests also touch this state, but
// they run within the same package serially in practice; using a local mutex
// keeps these tests independent of suite ordering.
var openFeatureMu sync.Mutex

func resetOpenFeatureProvider(t *testing.T) {
	t.Helper()
	require.NoError(t, openfeature.SetProviderAndWait(openfeature.NoopProvider{}))
}

func TestOpenFeatureIsEnabled_FallsBackWhenProviderIsNoop(t *testing.T) {
	openFeatureMu.Lock()
	defer openFeatureMu.Unlock()

	resetOpenFeatureProvider(t)

	ft := WithFeatures("foo")
	assert.True(t, OpenFeatureIsEnabled(context.Background(), ft, "foo"))
	assert.False(t, OpenFeatureIsEnabled(context.Background(), ft, "bar"))
}

func TestOpenFeatureIsEnabledGlobally_FallsBackWhenProviderIsNoop(t *testing.T) {
	openFeatureMu.Lock()
	defer openFeatureMu.Unlock()

	resetOpenFeatureProvider(t)

	ft := WithFeatures("foo")
	assert.True(t, OpenFeatureIsEnabledGlobally(ft, "foo"))
	assert.False(t, OpenFeatureIsEnabledGlobally(ft, "bar"))
}

func TestOpenFeatureAnyEnabledGlobally_FallsBackWhenProviderIsNoop(t *testing.T) {
	openFeatureMu.Lock()
	defer openFeatureMu.Unlock()

	resetOpenFeatureProvider(t)

	ft := WithFeatures("foo")
	assert.True(t, OpenFeatureAnyEnabledGlobally(ft, "missing", "foo"))
	assert.False(t, OpenFeatureAnyEnabledGlobally(ft, "missing", "other"))
}

func TestOpenFeatureIsEnabled_UsesProviderWhenInitialized(t *testing.T) {
	openFeatureMu.Lock()
	defer openFeatureMu.Unlock()

	flagOn := "openfeatureFlagOn"
	flagOff := "openfeatureFlagOff"

	provider := newInMemoryBulkProvider(map[string]memprovider.InMemoryFlag{
		flagOn: {
			Key:            flagOn,
			DefaultVariant: "true",
			Variants:       map[string]any{"true": true, "false": false},
			State:          memprovider.Enabled,
		},
		flagOff: {
			Key:            flagOff,
			DefaultVariant: "false",
			Variants:       map[string]any{"true": true, "false": false},
			State:          memprovider.Enabled,
		},
	})
	require.NoError(t, openfeature.SetProviderAndWait(provider))
	t.Cleanup(func() { resetOpenFeatureProvider(t) })

	// Legacy fallback intentionally returns the opposite values to prove the
	// provider is consulted when initialized.
	legacy := WithFeatures(flagOff, true, flagOn, false)

	assert.True(t, OpenFeatureIsEnabled(context.Background(), legacy, flagOn))
	assert.False(t, OpenFeatureIsEnabled(context.Background(), legacy, flagOff))

	assert.True(t, OpenFeatureIsEnabledGlobally(legacy, flagOn))
	assert.False(t, OpenFeatureIsEnabledGlobally(legacy, flagOff))

	assert.True(t, OpenFeatureAnyEnabledGlobally(legacy, "missing", flagOn))
	assert.False(t, OpenFeatureAnyEnabledGlobally(legacy, "missing", flagOff))
}

func TestOpenFeatureIsEnabled_NilFallback(t *testing.T) {
	openFeatureMu.Lock()
	defer openFeatureMu.Unlock()

	resetOpenFeatureProvider(t)

	// With no provider initialized and no fallback, helpers should return the
	// default (false) without panicking.
	assert.False(t, OpenFeatureIsEnabled(context.Background(), nil, "anything"))
	assert.False(t, OpenFeatureIsEnabledGlobally(nil, "anything"))
	assert.False(t, OpenFeatureAnyEnabledGlobally(nil, "anything", "another"))
}
