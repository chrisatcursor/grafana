package azuremonitor

import (
	"testing"

	"github.com/open-feature/go-sdk/openfeature"
	"github.com/open-feature/go-sdk/openfeature/memprovider"
	"github.com/stretchr/testify/require"
)

func initTestOpenFeatureProvider(t *testing.T, enabledFlags ...string) {
	t.Helper()
	if len(enabledFlags) == 0 {
		require.NoError(t, openfeature.SetProviderAndWait(openfeature.NoopProvider{}))
		t.Cleanup(func() {
			_ = openfeature.SetProviderAndWait(openfeature.NoopProvider{})
		})
		return
	}
	m := make(map[string]memprovider.InMemoryFlag, len(enabledFlags))
	for _, f := range enabledFlags {
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
}
