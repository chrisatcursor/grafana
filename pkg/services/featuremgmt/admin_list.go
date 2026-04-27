package featuremgmt

import (
	"context"
	"sort"
)

// FeatureFlagAdminInfo is the payload for the admin feature toggles API.
type FeatureFlagAdminInfo struct {
	Name            string `json:"name"`
	Description     string `json:"description"`
	Stage           string `json:"stage"`
	Enabled         bool   `json:"enabled"`
	Expression      string `json:"expression"`
	RequiresDevMode bool   `json:"requiresDevMode"`
	RequiresRestart bool   `json:"requiresRestart"`
	FrontendOnly    bool   `json:"frontendOnly"`
	Owner           string `json:"owner,omitempty"`
	Warning         string `json:"warning,omitempty"`
}

// GetAdminFlagList returns registered toggles with effective state for the server admin UI.
func (fm *FeatureManager) GetAdminFlagList(ctx context.Context) []FeatureFlagAdminInfo {
	flags := fm.GetFlags()
	enabled := fm.GetEnabled(ctx)
	sort.Slice(flags, func(i, j int) bool {
		return flags[i].Name < flags[j].Name
	})

	out := make([]FeatureFlagAdminInfo, 0, len(flags))
	for _, f := range flags {
		warning := fm.warnings[f.Name]
		owner := ""
		if f.Owner != "" {
			owner = string(f.Owner)
		}
		out = append(out, FeatureFlagAdminInfo{
			Name:            f.Name,
			Description:     f.Description,
			Stage:           f.Stage.String(),
			Enabled:         enabled[f.Name],
			Expression:      f.Expression,
			RequiresDevMode: f.RequiresDevMode,
			RequiresRestart: f.RequiresRestart,
			FrontendOnly:    f.FrontendOnly,
			Owner:           owner,
			Warning:         warning,
		})
	}
	return out
}
