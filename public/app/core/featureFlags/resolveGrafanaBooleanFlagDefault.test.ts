import { config } from '@grafana/runtime';

import { resolveGrafanaBooleanFlagDefault } from './resolveGrafanaBooleanFlagDefault';

describe('resolveGrafanaBooleanFlagDefault', () => {
  const originalToggles = { ...config.featureToggles };

  afterEach(() => {
    config.featureToggles = { ...originalToggles };
  });

  it('prefers boot snapshot over explicit default when boot defines the flag', () => {
    config.featureToggles.teamFolders = true;

    expect(resolveGrafanaBooleanFlagDefault('teamFolders', false)).toBe(true);
  });

  it('uses explicit default when boot does not define the flag', () => {
    delete config.featureToggles.teamFolders;

    expect(resolveGrafanaBooleanFlagDefault('teamFolders', true)).toBe(true);
    expect(resolveGrafanaBooleanFlagDefault('teamFolders', false)).toBe(false);
  });

  it('defaults to false when boot and explicit default are absent', () => {
    delete config.featureToggles.teamFolders;

    expect(resolveGrafanaBooleanFlagDefault('teamFolders')).toBe(false);
  });
});
