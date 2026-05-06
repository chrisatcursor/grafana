import { mockNavModel } from 'test/mocks/navModel';
import { render, screen, waitFor } from 'test/test-utils';

import FeatureFlagsPage from './FeatureFlagsPage';

const getResolvedToggles = jest.fn();

jest.mock('./api', () => ({
  featureFlagsApi: {
    getResolvedToggles: (...args: unknown[]) => getResolvedToggles(...args),
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
  beforeEach(() => {
    getResolvedToggles.mockResolvedValue({
      toggles: [
        {
          name: 'testFlag',
          description: 'A test flag',
          stage: 'experimental',
          enabled: true,
          frontendOnly: true,
        },
      ],
    });
  });

  it('renders the feature toggles table after loading', async () => {
    render(<FeatureFlagsPage />, { preloadedState: { navIndex: mockNavModel } });

    expect(await screen.findByText('testFlag')).toBeInTheDocument();
    expect(screen.getByText('A test flag')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/loading feature toggles/i)).not.toBeInTheDocument();
    });
  });

  it('filters toggles by enabled state (on/off)', async () => {
    getResolvedToggles.mockResolvedValue({
      toggles: [
        { name: 'alpha', description: 'A', stage: 'GA', enabled: true },
        { name: 'beta', description: 'B', stage: 'GA', enabled: false },
      ],
    });

    const { user } = render(<FeatureFlagsPage />, { preloadedState: { navIndex: mockNavModel } });

    expect(await screen.findByText('alpha')).toBeInTheDocument();
    expect(screen.getByText('beta')).toBeInTheDocument();

    const filter = screen.getByRole('searchbox', { name: /filter feature toggles/i });
    await user.type(filter, 'off');

    expect(screen.queryByText('alpha')).not.toBeInTheDocument();
    expect(screen.getByText('beta')).toBeInTheDocument();
  });
});
