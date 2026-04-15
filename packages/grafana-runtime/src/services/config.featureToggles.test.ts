import { OpenFeature } from '@openfeature/react-sdk';

describe('GrafanaBootConfig feature toggles', () => {
  beforeEach(() => {
    (window as unknown as { grafanaBootData: unknown }).grafanaBootData = {
      assets: {
        dark: '',
        light: '',
      },
      settings: {
        buildInfo: {
          env: 'production',
        },
        featureToggles: {
          queryServiceFromUI: false,
          useSessionStorageForRedirection: true,
        },
      },
      user: {
        theme: 'dark',
        regionalFormat: 'en-US',
      },
      navTree: [],
    };
  });

  afterEach(() => {
    delete (window as unknown as { grafanaBootData?: unknown }).grafanaBootData;
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it('evaluates configured feature toggles through OpenFeature client', async () => {
    const getBooleanValue = jest.fn().mockReturnValue(false);
    jest.spyOn(OpenFeature, 'getClient').mockReturnValue({
      getBooleanValue,
    } as unknown as ReturnType<typeof OpenFeature.getClient>);

    const { config } = await import('../config');

    expect(config.featureToggles.queryServiceFromUI).toBe(false);
    expect(getBooleanValue).toHaveBeenCalledWith('queryServiceFromUI', false);
  });

  it('falls back to boot data value when OpenFeature evaluation fails', async () => {
    const getBooleanValue = jest.fn().mockImplementation(() => {
      throw new Error('boom');
    });

    jest.spyOn(OpenFeature, 'getClient').mockReturnValue({
      getBooleanValue,
    } as unknown as ReturnType<typeof OpenFeature.getClient>);

    const { config } = await import('../config');

    expect(config.featureToggles.useSessionStorageForRedirection).toBe(true);
    expect(getBooleanValue).toHaveBeenCalledWith('useSessionStorageForRedirection', true);
  });
});
