package notifier

import (
	"context"

	alertingNotify "github.com/grafana/alerting/notify"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
	"github.com/open-feature/go-sdk/openfeature"
)

// GetDispatchTimer returns the appropriate dispatch timer based on feature toggles.
func GetDispatchTimer(features featuremgmt.FeatureToggles) (dt alertingNotify.DispatchTimer) {
	defaultValue := false
	if features != nil {
		defaultValue = features.IsEnabled(context.Background(), featuremgmt.FlagAlertingSyncDispatchTimer)
	}
	enabled := openfeature.NewDefaultClient().Boolean(context.Background(), featuremgmt.FlagAlertingSyncDispatchTimer, defaultValue, openfeature.EvaluationContext{})
	if enabled {
		dt = alertingNotify.DispatchTimerSync
	}
	return
}
