package migrations

import (
	"context"
	"fmt"
	"sort"
	"time"

	"github.com/grafana/grafana/pkg/infra/db"
	"github.com/grafana/grafana/pkg/setting"
)

// MigrationStatus represents the current state of a single resource migration.
type MigrationStatus struct {
	MigrationID string    `json:"migrationId"`
	Success     bool      `json:"success"`
	Error       string    `json:"error,omitempty"`
	Timestamp   time.Time `json:"timestamp"`
}

// ResourceMigrationStatus combines config and runtime state for a resource.
type ResourceMigrationStatus struct {
	Resource           string           `json:"resource"`
	Enabled            bool             `json:"enabled"`
	AutoMigrate        bool             `json:"autoMigrate"`
	AutoMigrateThreshold int            `json:"autoMigrateThreshold,omitempty"`
	DualWriterMode     int              `json:"dualWriterMode"`
	LastMigration      *MigrationStatus `json:"lastMigration,omitempty"`
}

// StatusSummary provides an overview of all resource migrations.
type StatusSummary struct {
	DataMigrationsDisabled bool                      `json:"dataMigrationsDisabled"`
	Resources              []ResourceMigrationStatus `json:"resources"`
	TotalCompleted         int                       `json:"totalCompleted"`
	TotalFailed            int                       `json:"totalFailed"`
	TotalPending           int                       `json:"totalPending"`
}

// MigrationStatusReporter queries configuration and the migration log to
// produce a point-in-time view of unified storage migration state.
type MigrationStatusReporter struct {
	cfg      *setting.Cfg
	sqlStore db.DB
	registry *MigrationRegistry
}

// NewMigrationStatusReporter creates a reporter from the running Grafana config, database, and registry.
func NewMigrationStatusReporter(cfg *setting.Cfg, sqlStore db.DB, registry *MigrationRegistry) *MigrationStatusReporter {
	return &MigrationStatusReporter{
		cfg:      cfg,
		sqlStore: sqlStore,
		registry: registry,
	}
}

// migrationLogRow mirrors the schema of the unifiedstorage_migration_log table.
type migrationLogRow struct {
	ID          int64     `xorm:"id"`
	MigrationID string    `xorm:"migration_id"`
	SQL         string    `xorm:"sql"`
	Success     bool      `xorm:"success"`
	Error       string    `xorm:"error"`
	Timestamp   time.Time `xorm:"timestamp"`
}

// GetStatus builds a StatusSummary describing every registered resource migration.
func (r *MigrationStatusReporter) GetStatus(ctx context.Context) (*StatusSummary, error) {
	if r.cfg == nil || r.registry == nil {
		return nil, fmt.Errorf("reporter not fully initialized: cfg and registry are required")
	}

	logEntries, err := r.fetchMigrationLog(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to read migration log: %w", err)
	}

	latestByID := buildLatestLogMap(logEntries)

	summary := &StatusSummary{
		DataMigrationsDisabled: r.cfg.DisableDataMigrations,
	}

	definitions := r.registry.All()
	for _, def := range definitions {
		for _, configRes := range def.ConfigResources() {
			resCfg := r.cfg.UnifiedStorageConfig(configRes)
			isAutoMigrate := setting.AutoMigratedUnifiedResources[configRes]

			status := ResourceMigrationStatus{
				Resource:       configRes,
				Enabled:        resCfg.EnableMigration,
				AutoMigrate:    isAutoMigrate,
				DualWriterMode: int(resCfg.DualWriterMode),
			}

			if isAutoMigrate {
				threshold := setting.DefaultAutoMigrationThreshold
				if resCfg.AutoMigrationThreshold > 0 {
					threshold = resCfg.AutoMigrationThreshold
				}
				status.AutoMigrateThreshold = threshold
			}

			if entry, ok := latestByID[def.MigrationID]; ok {
				status.LastMigration = &MigrationStatus{
					MigrationID: entry.MigrationID,
					Success:     entry.Success,
					Error:       entry.Error,
					Timestamp:   entry.Timestamp,
				}
				if entry.Success {
					summary.TotalCompleted++
				} else {
					summary.TotalFailed++
				}
			} else {
				summary.TotalPending++
			}

			summary.Resources = append(summary.Resources, status)
		}
	}

	sort.Slice(summary.Resources, func(i, j int) bool {
		return summary.Resources[i].Resource < summary.Resources[j].Resource
	})

	return summary, nil
}

// fetchMigrationLog reads all rows from the unifiedstorage_migration_log table.
func (r *MigrationStatusReporter) fetchMigrationLog(ctx context.Context) ([]migrationLogRow, error) {
	var rows []migrationLogRow
	err := r.sqlStore.WithDbSession(ctx, func(sess *db.Session) error {
		exists, err := sess.IsTableExist(migrationLogTableName)
		if err != nil {
			return fmt.Errorf("checking table existence: %w", err)
		}
		if !exists {
			return nil
		}
		return sess.Table(migrationLogTableName).Find(&rows)
	})
	return rows, err
}

// buildLatestLogMap returns the most recent log entry per migration ID.
// When multiple entries exist for the same migration, the latest successful
// one wins; if none are successful, the latest failure is returned.
func buildLatestLogMap(entries []migrationLogRow) map[string]migrationLogRow {
	latest := make(map[string]migrationLogRow, len(entries))
	for _, entry := range entries {
		existing, ok := latest[entry.MigrationID]
		if !ok {
			latest[entry.MigrationID] = entry
			continue
		}
		// Prefer successful entries; break ties by timestamp.
		if entry.Success && !existing.Success {
			latest[entry.MigrationID] = entry
		} else if entry.Success == existing.Success && entry.Timestamp.After(existing.Timestamp) {
			latest[entry.MigrationID] = entry
		}
	}
	return latest
}
