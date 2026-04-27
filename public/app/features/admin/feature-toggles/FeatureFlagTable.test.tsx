import { render, screen, waitFor } from '@testing-library/react';

import { FeatureFlagTable } from './FeatureFlagTable';

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

jest.mock('./api', () => ({
  getFeatureTogglesAdmin: jest.fn(async () => mockRows),
}));

describe('FeatureFlagTable', () => {
  it('renders loaded rows', async () => {
    render(<FeatureFlagTable />);
    await waitFor(() => {
      expect(screen.getByText('alphaTestFlag')).toBeInTheDocument();
    });
    expect(screen.getByText('Alpha feature for tests')).toBeInTheDocument();
  });
});
