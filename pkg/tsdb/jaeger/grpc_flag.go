package jaeger

import (
	"context"

	"github.com/open-feature/go-sdk/openfeature"

	"github.com/grafana/grafana/pkg/services/featuremgmt"
)

func jaegerGrpcEndpointEnabled(ctx context.Context) bool {
	return openfeature.NewDefaultClient().Boolean(ctx, featuremgmt.FlagJaegerEnableGrpcEndpoint, false, openfeature.TransactionContext(ctx))
}
