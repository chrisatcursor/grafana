import { getBackendSrv } from '@grafana/runtime';

import { getFeatureTogglesAdmin } from './api';

jest.mock('@grafana/runtime', () => ({
  getBackendSrv: jest.fn(),
}));

const getBackendSrvMock = jest.mocked(getBackendSrv);

describe('getFeatureTogglesAdmin', () => {
  it('returns normalized rows for valid payload', async () => {
    getBackendSrvMock.mockReturnValue({
      get: jest.fn().mockResolvedValue([
        {
          name: 'foo',
          enabled: false,
          description: 'd',
          stage: 'GA',
          expression: 'false',
          requiresDevMode: false,
          requiresRestart: true,
          frontendOnly: false,
        },
      ]),
    } as ReturnType<typeof getBackendSrv>);

    const rows = await getFeatureTogglesAdmin();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      name: 'foo',
      enabled: false,
      requiresRestart: true,
    });
  });

  it('rejects when enabled is not a boolean', async () => {
    getBackendSrvMock.mockReturnValue({
      get: jest.fn().mockResolvedValue([{ name: 'bad', enabled: 'true' }]),
    } as ReturnType<typeof getBackendSrv>);

    await expect(getFeatureTogglesAdmin()).rejects.toThrow('Invalid feature toggles response');
  });

  it('rejects non-array JSON', async () => {
    getBackendSrvMock.mockReturnValue({
      get: jest.fn().mockResolvedValue({}),
    } as ReturnType<typeof getBackendSrv>);

    await expect(getFeatureTogglesAdmin()).rejects.toThrow('Invalid feature toggles response');
  });
});
