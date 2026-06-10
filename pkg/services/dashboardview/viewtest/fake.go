package viewtest

import (
	"context"
	"time"

	"github.com/grafana/grafana/pkg/services/dashboardview"
)

type FakeDashboardViewService struct {
	Views map[string]time.Time
}

func NewFakeDashboardViewService() *FakeDashboardViewService {
	return &FakeDashboardViewService{
		Views: make(map[string]time.Time),
	}
}

func (f *FakeDashboardViewService) RecordView(_ context.Context, cmd *dashboardview.RecordDashboardViewCommand) error {
	f.Views[cmd.DashboardUID] = cmd.Viewed
	return nil
}

func (f *FakeDashboardViewService) GetLastViewedForDashboard(_ context.Context, query *dashboardview.GetLastViewedForDashboardQuery) (*time.Time, error) {
	if viewed, ok := f.Views[query.DashboardUID]; ok {
		return &viewed, nil
	}
	return nil, nil
}

func (f *FakeDashboardViewService) GetLastViewedForDashboards(_ context.Context, query *dashboardview.GetLastViewedQuery) (map[string]time.Time, error) {
	result := make(map[string]time.Time)
	for _, uid := range query.DashboardUIDs {
		if viewed, ok := f.Views[uid]; ok {
			result[uid] = viewed
		}
	}
	return result, nil
}
