import { render, screen, waitFor } from '@testing-library/react';

import { FeatureFlagTable } from './FeatureFlagTable';
import { getFeatureTogglesAdmin } from './api';

jest.mock('./api', () => ({
  getFeatureTogglesAdmin: jest.fn(),
}));

const mockGetFeatureTogglesAdmin = jest.mocked(getFeatureTogglesAdmin);

const mockRows = [
  {
    name: 'alphaTestFlag',
    description: 'Alpha feature for tests',
    stage: 'experimental',
    enabled: true,
    expression: 'false',
    requiresDevMode: false,
    requiresRestart: false,
    frontendOnly: false,
    owner: '@grafana/test',
  },
];

describe('FeatureFlagTable', () => {
  beforeEach(() => {
    mockGetFeatureTogglesAdmin.mockResolvedValue(mockRows);
  });

  it('renders loaded rows', async () => {
    render(<FeatureFlagTable />);
    await waitFor(() => {
      expect(screen.getByText('alphaTestFlag')).toBeInTheDocument();
    });
    expect(screen.getByText('Alpha feature for tests')).toBeInTheDocument();
    expect(screen.getByText('@grafana/test')).toBeInTheDocument();
  });

  it('shows empty state when API returns no toggles', async () => {
    mockGetFeatureTogglesAdmin.mockResolvedValueOnce([]);
    render(<FeatureFlagTable />);
    expect(await screen.findByText(/No feature toggles were returned/i)).toBeInTheDocument();
  });

  it('shows error when API returns invalid payload', async () => {
    mockGetFeatureTogglesAdmin.mockRejectedValueOnce(new Error('Invalid feature toggles response'));
    render(<FeatureFlagTable />);
    expect(await screen.findByText(/Could not load feature toggles/i)).toBeInTheDocument();
  });
});
