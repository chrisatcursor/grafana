import { render, screen } from 'test/test-utils';

import { NovaComInfraDemoPage } from './NovaComInfraDemoPage';

const mockGetList = jest.fn();

jest.mock('@grafana/runtime', () => {
  const actual = jest.requireActual('@grafana/runtime');
  return {
    ...actual,
    getDataSourceSrv: () => ({
      getList: mockGetList,
    }),
  };
});

describe('NovaComInfraDemoPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows warning when TestData datasource is not available', async () => {
    mockGetList.mockReturnValue([]);
    render(<NovaComInfraDemoPage />);

    expect(
      await screen.findByText('Add a Grafana TestData datasource to view this demo dashboard.')
    ).toBeInTheDocument();
  });

});
