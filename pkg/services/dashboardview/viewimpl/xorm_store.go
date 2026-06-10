package viewimpl

import (
	"context"
	"time"

	"github.com/grafana/grafana/pkg/infra/db"
	"github.com/grafana/grafana/pkg/services/dashboardview"
)

type sqlStore struct {
	db db.DB
}

func (s *sqlStore) Upsert(ctx context.Context, cmd *dashboardview.RecordDashboardViewCommand) error {
	return s.db.WithTransactionalDbSession(ctx, func(sess *db.Session) error {
		existing := dashboardview.UserDashboardView{}
		has, err := sess.Where("user_id=? AND org_id=? AND dashboard_uid=?", cmd.UserID, cmd.OrgID, cmd.DashboardUID).Get(&existing)
		if err != nil {
			return err
		}

		if has {
			existing.Viewed = cmd.Viewed
			_, err = sess.ID(existing.ID).Cols("viewed").Update(&existing)
			return err
		}

		dashboardID := cmd.DashboardID
		if dashboardID == 0 {
			dashboardID = time.Now().UnixMicro()
		}

		entity := dashboardview.UserDashboardView{
			UserID:       cmd.UserID,
			DashboardID:  dashboardID,
			Viewed:       cmd.Viewed,
			OrgID:        cmd.OrgID,
			DashboardUID: cmd.DashboardUID,
		}
		_, err = sess.Insert(&entity)
		return err
	})
}

func (s *sqlStore) GetForDashboard(ctx context.Context, query *dashboardview.GetLastViewedForDashboardQuery) (*time.Time, error) {
	var viewed time.Time
	err := s.db.WithDbSession(ctx, func(sess *db.Session) error {
		existing := dashboardview.UserDashboardView{}
		has, err := sess.Where("user_id=? AND org_id=? AND dashboard_uid=?", query.UserID, query.OrgID, query.DashboardUID).Get(&existing)
		if err != nil {
			return err
		}
		if !has {
			return nil
		}
		viewed = existing.Viewed
		return nil
	})
	if err != nil {
		return nil, err
	}
	if viewed.IsZero() {
		return nil, nil
	}
	return &viewed, nil
}

func (s *sqlStore) GetForDashboards(ctx context.Context, query *dashboardview.GetLastViewedQuery) (map[string]time.Time, error) {
	result := make(map[string]time.Time)
	if len(query.DashboardUIDs) == 0 {
		return result, nil
	}

	err := s.db.WithDbSession(ctx, func(sess *db.Session) error {
		var views []dashboardview.UserDashboardView
		err := sess.Where("user_id=? AND org_id=?", query.UserID, query.OrgID).
			In("dashboard_uid", query.DashboardUIDs).
			Find(&views)
		if err != nil {
			return err
		}
		for _, view := range views {
			result[view.DashboardUID] = view.Viewed
		}
		return nil
	})
	return result, err
}
