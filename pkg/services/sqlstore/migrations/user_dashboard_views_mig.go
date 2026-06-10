package migrations

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
	"github.com/grafana/grafana/pkg/util/xorm"
)

func addUserDashboardViewsMigrations(mg *Migrator) {
	viewsV1 := Table{
		Name: "user_dashboard_views",
		Columns: []*Column{
			{Name: "id", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			{Name: "user_id", Type: DB_BigInt, Nullable: false},
			{Name: "dashboard_id", Type: DB_BigInt, Nullable: false},
			{Name: "viewed", Type: DB_DateTime, Nullable: false},
		},
		Indices: []*Index{
			{Cols: []string{"user_id", "dashboard_id"}, Type: UniqueIndex},
			{Cols: []string{"user_id"}, Type: IndexType},
			{Cols: []string{"dashboard_id"}, Type: IndexType},
		},
	}

	mg.AddMigration("create user_dashboard_views table", NewAddTableMigration(viewsV1))
	mg.AddMigration("add index user_dashboard_views.user_id", NewAddIndexMigration(viewsV1, viewsV1.Indices[1]))
	mg.AddMigration("add index user_dashboard_views.dashboard_id", NewAddIndexMigration(viewsV1, viewsV1.Indices[2]))
	mg.AddMigration("add unique index user_dashboard_views_user_id_dashboard_id", NewAddIndexMigration(viewsV1, viewsV1.Indices[0]))
	mg.AddMigration("add org_id column to user_dashboard_views", NewAddColumnMigration(viewsV1, &Column{
		Name: "org_id", Type: DB_BigInt, Nullable: true,
	}))
	mg.AddMigration("add dashboard_uid column to user_dashboard_views", NewAddColumnMigration(viewsV1, &Column{
		Name: "dashboard_uid", Type: DB_NVarchar, Length: 40, Nullable: true,
	}))
	mg.AddMigration("add unique index user_dashboard_views_org_id_dashboard_uid", NewAddIndexMigration(viewsV1, &Index{
		Cols: []string{"org_id", "dashboard_uid"}, Type: IndexType,
	}))
	mg.AddMigration("add unique index user_dashboard_views_org_id_user_id_dashboard_uid", NewAddIndexMigration(viewsV1, &Index{
		Cols: []string{"user_id", "org_id", "dashboard_uid"}, Type: UniqueIndex,
	}))
	mg.AddMigration("populate user_dashboard_views.dashboard_uid and user_dashboard_views.org_id from dashboard table", &FillUserDashboardViewsUIDMigration{})
	mg.AddMigration("delete views where dashboard does not exist", NewRawSQLMigration(
		"DELETE FROM user_dashboard_views WHERE (dashboard_uid IS NULL OR org_id IS NULL) AND NOT EXISTS (SELECT 1 FROM dashboard WHERE dashboard.id = user_dashboard_views.dashboard_id)"))
}

type FillUserDashboardViewsUIDMigration struct {
	MigrationBase
}

func (m *FillUserDashboardViewsUIDMigration) SQL(dialect Dialect) string {
	return "code migration"
}

func (m *FillUserDashboardViewsUIDMigration) Exec(sess *xorm.Session, mg *Migrator) error {
	sql := `UPDATE user_dashboard_views
	SET
		dashboard_uid = (SELECT uid FROM dashboard WHERE dashboard.id = user_dashboard_views.dashboard_id),
		org_id = (SELECT org_id FROM dashboard WHERE dashboard.id = user_dashboard_views.dashboard_id)
	WHERE
		(dashboard_uid IS NULL OR org_id IS NULL)
		AND EXISTS (SELECT 1 FROM dashboard WHERE dashboard.id = user_dashboard_views.dashboard_id);`
	switch mg.Dialect.DriverName() {
	case Postgres:
		sql = `UPDATE user_dashboard_views
		SET dashboard_uid = dashboard.uid,
			org_id = dashboard.org_id
		FROM dashboard
		WHERE user_dashboard_views.dashboard_id = dashboard.id
			AND (user_dashboard_views.dashboard_uid IS NULL OR user_dashboard_views.org_id IS NULL);`
	case MySQL:
		sql = `UPDATE user_dashboard_views
		LEFT JOIN dashboard ON user_dashboard_views.dashboard_id = dashboard.id
		SET user_dashboard_views.dashboard_uid = dashboard.uid,
			user_dashboard_views.org_id = dashboard.org_id
		WHERE user_dashboard_views.dashboard_uid IS NULL OR user_dashboard_views.org_id IS NULL;`
	}
	_, err := sess.Exec(sql)
	return err
}
