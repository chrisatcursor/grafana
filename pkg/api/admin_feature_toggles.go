package api

import (
	"net/http"
	"sort"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
)

type adminFeatureToggleStatus struct {
	Name            string `json:"name"`
	Description     string `json:"description,omitempty"`
	Stage           string `json:"stage"`
	Enabled         bool   `json:"enabled"`
	Writeable       bool   `json:"writeable"`
	FrontendOnly    bool   `json:"frontendOnly,omitempty"`
	RequiresRestart bool   `json:"requiresRestart,omitempty"`
	HideFromDocs    bool   `json:"hideFromDocs,omitempty"`
	Warning         string `json:"warning,omitempty"`
}

type adminFeatureTogglesResponse struct {
	Toggles []adminFeatureToggleStatus `json:"toggles"`
}

// swagger:route GET /admin/feature-toggles admin adminGetFeatureToggles
//
// Returns registered feature toggles and their resolved enabled state for this Grafana instance.
//
// Security:
// - basic:
//
// Responses:
// 200: adminGetFeatureTogglesResponse
// 401: unauthorisedError
// 403: forbiddenError
func (hs *HTTPServer) AdminGetFeatureToggles(c *contextmodel.ReqContext) response.Response {
	mgr, ok := hs.Features.(*featuremgmt.FeatureManager)
	if !ok {
		return response.Error(http.StatusInternalServerError, "Feature toggles are not available", nil)
	}

	flags := mgr.GetFlags()
	sort.Slice(flags, func(i, j int) bool { return flags[i].Name < flags[j].Name })

	warnings := mgr.GetWarnings()
	ctx := c.Req.Context()
	out := make([]adminFeatureToggleStatus, 0, len(flags))
	for _, f := range flags {
		warn := warnings[f.Name]
		out = append(out, adminFeatureToggleStatus{
			Name:            f.Name,
			Description:     f.Description,
			Stage:           f.Stage.String(),
			Enabled:         mgr.IsEnabled(ctx, f.Name),
			Writeable:       false,
			FrontendOnly:    f.FrontendOnly,
			RequiresRestart: f.RequiresRestart,
			HideFromDocs:    f.HideFromDocs,
			Warning:         warn,
		})
	}

	return response.JSON(http.StatusOK, adminFeatureTogglesResponse{Toggles: out})
}
