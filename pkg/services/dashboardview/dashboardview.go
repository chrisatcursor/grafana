package dashboardview

import (
	"context"
	"time"
)

type Service interface {
	RecordView(ctx context.Context, cmd *RecordDashboardViewCommand) error
	GetLastViewedForDashboard(ctx context.Context, query *GetLastViewedForDashboardQuery) (*time.Time, error)
	GetLastViewedForDashboards(ctx context.Context, query *GetLastViewedQuery) (map[string]time.Time, error)
}
