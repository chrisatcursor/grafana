package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/accesscontrol/acimpl"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/web/webtest"
)

func TestAdminGetFeatureToggles(t *testing.T) {
	t.Run("Should return feature toggles when authorized", func(t *testing.T) {
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

	t.Run("Should return correct feature toggle data", func(t *testing.T) {
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

		var result []FeatureFlagDTO
		err = json.NewDecoder(res.Body).Decode(&result)
		require.NoError(t, err)
		require.NoError(t, res.Body.Close())

		assert.Len(t, result, 2)

		// Find each feature by name
		featureMap := make(map[string]FeatureFlagDTO)
		for _, f := range result {
			featureMap[f.Name] = f
		}

		enabledFeature, ok := featureMap["enabledFeature"]
		require.True(t, ok, "enabledFeature should be present")
		assert.True(t, enabledFeature.Enabled)

		disabledFeature, ok := featureMap["disabledFeature"]
		require.True(t, ok, "disabledFeature should be present")
		assert.False(t, disabledFeature.Enabled)
	})
}

// Mock recorder for testing
type mockRecorder struct {
	*httptest.ResponseRecorder
}

func newMockRecorder() *mockRecorder {
	return &mockRecorder{httptest.NewRecorder()}
}
