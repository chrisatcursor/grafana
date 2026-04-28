import { mockNavModel } from 'test/mocks/navModel';
import { render, screen, waitFor } from 'test/test-utils';

import FeatureFlagsPage from './FeatureFlagsPage';

jest.mock('./api', () => ({
  featureFlagsApi: {
    getResolvedToggles: jest.fn().mockResolvedValue({
      toggles: [
        {
          name: 'testFlag',
          description: 'A test flag',
          stage: 'experimental',
          enabled: true,
          frontendOnly: true,
        },
      ],
    }),
  },
}));

jest.mock('app/core/services/context_srv', () => ({
  contextSrv: {
    hasPermission: () => true,
    user: {
      orgId: 1,
      timezone: 'browser',
      weekStart: 'browser',
    },
  },
}));

describe('FeatureFlagsPage', () => {
  it('renders the feature toggles table after loading', async () => {
    render(<FeatureFlagsPage />, { preloadedState: { navIndex: mockNavModel } });

    expect(await screen.findByText('testFlag')).toBeInTheDocument();
    expect(screen.getByText('A test flag')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/loading feature toggles/i)).not.toBeInTheDocument();
    });
  });
});
