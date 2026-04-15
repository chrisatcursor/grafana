package notifier

import (
	"context"

	alertingNotify "github.com/grafana/alerting/notify"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
)

// GetDispatchTimer returns the appropriate dispatch timer based on feature toggles.
// Note: This function now uses OpenFeature SDK for flag evaluation.
func GetDispatchTimer(ctx context.Context) (dt alertingNotify.DispatchTimer) {
	if featuremgmt.BoolValue(ctx, featuremgmt.FlagAlertingSyncDispatchTimer, false) {
		dt = alertingNotify.DispatchTimerSync
	}
	return
}

// GetDispatchTimerLegacy is deprecated - use GetDispatchTimer with context instead.
// Deprecated: This function uses the deprecated FeatureToggles interface.
func GetDispatchTimerLegacy(features featuremgmt.FeatureToggles) (dt alertingNotify.DispatchTimer) {
	//nolint:staticcheck // keeping for backward compatibility during migration
	enabled := features.IsEnabledGlobally(featuremgmt.FlagAlertingSyncDispatchTimer)
	if enabled {
		dt = alertingNotify.DispatchTimerSync
	}
	return
}
