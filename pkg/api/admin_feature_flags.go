package api

import (
	"net/http"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
)

// swagger:route GET /admin/feature-toggles admin adminGetFeatureToggles
//
// # List registered feature toggles and their effective state
//
// Requires action `server.stats:read`.
//
// Responses:
// 200: adminGetFeatureTogglesResponse
// 401: unauthorisedError
// 403: forbiddenError
func (hs *HTTPServer) AdminGetFeatureToggles(c *contextmodel.ReqContext) response.Response {
	fm, ok := hs.Features.(*featuremgmt.FeatureManager)
	if !ok {
		return response.JSON(http.StatusOK, []featuremgmt.FeatureFlagAdminInfo{})
	}
	return response.JSON(http.StatusOK, fm.GetAdminFlagList(c.Req.Context()))
}
