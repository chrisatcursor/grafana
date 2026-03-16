package notifier

import (
	alertingNotify "github.com/grafana/alerting/notify"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
)

// GetDispatchTimer returns the appropriate dispatch timer based on feature toggles.
func GetDispatchTimer(features featuremgmt.FeatureToggles) (dt alertingNotify.DispatchTimer) {
	enabled := featuremgmt.OpenFeatureIsEnabledGlobally(features, featuremgmt.FlagAlertingSyncDispatchTimer)
	if enabled {
		dt = alertingNotify.DispatchTimerSync
	}
	return
}
