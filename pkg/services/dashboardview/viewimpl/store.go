package viewimpl

import (
	"context"
	"time"

	"github.com/grafana/grafana/pkg/services/dashboardview"
)

type store interface {
	Upsert(ctx context.Context, cmd *dashboardview.RecordDashboardViewCommand) error
	GetForDashboard(ctx context.Context, query *dashboardview.GetLastViewedForDashboardQuery) (*time.Time, error)
	GetForDashboards(ctx context.Context, query *dashboardview.GetLastViewedQuery) (map[string]time.Time, error)
}
