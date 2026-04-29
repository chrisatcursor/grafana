package api

import (
	"net/http"
	"sort"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
)

// FeatureFlagDTO represents a feature flag with its current state
type FeatureFlagDTO struct {
	Name            string `json:"name"`
	Description     string `json:"description"`
	Stage           string `json:"stage"`
	Enabled         bool   `json:"enabled"`
	RequiresDevMode bool   `json:"requiresDevMode,omitempty"`
	FrontendOnly    bool   `json:"frontendOnly,omitempty"`
	RequiresRestart bool   `json:"requiresRestart,omitempty"`
}

// swagger:route GET /admin/featuretoggles admin adminGetFeatureToggles
//
// Fetch feature toggles.
//
// Returns all available feature toggles and their current enabled state.
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
	// Get the feature manager
	fm, ok := hs.Features.(*featuremgmt.FeatureManager)
	if !ok {
		return response.JSON(http.StatusOK, []FeatureFlagDTO{})
	}

	// Get all flags and enabled state
	flags := fm.GetFlags()
	enabledMap := hs.Features.GetEnabled(c.Req.Context())

	// Convert to DTOs
	result := make([]FeatureFlagDTO, 0, len(flags))
	for _, flag := range flags {
		dto := FeatureFlagDTO{
			Name:            flag.Name,
			Description:     flag.Description,
			Stage:           flag.Stage.String(),
			Enabled:         enabledMap[flag.Name],
			RequiresDevMode: flag.RequiresDevMode,
			FrontendOnly:    flag.FrontendOnly,
			RequiresRestart: flag.RequiresRestart,
		}
		result = append(result, dto)
	}

	// Sort by name for consistent ordering
	sort.Slice(result, func(i, j int) bool {
		return result[i].Name < result[j].Name
	})

	return response.JSON(http.StatusOK, result)
}

// swagger:response adminGetFeatureTogglesResponse
type AdminGetFeatureTogglesResponse struct {
	// in:body
	Body []FeatureFlagDTO `json:"body"`
}
