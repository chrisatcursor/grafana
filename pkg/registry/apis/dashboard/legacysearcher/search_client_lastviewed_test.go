package legacysearcher

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	dashboard "github.com/grafana/grafana/apps/dashboard/pkg/apis/dashboard/v1beta1"
	"github.com/grafana/grafana/pkg/apimachinery/identity"
	"github.com/grafana/grafana/pkg/services/dashboards"
	"github.com/grafana/grafana/pkg/services/dashboardview/viewtest"
	"github.com/grafana/grafana/pkg/services/search/sort"
	"github.com/grafana/grafana/pkg/services/user"
	"github.com/grafana/grafana/pkg/storage/unified/resource"
	"github.com/grafana/grafana/pkg/storage/unified/resourcepb"
)

func TestDashboardSearchClient_LastViewedColumn(t *testing.T) {
	mockStore := dashboards.NewFakeDashboardStore(t)
	sortSvc := sort.ProvideService()
	viewedAt := time.Date(2024, 6, 1, 12, 0, 0, 0, time.UTC)
	viewService := viewtest.NewFakeDashboardViewService()
	viewService.Views["uid"] = viewedAt
	client := NewDashboardSearchClient(mockStore, sortSvc, viewService)

	ctx := context.Background()
	signedInUser := &user.SignedInUser{OrgID: 2, UserID: 10}
	ctx = identity.WithRequester(ctx, signedInUser)

	emptyTags, err := json.Marshal([]string{})
	require.NoError(t, err)

	mockStore.On("FindDashboards", mock.Anything, mock.Anything).Return([]dashboards.DashboardSearchProjection{
		{ID: 1, UID: "uid", Title: "Test Dashboard", FolderUID: "folder1", Tags: []string{}},
	}, nil).Twice()

	req := &resourcepb.ResourceSearchRequest{
		Options: &resourcepb.ListOptions{
			Key: &resourcepb.ResourceKey{
				Name:     "uid",
				Resource: dashboard.DASHBOARD_RESOURCE,
			},
		},
	}
	resp, err := client.Search(ctx, req)
	require.NoError(t, err)

	searchFields := resource.StandardSearchFields()
	require.Equal(t, []*resourcepb.ResourceTableColumnDefinition{
		searchFields.Field(resource.SEARCH_FIELD_TITLE),
		searchFields.Field(resource.SEARCH_FIELD_FOLDER),
		searchFields.Field(resource.SEARCH_FIELD_TAGS),
		searchFields.Field(resource.SEARCH_FIELD_LEGACY_ID),
		{
			Name: resource.SEARCH_FIELD_LAST_VIEWED,
			Type: resourcepb.ResourceTableColumnDefinition_STRING,
		},
	}, resp.Results.Columns)
	require.Equal(t, viewedAt.UTC().Format(time.RFC3339), string(resp.Results.Rows[0].Cells[4]))
	require.Equal(t, [][]byte{
		[]byte("Test Dashboard"),
		[]byte("folder1"),
		emptyTags,
		[]byte("1"),
		[]byte(viewedAt.UTC().Format(time.RFC3339)),
	}, resp.Results.Rows[0].Cells)
}
