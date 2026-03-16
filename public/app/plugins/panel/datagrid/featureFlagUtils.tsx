import { config } from '@grafana/runtime';

export const isDatagridEnabled = () => {
  return config.isFeatureEnabled('enableDatagridEditing');
};
