package loganalytics

import (
	"context"

	"github.com/open-feature/go-sdk/openfeature"

	"github.com/grafana/grafana/pkg/services/featuremgmt"
)

func azureMonitorPrometheusExemplarsEnabled(ctx context.Context) bool {
	return openfeature.NewDefaultClient().Boolean(ctx, featuremgmt.FlagAzureMonitorPrometheusExemplars, false, openfeature.TransactionContext(ctx))
}

func azureMonitorDisableLogLimitEnabled(ctx context.Context) bool {
	return openfeature.NewDefaultClient().Boolean(ctx, featuremgmt.FlagAzureMonitorDisableLogLimit, false, openfeature.TransactionContext(ctx))
}
