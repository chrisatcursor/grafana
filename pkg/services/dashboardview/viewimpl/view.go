package viewimpl

import (
	"context"
	"time"

	"github.com/grafana/grafana/pkg/infra/db"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/dashboardview"
)

type Service struct {
	store  store
	logger log.Logger
}

func ProvideService(sql db.DB) dashboardview.Service {
	return &Service{
		store: &sqlStore{
			db: sql,
		},
		logger: log.New("dashboardview"),
	}
}

func (s *Service) RecordView(ctx context.Context, cmd *dashboardview.RecordDashboardViewCommand) error {
	if err := cmd.Validate(); err != nil {
		return err
	}
	return s.store.Upsert(ctx, cmd)
}

func (s *Service) GetLastViewedForDashboard(ctx context.Context, query *dashboardview.GetLastViewedForDashboardQuery) (*time.Time, error) {
	return s.store.GetForDashboard(ctx, query)
}

func (s *Service) GetLastViewedForDashboards(ctx context.Context, query *dashboardview.GetLastViewedQuery) (map[string]time.Time, error) {
	return s.store.GetForDashboards(ctx, query)
}
