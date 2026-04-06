package notifier

import (
	"testing"

	alertingNotify "github.com/grafana/alerting/notify"
	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/services/featuremgmt"
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
			features := featuremgmt.WithFeatures(featuremgmt.FlagAlertingSyncDispatchTimer, tt.featureFlagValue)
			setNotifierFeatureFlags(t, features)
			result := GetDispatchTimer(features)
			require.Equal(t, tt.expected, result)
		})
	}
}
