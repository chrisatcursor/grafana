package featuremgmt

import (
	"context"
	"testing"

	"github.com/open-feature/go-sdk/openfeature"
	"github.com/open-feature/go-sdk/openfeature/memprovider"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestBoolValue(t *testing.T) {
	flags := map[string]memprovider.InMemoryFlag{
		"testFlagEnabled": {
			Key:            "testFlagEnabled",
			DefaultVariant: "on",
			Variants: map[string]any{
				"on":  true,
				"off": false,
			},
		},
		"testFlagDisabled": {
			Key:            "testFlagDisabled",
			DefaultVariant: "off",
			Variants: map[string]any{
				"on":  true,
				"off": false,
			},
		},
	}

	provider := memprovider.NewInMemoryProvider(flags)
	err := openfeature.SetProviderAndWait(provider)
	require.NoError(t, err)

	ctx := context.Background()

	t.Run("returns true when flag is enabled", func(t *testing.T) {
		result := BoolValue(ctx, "testFlagEnabled", false)
		assert.True(t, result)
	})

	t.Run("returns false when flag is disabled", func(t *testing.T) {
		result := BoolValue(ctx, "testFlagDisabled", true)
		assert.False(t, result)
	})

	t.Run("returns default when flag does not exist", func(t *testing.T) {
		result := BoolValue(ctx, "nonExistentFlag", true)
		assert.True(t, result)

		result = BoolValue(ctx, "nonExistentFlag", false)
		assert.False(t, result)
	})
}

func TestStringValue(t *testing.T) {
	flags := map[string]memprovider.InMemoryFlag{
		"stringFlag": {
			Key:            "stringFlag",
			DefaultVariant: "default",
			Variants: map[string]any{
				"default": "hello-world",
			},
		},
	}

	provider := memprovider.NewInMemoryProvider(flags)
	err := openfeature.SetProviderAndWait(provider)
	require.NoError(t, err)

	ctx := context.Background()

	t.Run("returns string value", func(t *testing.T) {
		result := StringValue(ctx, "stringFlag", "fallback")
		assert.Equal(t, "hello-world", result)
	})

	t.Run("returns default when flag does not exist", func(t *testing.T) {
		result := StringValue(ctx, "nonExistentFlag", "fallback")
		assert.Equal(t, "fallback", result)
	})
}

func TestFloatValue(t *testing.T) {
	flags := map[string]memprovider.InMemoryFlag{
		"floatFlag": {
			Key:            "floatFlag",
			DefaultVariant: "default",
			Variants: map[string]any{
				"default": 3.14,
			},
		},
	}

	provider := memprovider.NewInMemoryProvider(flags)
	err := openfeature.SetProviderAndWait(provider)
	require.NoError(t, err)

	ctx := context.Background()

	t.Run("returns float value", func(t *testing.T) {
		result := FloatValue(ctx, "floatFlag", 0.0)
		assert.Equal(t, 3.14, result)
	})

	t.Run("returns default when flag does not exist", func(t *testing.T) {
		result := FloatValue(ctx, "nonExistentFlag", 1.5)
		assert.Equal(t, 1.5, result)
	})
}

func TestIntValue(t *testing.T) {
	ctx := context.Background()

	t.Run("returns default when flag does not exist", func(t *testing.T) {
		result := IntValue(ctx, "nonExistentFlag", int64(99))
		assert.Equal(t, int64(99), result)
	})
}

func TestAnyEnabledOF(t *testing.T) {
	flags := map[string]memprovider.InMemoryFlag{
		"flagA": {
			Key:            "flagA",
			DefaultVariant: "on",
			Variants: map[string]any{
				"on":  true,
				"off": false,
			},
		},
		"flagB": {
			Key:            "flagB",
			DefaultVariant: "off",
			Variants: map[string]any{
				"on":  true,
				"off": false,
			},
		},
		"flagC": {
			Key:            "flagC",
			DefaultVariant: "off",
			Variants: map[string]any{
				"on":  true,
				"off": false,
			},
		},
	}

	provider := memprovider.NewInMemoryProvider(flags)
	err := openfeature.SetProviderAndWait(provider)
	require.NoError(t, err)

	ctx := context.Background()

	t.Run("returns true when at least one flag is enabled", func(t *testing.T) {
		result := AnyEnabledOF(ctx, "flagA", "flagB", "flagC")
		assert.True(t, result)
	})

	t.Run("returns false when no flags are enabled", func(t *testing.T) {
		result := AnyEnabledOF(ctx, "flagB", "flagC")
		assert.False(t, result)
	})

	t.Run("returns false for empty flags list", func(t *testing.T) {
		result := AnyEnabledOF(ctx)
		assert.False(t, result)
	})
}

func TestAllEnabledOF(t *testing.T) {
	flags := map[string]memprovider.InMemoryFlag{
		"flagA": {
			Key:            "flagA",
			DefaultVariant: "on",
			Variants: map[string]any{
				"on":  true,
				"off": false,
			},
		},
		"flagB": {
			Key:            "flagB",
			DefaultVariant: "on",
			Variants: map[string]any{
				"on":  true,
				"off": false,
			},
		},
		"flagC": {
			Key:            "flagC",
			DefaultVariant: "off",
			Variants: map[string]any{
				"on":  true,
				"off": false,
			},
		},
	}

	provider := memprovider.NewInMemoryProvider(flags)
	err := openfeature.SetProviderAndWait(provider)
	require.NoError(t, err)

	ctx := context.Background()

	t.Run("returns true when all flags are enabled", func(t *testing.T) {
		result := AllEnabledOF(ctx, "flagA", "flagB")
		assert.True(t, result)
	})

	t.Run("returns false when not all flags are enabled", func(t *testing.T) {
		result := AllEnabledOF(ctx, "flagA", "flagB", "flagC")
		assert.False(t, result)
	})

	t.Run("returns true for empty flags list", func(t *testing.T) {
		result := AllEnabledOF(ctx)
		assert.True(t, result)
	})
}

func TestNewClient(t *testing.T) {
	client := NewClient()
	assert.NotNil(t, client)
}

func TestBoolValueWithClient(t *testing.T) {
	flags := map[string]memprovider.InMemoryFlag{
		"testFlag": {
			Key:            "testFlag",
			DefaultVariant: "on",
			Variants: map[string]any{
				"on":  true,
				"off": false,
			},
		},
	}

	provider := memprovider.NewInMemoryProvider(flags)
	err := openfeature.SetProviderAndWait(provider)
	require.NoError(t, err)

	ctx := context.Background()
	client := NewClient()

	result := BoolValueWithClient(ctx, client, "testFlag", false)
	assert.True(t, result)
}
