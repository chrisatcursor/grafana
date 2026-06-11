package api

import (
	"net/http"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
	"github.com/grafana/grafana/pkg/setting"
)

// swagger:route GET /admin/featuretoggles admin adminGetFeatureToggles
//
// Fetch feature toggles.
//
// Returns all available feature toggles and their current enabled state evaluated via OpenFeature.
// If you have Fine-grained access control enabled, you need to have a permission with action `featuremgmt.read`.
//
// Security:
// - basic:
//
// Responses:
// 200: adminGetFeatureTogglesResponse
// 401: unauthorisedError
// 403: forbiddenError
func (hs *HTTPServer) AdminGetFeatureToggles(c *contextmodel.ReqContext) response.Response {
	fm, ok := hs.Features.(*featuremgmt.FeatureManager)
	if !ok {
		return response.JSON(http.StatusOK, []featuremgmt.FeatureFlagState{})
	}

	isDevMode := hs.Cfg.Env == setting.Dev
	flags := fm.GetFlags()
	result := featuremgmt.EvaluateAllFlags(c.Req.Context(), flags, isDevMode)

	return response.JSON(http.StatusOK, result)
}

// swagger:response adminGetFeatureTogglesResponse
type AdminGetFeatureTogglesResponse struct {
	// in:body
	Body []featuremgmt.FeatureFlagState `json:"body"`
}
