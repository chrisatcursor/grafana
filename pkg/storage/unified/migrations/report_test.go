package migrations

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"
	"k8s.io/apimachinery/pkg/runtime/schema"

	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/storage/unified/migrations/contract"
)

type mapStatusReader struct {
	modes map[string]contract.MigrationStorageDetails
}

func (m *mapStatusReader) GetStorageMode(ctx context.Context, gr schema.GroupResource) (contract.StorageMode, error) {
	d, err := m.GetMigrationStorageDetails(ctx, gr)
	if err != nil {
		return contract.StorageModeLegacy, err
	}
	return d.Mode, nil
}

func (m *mapStatusReader) GetMigrationStorageDetails(_ context.Context, gr schema.GroupResource) (contract.MigrationStorageDetails, error) {
	key := gr.String()
	if d, ok := m.modes[key]; ok {
		return d, nil
	}
	return contract.MigrationStorageDetails{Mode: contract.StorageModeLegacy}, nil
}

func TestBuildMigrationStatusReport(t *testing.T) {
	reg := NewMigrationRegistry()
	reg.Register(MigrationDefinition{
		ID:          "test-migration",
		MigrationID: "test migration id",
		Resources: []ResourceInfo{
			{GroupResource: schema.GroupResource{Group: "playlist.grafana.app", Resource: "playlists"}},
		},
		Migrators: map[schema.GroupResource]MigratorFunc{},
	})

	reader := &mapStatusReader{
		modes: map[string]contract.MigrationStorageDetails{
			"playlists.playlist.grafana.app": {Mode: contract.StorageModeUnified},
		},
	}
	cfg := &setting.Cfg{UnifiedStorage: map[string]setting.UnifiedStorageConfig{}}

	report := BuildMigrationStatusReport(context.Background(), cfg, reader, reg)
	require.False(t, report.Degraded)
	require.Len(t, report.Resources, 1)
	require.Equal(t, "unified", report.Resources[0].StorageMode)
	require.Equal(t, "playlists.playlist.grafana.app", report.Resources[0].ConfigKey)
	require.Equal(t, "test-migration", report.Resources[0].MigrationDefinitionID)
}
