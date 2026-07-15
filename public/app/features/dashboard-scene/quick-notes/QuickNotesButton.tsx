import { t } from '@grafana/i18n';
import { ToolbarButton } from '@grafana/ui';

import { ToolbarActionProps } from '../scene/new-toolbar/types';

import { QUICK_NOTES_ENABLED } from './constants';

export const QuickNotesButton = ({ dashboard }: ToolbarActionProps) => {
  const { uid } = dashboard.useState();

  if (!QUICK_NOTES_ENABLED || !uid) {
    return null;
  }

  return (
    <ToolbarButton
      tooltip={t('dashboard.quick-notes.button.tooltip', 'Quick notes')}
      aria-label={t('dashboard.quick-notes.button.aria-label', 'Open quick notes')}
      icon="file-alt"
      variant="canvas"
      data-testid="quick-notes-button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        dashboard.openQuickNotesDrawer();
      }}
    />
  );
};
