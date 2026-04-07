package contract

import "context"

// MigrationAdminStatusProvider exposes read-only unified storage data migration status for admin HTTP APIs.
type MigrationAdminStatusProvider interface {
	GetMigrationAdminStatus(ctx context.Context) (*MigrationAdminStatus, error)
}

// MigrationAdminStatus is the JSON response for GET /api/admin/unified-storage/migration-status.
type MigrationAdminStatus struct {
	DisableDataMigrations bool                        `json:"disableDataMigrations"`
	StorageType           string                      `json:"storageType"`
	Migrations            []MigrationDefinitionStatus `json:"migrations"`
	Resources             []ResourceMigrationStatus   `json:"resources"`
}

// MigrationDefinitionStatus summarizes one registered MigrationDefinition and its SQL migration log row.
type MigrationDefinitionStatus struct {
	ID           string  `json:"id"`
	MigrationID  string  `json:"migrationId"`
	LogRecorded  bool    `json:"logRecorded"`
	LogSuccess   *bool   `json:"logSuccess,omitempty"`
	LogTimestamp *string `json:"logTimestamp,omitempty"`
}

// ResourceMigrationStatus describes one migrated GroupResource: config and resolved storage mode.
type ResourceMigrationStatus struct {
	Group               string `json:"group"`
	Resource            string `json:"resource"`
	ConfigKey           string `json:"configKey"`
	EnableMigration     bool   `json:"enableMigration"`
	DualWriterMode      int    `json:"dualWriterMode"`
	ResolvedStorageMode string `json:"resolvedStorageMode"`
}
