package notifier

import (
	"context"
	"testing"

	alertingNotify "github.com/grafana/alerting/notify"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
	"github.com/open-feature/go-sdk/openfeature"
	"github.com/open-feature/go-sdk/openfeature/memprovider"
	"github.com/stretchr/testify/require"
)

func TestGetDispatchTimer(t *testing.T) {
	tests := []struct {
		name             string
		featureFlagValue bool
		expected         alertingNotify.DispatchTimer
	}{
		{
			name:             "feature flag enabled returns sync timer",
			featureFlagValue: true,
			expected:         alertingNotify.DispatchTimerSync,
		},
		{
			name:             "feature flag disabled returns default timer",
			featureFlagValue: false,
			expected:         alertingNotify.DispatchTimerDefault,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			flags := map[string]memprovider.InMemoryFlag{
				featuremgmt.FlagAlertingSyncDispatchTimer: {
					Key:            featuremgmt.FlagAlertingSyncDispatchTimer,
					DefaultVariant: "test",
					Variants: map[string]any{
						"test": tt.featureFlagValue,
					},
				},
			}

			provider := memprovider.NewInMemoryProvider(flags)
			err := openfeature.SetProviderAndWait(provider)
			require.NoError(t, err)

			result := GetDispatchTimer(context.Background())
			require.Equal(t, tt.expected, result)
		})
	}
}

func TestGetDispatchTimerLegacy(t *testing.T) {
	tests := []struct {
		name             string
		featureFlagValue bool
		expected         alertingNotify.DispatchTimer
	}{
		{
			name:             "feature flag enabled returns sync timer",
			featureFlagValue: true,
			expected:         alertingNotify.DispatchTimerSync,
		},
		{
			name:             "feature flag disabled returns default timer",
			featureFlagValue: false,
			expected:         alertingNotify.DispatchTimerDefault,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			features := featuremgmt.WithFeatures(featuremgmt.FlagAlertingSyncDispatchTimer, tt.featureFlagValue)
			result := GetDispatchTimerLegacy(features)
			require.Equal(t, tt.expected, result)
		})
	}
}
