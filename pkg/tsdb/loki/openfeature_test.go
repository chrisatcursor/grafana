package loki

import (
	"context"
	"testing"

	"github.com/open-feature/go-sdk/openfeature"
	"github.com/open-feature/go-sdk/openfeature/memprovider"
	"github.com/stretchr/testify/require"
)

func initTestOpenFeatureProvider(t *testing.T, flags ...string) context.Context {
	t.Helper()
	m := make(map[string]memprovider.InMemoryFlag, len(flags))
	for _, f := range flags {
		m[f] = memprovider.InMemoryFlag{
			State:          memprovider.Enabled,
			DefaultVariant: "on",
			Variants: map[string]any{
				"on":  true,
				"off": false,
			},
		}
	}
	require.NoError(t, openfeature.SetProviderAndWait(memprovider.NewInMemoryProvider(m)))
	t.Cleanup(func() {
		_ = openfeature.SetProviderAndWait(openfeature.NoopProvider{})
	})
	return context.Background()
}
