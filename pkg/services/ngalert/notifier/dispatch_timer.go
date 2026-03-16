package notifier

import (
	"context"

	alertingNotify "github.com/grafana/alerting/notify"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
	"github.com/open-feature/go-sdk/openfeature"
)

// GetDispatchTimer returns the appropriate dispatch timer based on feature toggles.
func GetDispatchTimer(features featuremgmt.FeatureToggles) (dt alertingNotify.DispatchTimer) {
	enabled := openfeature.NewDefaultClient().Boolean(context.Background(), featuremgmt.FlagAlertingSyncDispatchTimer, false, openfeature.EvaluationContext{})
	if enabled {
		dt = alertingNotify.DispatchTimerSync
	}
	return
}
