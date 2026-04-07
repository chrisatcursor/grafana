package api

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/infra/db/dbtest"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/anonymous/anontest"
	"github.com/grafana/grafana/pkg/services/stats"
	"github.com/grafana/grafana/pkg/services/stats/statstest"
	"github.com/grafana/grafana/pkg/setting"
	unifiedmigration "github.com/grafana/grafana/pkg/storage/unified/migrations/contract"
	"github.com/grafana/grafana/pkg/web/webtest"
)

// fakeMigrationAdminStatusProvider implements unifiedmigration.MigrationAdminStatusProvider for API tests.
type fakeMigrationAdminStatusProvider struct {
	status *unifiedmigration.MigrationAdminStatus
	err    error
}

func (f *fakeMigrationAdminStatusProvider) GetMigrationAdminStatus(ctx context.Context) (*unifiedmigration.MigrationAdminStatus, error) {
	if f.err != nil {
		return nil, f.err
	}
	return f.status, nil
}

func TestAPI_AdminGetSettings(t *testing.T) {
	type testCase struct {
		desc         string
		expectedCode int
		expectedBody string
		permissions  []accesscontrol.Permission
	}
	tests := []testCase{
		{
			desc:         "should return all settings",
			expectedCode: http.StatusOK,
			expectedBody: `{"auth.proxy":{"enable_login_token":"false","enabled":"false"},"auth.saml":{"allow_idp_initiated":"false","enabled":"true"}}`,
			permissions: []accesscontrol.Permission{
				{
					Action: accesscontrol.ActionSettingsRead,
					Scope:  accesscontrol.ScopeSettingsAll,
				},
			},
		},
		{
			desc:         "should only return auth.saml settings",
			expectedCode: http.StatusOK,
			expectedBody: `{"auth.saml":{"allow_idp_initiated":"false","enabled":"true"}}`,
			permissions: []accesscontrol.Permission{
				{
					Action: accesscontrol.ActionSettingsRead,
					Scope:  "settings:auth.saml:*",
				},
			},
		},
		{
			desc:         "should only partial properties from auth.saml and auth.proxy settings",
			expectedCode: http.StatusOK,
			expectedBody: `{"auth.proxy":{"enable_login_token":"false"},"auth.saml":{"enabled":"true"}}`,
			permissions: []accesscontrol.Permission{
				{
					Action: accesscontrol.ActionSettingsRead,
					Scope:  "settings:auth.saml:enabled",
				},
				{
					Action: accesscontrol.ActionSettingsRead,
					Scope:  "settings:auth.proxy:enable_login_token",
				},
			},
		},
	}

	cfg := setting.NewCfg()
	//seed sections and keys
	cfg.Raw.DeleteSection("DEFAULT")
	saml, err := cfg.Raw.NewSection("auth.saml")
	assert.NoError(t, err)
	_, err = saml.NewKey("enabled", "true")
	assert.NoError(t, err)
	_, err = saml.NewKey("allow_idp_initiated", "false")
	assert.NoError(t, err)

	proxy, err := cfg.Raw.NewSection("auth.proxy")
	assert.NoError(t, err)
	_, err = proxy.NewKey("enabled", "false")
	assert.NoError(t, err)
	_, err = proxy.NewKey("enable_login_token", "false")
	assert.NoError(t, err)

	for _, tt := range tests {
		t.Run(tt.desc, func(t *testing.T) {
			server := SetupAPITestServer(t, func(hs *HTTPServer) {
				hs.Cfg = cfg
				hs.SettingsProvider = setting.ProvideProvider(hs.Cfg)
			})

			res, err := server.Send(webtest.RequestWithSignedInUser(server.NewGetRequest("/api/admin/settings"), userWithPermissions(1, tt.permissions)))
			require.NoError(t, err)
			assert.Equal(t, tt.expectedCode, res.StatusCode)
			body, err := io.ReadAll(res.Body)
			require.NoError(t, err)
			assert.Equal(t, tt.expectedBody, string(body))
			require.NoError(t, res.Body.Close())
		})
	}
}

func TestAdmin_AccessControl(t *testing.T) {
	type testCase struct {
		desc                string
		url                 string
		permissions         []accesscontrol.Permission
		expectedCode        int
		assertMigrationJSON bool
	}

	tests := []testCase{
		{
			expectedCode: http.StatusOK,
			desc:         "AdminGetStats should return 200 for user with correct permissions",
			url:          "/api/admin/stats",
			permissions: []accesscontrol.Permission{
				{
					Action: accesscontrol.ActionServerStatsRead,
				},
			},
		},
		{
			expectedCode: http.StatusForbidden,
			desc:         "AdminGetStats should return 403 for user without required permissions",
			url:          "/api/admin/stats",
			permissions: []accesscontrol.Permission{
				{
					Action: "wrong",
				},
			},
		},
		{
			expectedCode: http.StatusOK,
			desc:         "AdminGetSettings should return 200 for user with correct permissions",
			url:          "/api/admin/settings",
			permissions: []accesscontrol.Permission{
				{
					Action: accesscontrol.ActionSettingsRead,
				},
			},
		},
		{
			expectedCode: http.StatusForbidden,
			desc:         "AdminGetSettings should return 403 for user without required permissions",
			url:          "/api/admin/settings",
			permissions: []accesscontrol.Permission{
				{
					Action: "wrong",
				},
			},
		},
		{
			expectedCode: http.StatusOK,
			desc:         "AdminGetUnifiedStorageMigrationStatus should return 200 for user with server.stats:read",
			url:          "/api/admin/unified-storage/migration-status",
			permissions: []accesscontrol.Permission{
				{
					Action: accesscontrol.ActionServerStatsRead,
				},
			},
			assertMigrationJSON: true,
		},
		{
			expectedCode: http.StatusForbidden,
			desc:         "AdminGetUnifiedStorageMigrationStatus should return 403 for user without required permissions",
			url:          "/api/admin/unified-storage/migration-status",
			permissions: []accesscontrol.Permission{
				{
					Action: "wrong",
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.desc, func(t *testing.T) {
			fakeStatsService := statstest.NewFakeService()
			fakeStatsService.ExpectedAdminStats = &stats.AdminStats{}
			fakeAnonService := anontest.NewFakeService()
			fakeAnonService.ExpectedCountDevices = 0
			migrationStatus := &unifiedmigration.MigrationAdminStatus{
				DisableDataMigrations: true,
				StorageType:           "sql",
				Migrations: []unifiedmigration.MigrationDefinitionStatus{
					{ID: "def-1", MigrationID: "mig-1", LogRecorded: false},
				},
				Resources: []unifiedmigration.ResourceMigrationStatus{
					{
						Group:               "dashboard.grafana.app",
						Resource:            "dashboards",
						ConfigKey:           "unified_storage.dashboards",
						EnableMigration:     false,
						DualWriterMode:      0,
						ResolvedStorageMode: "sql",
					},
				},
			}
			server := SetupAPITestServer(t, func(hs *HTTPServer) {
				hs.Cfg = setting.NewCfg()
				hs.SQLStore = dbtest.NewFakeDB()
				hs.SettingsProvider = &setting.OSSImpl{Cfg: hs.Cfg}
				hs.statsService = fakeStatsService
				hs.anonService = fakeAnonService
				hs.migrationAdminStatus = &fakeMigrationAdminStatusProvider{status: migrationStatus}
			})

			res, err := server.Send(webtest.RequestWithSignedInUser(server.NewGetRequest(tt.url), userWithPermissions(1, tt.permissions)))
			require.NoError(t, err)
			assert.Equal(t, tt.expectedCode, res.StatusCode)
			if tt.assertMigrationJSON {
				body, readErr := io.ReadAll(res.Body)
				require.NoError(t, readErr)
				var payload map[string]json.RawMessage
				require.NoError(t, json.Unmarshal(body, &payload))
				for _, key := range []string{"disableDataMigrations", "storageType", "migrations", "resources"} {
					_, ok := payload[key]
					assert.True(t, ok, "response JSON should include key %q", key)
				}
				assert.Equal(t, json.RawMessage("true"), payload["disableDataMigrations"])
				assert.Equal(t, json.RawMessage(`"sql"`), payload["storageType"])
			}
			require.NoError(t, res.Body.Close())
		})
	}
}
