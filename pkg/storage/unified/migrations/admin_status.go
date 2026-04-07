package migrations

import (
	"context"
	"fmt"
	"time"

	"github.com/grafana/grafana/pkg/infra/db"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/storage/unified/migrations/contract"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

// MigrationAdminStatusService implements contract.MigrationAdminStatusProvider.
type MigrationAdminStatusService struct {
	cfg      *setting.Cfg
	sqlStore db.DB
	registry *MigrationRegistry
	reader   contract.MigrationStatusReader
}

var _ contract.MigrationAdminStatusProvider = (*MigrationAdminStatusService)(nil)

// ProvideMigrationAdminStatusService wires read-only migration status for admin APIs.
func ProvideMigrationAdminStatusService(
	cfg *setting.Cfg,
	sqlStore db.DB,
	registry *MigrationRegistry,
	reader contract.MigrationStatusReader,
) contract.MigrationAdminStatusProvider {
	return &MigrationAdminStatusService{
		cfg:      cfg,
		sqlStore: sqlStore,
		registry: registry,
		reader:   reader,
	}
}

// GetMigrationAdminStatus returns config, per-resource resolved modes, and migration log metadata.
func (s *MigrationAdminStatusService) GetMigrationAdminStatus(ctx context.Context) (*contract.MigrationAdminStatus, error) {
	seen := make(map[schema.GroupResource]struct{})
	var groupResources []schema.GroupResource
	for _, def := range s.registry.All() {
		for _, ri := range def.Resources {
			if _, ok := seen[ri.GroupResource]; ok {
				continue
			}
			seen[ri.GroupResource] = struct{}{}
			groupResources = append(groupResources, ri.GroupResource)
		}
	}

	resources := make([]contract.ResourceMigrationStatus, 0, len(groupResources))
	for _, gr := range groupResources {
		configKey := gr.Resource + "." + gr.Group
		enableMigration, dualMode := getMigrationResourceConfig(s.cfg, configKey)
		mode, err := s.reader.GetStorageMode(ctx, gr)
		if err != nil {
			return nil, fmt.Errorf("storage mode for %s: %w", configKey, err)
		}
		resources = append(resources, contract.ResourceMigrationStatus{
			Group:               gr.Group,
			Resource:            gr.Resource,
			ConfigKey:           configKey,
			EnableMigration:     enableMigration,
			DualWriterMode:      dualMode,
			ResolvedStorageMode: mode.String(),
		})
	}

	migrations := make([]contract.MigrationDefinitionStatus, 0, len(s.registry.All()))
	for _, def := range s.registry.All() {
		st, err := s.fetchLatestMigrationLog(ctx, def.MigrationID)
		if err != nil {
			return nil, fmt.Errorf("migration log for %s: %w", def.MigrationID, err)
		}
		migrations = append(migrations, contract.MigrationDefinitionStatus{
			ID:           def.ID,
			MigrationID:  def.MigrationID,
			LogRecorded:  st.recorded,
			LogSuccess:   st.success,
			LogTimestamp: st.timestampRFC3339,
		})
	}

	return &contract.MigrationAdminStatus{
		DisableDataMigrations: s.cfg.DisableDataMigrations,
		StorageType:           s.cfg.UnifiedStorageType(),
		Migrations:            migrations,
		Resources:             resources,
	}, nil
}

type latestLogStatus struct {
	recorded         bool
	success          *bool
	timestampRFC3339 *string
}

func (s *MigrationAdminStatusService) fetchLatestMigrationLog(ctx context.Context, migrationID string) (latestLogStatus, error) {
	var out latestLogStatus
	err := s.sqlStore.WithDbSession(ctx, func(sess *db.Session) error {
		type row struct {
			Success   bool      `xorm:"success"`
			Timestamp time.Time `xorm:"timestamp"`
		}
		var r row
		has, err := sess.Table(migrationLogTableName).Where("migration_id = ?", migrationID).Desc("id").Limit(1).Get(&r)
		if err != nil {
			return err
		}
		if !has {
			return nil
		}
		out.recorded = true
		ok := r.Success
		out.success = &ok
		ts := r.Timestamp.UTC().Format(time.RFC3339)
		out.timestampRFC3339 = &ts
		return nil
	})
	if err != nil {
		return out, err
	}
	return out, nil
}

func getMigrationResourceConfig(cfg *setting.Cfg, configKey string) (enableMigration bool, dualWriterMode int) {
	defaultEnable := setting.MigratedUnifiedResources[configKey]
	if cfg == nil || cfg.UnifiedStorage == nil {
		return defaultEnable, 0
	}
	c, ok := cfg.UnifiedStorage[configKey]
	if !ok {
		return defaultEnable, 0
	}
	return c.EnableMigration, int(c.DualWriterMode)
}
