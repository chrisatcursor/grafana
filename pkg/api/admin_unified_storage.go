package api

import (
	"net/http"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/storage/unified/migrations"
)

// swagger:route GET /admin/unified-storage/migration-status admin adminGetUnifiedStorageMigrationStatus
//
// Unified storage migration status.
//
// Returns per-resource storage mode (legacy, dual-write, unified) for resources registered
// in the unified storage migration registry, plus relevant unified storage config fields.
//
// Responses:
// 200: adminGetUnifiedStorageMigrationStatusResponse
// 401: unauthorisedError
// 403: forbiddenError
// 500: internalServerError
func (hs *HTTPServer) AdminGetUnifiedStorageMigrationStatus(c *contextmodel.ReqContext) response.Response {
	if hs.migrationStatusReader == nil || hs.migrationRegistry == nil {
		return response.Error(http.StatusInternalServerError, "unified storage migration reporting is not available", nil)
	}
	report := migrations.BuildMigrationStatusReport(c.Req.Context(), hs.Cfg, hs.migrationStatusReader, hs.migrationRegistry)
	return response.JSON(http.StatusOK, report)
}

// swagger:response adminGetUnifiedStorageMigrationStatusResponse
type adminGetUnifiedStorageMigrationStatusResponse struct {
	// in:body
	Body migrations.MigrationStatusReport `json:"body"`
}
