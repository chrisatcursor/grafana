import { Trans, t } from '@grafana/i18n';
import { Alert, Stack, Text } from '@grafana/ui';

interface QuickNotesEmptyStateProps {
  canEdit: boolean;
}

/**
 * Shown when there is no persisted note yet.
 * For editors, this is informational only — the TextArea remains the primary input.
 */
export function QuickNotesEmptyState({ canEdit }: QuickNotesEmptyStateProps) {
  if (!canEdit) {
    return (
      <Alert
        severity="info"
        title={t('dashboard.quick-notes.empty.title', 'No notes')}
        data-testid="quick-notes-empty-state"
      >
        <Trans i18nKey="dashboard.quick-notes.empty.body-readonly">There are no quick notes for this dashboard.</Trans>
      </Alert>
    );
  }

  return (
    <Stack direction="column" gap={0.5} data-testid="quick-notes-empty-state">
      <Text color="secondary" variant="bodySmall">
        <Trans i18nKey="dashboard.quick-notes.empty.body-editable">
          No notes yet. Capture context, runbooks, or reminders below.
        </Trans>
      </Text>
    </Stack>
  );
}
