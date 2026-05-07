package featuremgmt

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/setting"
)

func TestFeatureManager_GetAdminFlagList(t *testing.T) {
	t.Parallel()

	cfg := settingWithFeatureToggles(t, map[string]bool{"panelTitleSearch": true})
	fm, err := ProvideManagerService(cfg)
	require.NoError(t, err)

	list := fm.GetAdminFlagList(context.Background())
	require.NotEmpty(t, list)

	var panelSearch *FeatureFlagAdminInfo
	for i := range list {
		if list[i].Name == "panelTitleSearch" {
			panelSearch = &list[i]
			break
		}
	}
	require.NotNil(t, panelSearch, "expected panelTitleSearch in registry")
	assert.True(t, panelSearch.Enabled)
	assert.NotEmpty(t, panelSearch.Stage)
	assert.Contains(t, panelSearch.Description, "panel")
}

func settingWithFeatureToggles(t *testing.T, toggles map[string]bool) *setting.Cfg {
	t.Helper()
	cfg := setting.NewCfg()
	sec, err := cfg.Raw.NewSection("feature_toggles")
	require.NoError(t, err)
	for k, v := range toggles {
		val := "false"
		if v {
			val = "true"
		}
		_, err = sec.NewKey(k, val)
		require.NoError(t, err)
	}
	return cfg
}
