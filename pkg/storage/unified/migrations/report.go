package migrations

import (
	"context"

	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/storage/unified/migrations/contract"
)

// ResourceMigrationStatus is a single row for admin migration reporting.
type ResourceMigrationStatus struct {
	Group                   string `json:"group"`
	Resource                string `json:"resource"`
	ConfigKey               string `json:"configKey"`
	MigrationDefinitionID   string `json:"migrationDefinitionId"`
	MigrationID             string `json:"migrationId"`
	StorageMode             string `json:"storageMode"`
	MigrationLogError       string `json:"migrationLogError,omitempty"`
	DualWriterMode          int    `json:"dualWriterMode"`
	EnableMigration         bool   `json:"enableMigration"`
}

// MigrationStatusReport is returned by the admin unified storage migration API.
type MigrationStatusReport struct {
	DisableDataMigrations bool                      `json:"disableDataMigrations"`
	Degraded              bool                      `json:"degraded"`
	Resources             []ResourceMigrationStatus `json:"resources"`
}

// BuildMigrationStatusReport enumerates registered migration resources and resolves storage mode.
func BuildMigrationStatusReport(
	ctx context.Context,
	cfg *setting.Cfg,
	reader contract.MigrationStatusReader,
	registry *MigrationRegistry,
) MigrationStatusReport {
	report := MigrationStatusReport{
		DisableDataMigrations: cfg.DisableDataMigrations,
		Resources:             make([]ResourceMigrationStatus, 0),
	}
	seen := make(map[string]struct{})
	for _, def := range registry.All() {
		for _, ri := range def.Resources {
			gr := ri.GroupResource
			key := gr.String()
			if _, ok := seen[key]; ok {
				continue
			}
			seen[key] = struct{}{}

			configKey := gr.Resource + "." + gr.Group
			row := ResourceMigrationStatus{
				Group:                 gr.Group,
				Resource:              gr.Resource,
				ConfigKey:             configKey,
				MigrationDefinitionID: def.ID,
				MigrationID:           def.MigrationID,
			}
			if uc, ok := cfg.UnifiedStorage[configKey]; ok {
				row.DualWriterMode = int(uc.DualWriterMode)
				row.EnableMigration = uc.EnableMigration
			}

			details, err := reader.GetMigrationStorageDetails(ctx, gr)
			if err != nil {
				row.StorageMode = contract.StorageModeLegacy.String()
				row.MigrationLogError = err.Error()
				report.Degraded = true
			} else {
				row.StorageMode = details.Mode.String()
				row.MigrationLogError = details.MigrationLogError
				if details.MigrationLogError != "" {
					report.Degraded = true
				}
			}
			report.Resources = append(report.Resources, row)
		}
	}
	return report
}
