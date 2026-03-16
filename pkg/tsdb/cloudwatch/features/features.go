package features

import (
	"context"

	"github.com/open-feature/go-sdk/openfeature"
)

const (
	FlagCloudWatchCrossAccountQuerying = "cloudWatchCrossAccountQuerying"
	FlagCloudWatchBatchQueries         = "cloudWatchBatchQueries"
	FlagCloudWatchNewLabelParsing      = "cloudWatchNewLabelParsing"
	FlagCloudWatchRoundUpEndTime       = "cloudWatchRoundUpEndTime"
)

func IsEnabled(ctx context.Context, feature string) bool {
	client := openfeature.NewDefaultClient()
	enabled, _ := client.BooleanValue(ctx, feature, false, openfeature.TransactionContext(ctx))
	return enabled
}
