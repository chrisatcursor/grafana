package cloudwatch

import (
	"context"

	"github.com/open-feature/go-sdk/openfeature"
)

func featureEnabled(ctx context.Context, flag string) bool {
	return openfeature.NewDefaultClient().Boolean(ctx, flag, false, openfeature.TransactionContext(ctx))
}
