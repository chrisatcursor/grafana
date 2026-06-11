package api

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/open-feature/go-sdk/openfeature"
	"github.com/open-feature/go-sdk/openfeature/memprovider"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/accesscontrol/acimpl"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/web/webtest"
)

func setupOpenFeatureForAdminTests(t *testing.T) {
	t.Helper()
	t.Cleanup(func() {
		openfeature.Shutdown()
	})

	err := featuremgmt.InitOpenFeature(featuremgmt.OpenFeatureConfig{
		ProviderType: setting.StaticProviderType,
		StaticFlags: map[string]memprovider.InMemoryFlag{
			"testFeature":     memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": true}},
			"anotherFeature":  memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": false}},
			"enabledFeature":  memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": true}},
			"disabledFeature": memprovider.InMemoryFlag{DefaultVariant: "default", Variants: map[string]any{"default": false}},
		},
	})
	require.NoError(t, err)
}

func TestAdminGetFeatureToggles(t *testing.T) {
	t.Run("Should return feature toggles when authorized", func(t *testing.T) {
		setupOpenFeatureForAdminTests(t)

		features := featuremgmt.WithManager("testFeature", true, "anotherFeature", false)
		server := SetupAPITestServer(t, func(hs *HTTPServer) {
			hs.Cfg = setting.NewCfg()
			hs.Features = features
			hs.AccessControl = acimpl.ProvideAccessControl(features)
		})

		req := server.NewGetRequest("/api/admin/featuretoggles")
		webtest.RequestWithSignedInUser(req, userWithPermissions(1, []accesscontrol.Permission{
			{Action: accesscontrol.ActionFeatureManagementRead},
		}))
		res, err := server.Send(req)
		require.NoError(t, err)

		assert.Equal(t, http.StatusOK, res.StatusCode)
		require.NoError(t, res.Body.Close())
	})

	t.Run("Should return 403 when not authorized", func(t *testing.T) {
		features := featuremgmt.WithManager("testFeature", true)
		server := SetupAPITestServer(t, func(hs *HTTPServer) {
			hs.Cfg = setting.NewCfg()
			hs.Features = features
			hs.AccessControl = acimpl.ProvideAccessControl(features)
		})

		req := server.NewGetRequest("/api/admin/featuretoggles")
		webtest.RequestWithSignedInUser(req, userWithPermissions(1, nil))
		res, err := server.Send(req)
		require.NoError(t, err)

		assert.Equal(t, http.StatusForbidden, res.StatusCode)
		require.NoError(t, res.Body.Close())
	})

	t.Run("Should return correct OpenFeature evaluated data", func(t *testing.T) {
		setupOpenFeatureForAdminTests(t)

		features := featuremgmt.WithManager("enabledFeature", true, "disabledFeature", false)
		server := SetupAPITestServer(t, func(hs *HTTPServer) {
			hs.Cfg = setting.NewCfg()
			hs.Features = features
			hs.AccessControl = acimpl.ProvideAccessControl(features)
		})

		req := server.NewGetRequest("/api/admin/featuretoggles")
		webtest.RequestWithSignedInUser(req, userWithPermissions(1, []accesscontrol.Permission{
			{Action: accesscontrol.ActionFeatureManagementRead},
		}))
		res, err := server.Send(req)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, res.StatusCode)

		var result []featuremgmt.FeatureFlagState
		err = json.NewDecoder(res.Body).Decode(&result)
		require.NoError(t, err)
		require.NoError(t, res.Body.Close())

		assert.Len(t, result, 2)

		featureMap := make(map[string]featuremgmt.FeatureFlagState)
		for _, f := range result {
			featureMap[f.Name] = f
		}

		enabledFeature, ok := featureMap["enabledFeature"]
		require.True(t, ok, "enabledFeature should be present")
		assert.True(t, enabledFeature.Enabled)
		assert.Equal(t, "boolean", enabledFeature.ValueType)

		disabledFeature, ok := featureMap["disabledFeature"]
		require.True(t, ok, "disabledFeature should be present")
		assert.False(t, disabledFeature.Enabled)
	})
}
