package api

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/featuremgmt"
	"github.com/grafana/grafana/pkg/web/webtest"
)

func TestAdminGetFeatureToggles_Response(t *testing.T) {
	server := SetupAPITestServer(t, func(hs *HTTPServer) {
		hs.Features = featuremgmt.WithManager(
			[]any{"alphaFlag", true, "betaFlag", false}...,
		)
	})

	res, err := server.Send(webtest.RequestWithSignedInUser(
		server.NewGetRequest("/api/admin/feature-toggles"),
		userWithPermissions(1, []accesscontrol.Permission{{Action: accesscontrol.ActionSettingsRead}}),
	))
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, res.StatusCode)

	body, err := io.ReadAll(res.Body)
	require.NoError(t, err)
	require.NoError(t, res.Body.Close())

	var parsed struct {
		Toggles []struct {
			Name    string `json:"name"`
			Enabled bool   `json:"enabled"`
		} `json:"toggles"`
	}
	require.NoError(t, json.Unmarshal(body, &parsed))
	require.Len(t, parsed.Toggles, 2)

	byName := make(map[string]bool, len(parsed.Toggles))
	for _, row := range parsed.Toggles {
		byName[row.Name] = row.Enabled
	}
	assert.True(t, byName["alphaFlag"])
	assert.False(t, byName["betaFlag"])
}

func TestAdminGetFeatureToggles_FeatureManagerRequired(t *testing.T) {
	server := SetupAPITestServer(t, func(hs *HTTPServer) {
		// Non-*FeatureManager implementation (test double) cannot serve this endpoint.
		hs.Features = &stubFeatureToggles{}
	})

	res, err := server.Send(webtest.RequestWithSignedInUser(
		server.NewGetRequest("/api/admin/feature-toggles"),
		userWithPermissions(1, []accesscontrol.Permission{{Action: accesscontrol.ActionSettingsRead}}),
	))
	require.NoError(t, err)
	assert.Equal(t, http.StatusInternalServerError, res.StatusCode)
}

type stubFeatureToggles struct{}

func (stubFeatureToggles) IsEnabled(_ context.Context, _ string) bool   { return false }
func (stubFeatureToggles) IsEnabledGlobally(_ string) bool              { return false }
func (stubFeatureToggles) GetEnabled(_ context.Context) map[string]bool { return nil }
