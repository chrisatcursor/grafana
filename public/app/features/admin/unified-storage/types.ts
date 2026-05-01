export interface UnifiedStorageMigrationResource {
  group: string;
  resource: string;
  configKey: string;
  migrationDefinitionId: string;
  migrationId: string;
  storageMode: string;
  migrationLogError?: string;
  dualWriterMode: number;
  enableMigration: boolean;
}

export interface UnifiedStorageMigrationReport {
  disableDataMigrations: boolean;
  degraded: boolean;
  resources: UnifiedStorageMigrationResource[];
}
