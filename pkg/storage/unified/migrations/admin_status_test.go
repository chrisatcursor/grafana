package migrations

import (
	"context"
	"errors"
	"testing"

	"github.com/grafana/grafana/pkg/infra/db/dbtest"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/storage/unified/migrations/contract"
	"github.com/stretchr/testify/require"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

type staticReader struct {
	mode contract.StorageMode
	err  error
}

func (s staticReader) GetStorageMode(ctx context.Context, gr schema.GroupResource) (contract.StorageMode, error) {
	return s.mode, s.err
}

func TestGetMigrationResourceConfig(t *testing.T) {
	t.Run("defaults from MigratedUnifiedResources when missing from UnifiedStorage", func(t *testing.T) {
		cfg := setting.NewCfg()
		cfg.UnifiedStorage = nil
		en, dw := getMigrationResourceConfig(cfg, setting.FolderResource)
		require.True(t, en)
		require.Equal(t, 0, dw)
	})

	t.Run("uses explicit config when present", func(t *testing.T) {
		cfg := setting.NewCfg()
		cfg.UnifiedStorage = map[string]setting.UnifiedStorageConfig{
			setting.DashboardResource: {EnableMigration: false, DualWriterMode: 4},
		}
		en, dw := getMigrationResourceConfig(cfg, setting.DashboardResource)
		require.False(t, en)
		require.Equal(t, 4, dw)
	})
}

func TestMigrationAdminStatusService_ReaderError(t *testing.T) {
	reg := NewMigrationRegistry()
	gr := schema.GroupResource{Group: "playlist.grafana.app", Resource: "playlists"}
	reg.Register(MigrationDefinition{
		ID:          "p",
		MigrationID: "playlists migration",
		Resources:   []ResourceInfo{{GroupResource: gr}},
	})

	svc := &MigrationAdminStatusService{
		cfg:      setting.NewCfg(),
		sqlStore: dbtest.NewFakeDB(),
		registry: reg,
		reader:   staticReader{err: errors.New("mode failed")},
	}

	_, err := svc.GetMigrationAdminStatus(context.Background())
	require.Error(t, err)
	require.Contains(t, err.Error(), "mode failed")
}

func TestMigrationAdminStatusService_MigrationLogError(t *testing.T) {
	reg := NewMigrationRegistry()
	gr := schema.GroupResource{Group: "playlist.grafana.app", Resource: "playlists"}
	reg.Register(MigrationDefinition{
		ID:          "p",
		MigrationID: "playlists migration",
		Resources:   []ResourceInfo{{GroupResource: gr}},
	})

	fakeDB := dbtest.NewFakeDB()
	fakeDB.ExpectedError = errors.New("db unavailable")

	svc := &MigrationAdminStatusService{
		cfg:      setting.NewCfg(),
		sqlStore: fakeDB,
		registry: reg,
		reader:   staticReader{mode: contract.StorageModeUnified},
	}

	_, err := svc.GetMigrationAdminStatus(context.Background())
	require.Error(t, err)
	require.Contains(t, err.Error(), "db unavailable")
}

func TestMigrationAdminStatusService_OK(t *testing.T) {
	reg := NewMigrationRegistry()
	gr := schema.GroupResource{Group: "playlist.grafana.app", Resource: "playlists"}
	reg.Register(MigrationDefinition{
		ID:          "p",
		MigrationID: "playlists migration",
		Resources:   []ResourceInfo{{GroupResource: gr}},
	})

	svc := &MigrationAdminStatusService{
		cfg:      setting.NewCfg(),
		sqlStore: dbtest.NewFakeDB(),
		registry: reg,
		reader:   staticReader{mode: contract.StorageModeLegacy},
	}

	out, err := svc.GetMigrationAdminStatus(context.Background())
	require.NoError(t, err)
	require.False(t, out.DisableDataMigrations)
	require.Len(t, out.Migrations, 1)
	require.False(t, out.Migrations[0].LogRecorded)
	require.Len(t, out.Resources, 1)
	require.Equal(t, "legacy", out.Resources[0].ResolvedStorageMode)
}
