package azuremonitor

import (
	"context"

	"github.com/open-feature/go-sdk/openfeature"

	"github.com/grafana/grafana/pkg/services/featuremgmt"
)

func azureMonitorUserAuthEnabled(ctx context.Context) bool {
	return openfeature.NewDefaultClient().Boolean(ctx, featuremgmt.FlagAzureMonitorEnableUserAuth, false, openfeature.TransactionContext(ctx))
}
