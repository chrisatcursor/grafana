package dashboardview

import (
	"errors"
	"time"
)

var ErrCommandValidationFailed = errors.New("command missing required fields")

type UserDashboardView struct {
	ID           int64     `xorm:"pk autoincr 'id'" db:"id"`
	UserID       int64     `xorm:"user_id" db:"user_id"`
	DashboardID  int64     `xorm:"dashboard_id" db:"dashboard_id"`
	Viewed       time.Time `xorm:"viewed" db:"viewed"`
	OrgID        int64     `xorm:"org_id" db:"org_id"`
	DashboardUID string    `xorm:"dashboard_uid" db:"dashboard_uid"`
}

func (UserDashboardView) TableName() string {
	return "user_dashboard_views"
}

type RecordDashboardViewCommand struct {
	UserID       int64
	OrgID        int64
	DashboardID  int64
	DashboardUID string
	Viewed       time.Time
}

func (cmd *RecordDashboardViewCommand) Validate() error {
	if cmd.UserID == 0 || cmd.OrgID == 0 || cmd.DashboardUID == "" {
		return ErrCommandValidationFailed
	}
	return nil
}

type GetLastViewedQuery struct {
	UserID        int64
	OrgID         int64
	DashboardUIDs []string
}

type GetLastViewedForDashboardQuery struct {
	UserID       int64
	OrgID        int64
	DashboardUID string
}
