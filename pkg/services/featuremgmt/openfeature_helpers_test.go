package featuremgmt

import (
	"context"
	"testing"

	"github.com/open-feature/go-sdk/openfeature"
	"github.com/open-feature/go-sdk/openfeature/memprovider"
	oftesting "github.com/open-feature/go-sdk/openfeature/testing"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/setting"
)

func TestEvaluateAllFlags(t *testing.T) {
	flags := []FeatureFlag{
		{Name: "enabledFlag", Expression: "true", Stage: FeatureStageExperimental},
		{Name: "disabledFlag", Expression: "false", Stage: FeatureStageExperimental},
		{Name: "devOnlyFlag", Expression: "true", Stage: FeatureStageExperimental, RequiresDevMode: true},
	}

	t.Run("evaluates boolean flags via OpenFeature", func(t *testing.T) {
		provider := oftesting.NewTestProvider()
		require.NoError(t, openfeature.SetProvider(provider))
		t.Cleanup(func() {
			openfeature.Shutdown()
		})

		provider.UsingFlags(t, map[string]memprovider.InMemoryFlag{
			"enabledFlag":  memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": true}},
			"disabledFlag": memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": false}},
			"devOnlyFlag":  memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": true}},
		})

		states := EvaluateAllFlags(context.Background(), flags, true)
		stateMap := make(map[string]FeatureFlagState, len(states))
		for _, state := range states {
			stateMap[state.Name] = state
		}

		assert.True(t, stateMap["enabledFlag"].Enabled)
		assert.Equal(t, "boolean", stateMap["enabledFlag"].ValueType)
		assert.False(t, stateMap["disabledFlag"].Enabled)
	})

	t.Run("respects dev mode requirement", func(t *testing.T) {
		provider := oftesting.NewTestProvider()
		require.NoError(t, openfeature.SetProvider(provider))
		t.Cleanup(func() {
			openfeature.Shutdown()
		})

		provider.UsingFlags(t, map[string]memprovider.InMemoryFlag{
			"enabledFlag":  memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": true}},
			"disabledFlag": memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": false}},
			"devOnlyFlag":  memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": true}},
		})

		states := EvaluateAllFlags(context.Background(), flags, false)
		stateMap := make(map[string]FeatureFlagState, len(states))
		for _, state := range states {
			stateMap[state.Name] = state
		}

		assert.False(t, stateMap["devOnlyFlag"].Enabled)
	})

	t.Run("returns enabled map for boot settings", func(t *testing.T) {
		provider := oftesting.NewTestProvider()
		require.NoError(t, openfeature.SetProvider(provider))
		t.Cleanup(func() {
			openfeature.Shutdown()
		})

		provider.UsingFlags(t, map[string]memprovider.InMemoryFlag{
			"enabledFlag":  memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": true}},
			"disabledFlag": memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": false}},
			"devOnlyFlag":  memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": true}},
		})

		enabled := GetEnabledViaOpenFeature(context.Background(), flags, true)
		assert.True(t, enabled["enabledFlag"])
		assert.False(t, enabled["disabledFlag"])
	})
}

func TestIsBooleanEnabled(t *testing.T) {
	provider := oftesting.NewTestProvider()
	require.NoError(t, openfeature.SetProvider(provider))
	t.Cleanup(func() {
		openfeature.Shutdown()
	})

	provider.UsingFlags(t, map[string]memprovider.InMemoryFlag{
		"myFlag": memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": true}},
	})

	assert.True(t, IsBooleanEnabled(context.Background(), "myFlag", false))
	assert.False(t, IsBooleanEnabled(context.Background(), "missingFlag", false))
}

func TestInitOpenFeatureForAdminFlags(t *testing.T) {
	t.Cleanup(func() {
		openfeature.Shutdown()
	})

	err := InitOpenFeature(OpenFeatureConfig{
		ProviderType: setting.StaticProviderType,
		StaticFlags: map[string]memprovider.InMemoryFlag{
			"enabledFeature":  memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": true}},
			"disabledFeature": memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": false}},
		},
	})
	require.NoError(t, err)

	flags := []FeatureFlag{
		{Name: "enabledFeature", Expression: "true"},
		{Name: "disabledFeature", Expression: "false"},
	}

	enabled := GetEnabledViaOpenFeature(context.Background(), flags, true)
	assert.True(t, enabled["enabledFeature"])
	assert.False(t, enabled["disabledFeature"])
}
