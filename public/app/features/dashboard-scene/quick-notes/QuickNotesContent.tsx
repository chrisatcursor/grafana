import { useEffect, useState } from 'react';

import { Trans, t } from '@grafana/i18n';
import { Alert, Spinner, Stack, Text } from '@grafana/ui';

import { QuickNotesEditor } from './QuickNotesEditor';
import { QuickNotesEmptyState } from './QuickNotesEmptyState';
import { QuickNotesMeta } from './QuickNotesMeta';
import { QuickNote } from './types';

export interface QuickNotesContentProps {
  dashboardUid: string;
  dashboardTitle: string;
  canEdit: boolean;
  note: QuickNote | undefined;
  isLoading: boolean;
  isSaving: boolean;
  error: string | undefined;
  onSave: (body: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function QuickNotesContent({
  dashboardTitle,
  canEdit,
  note,
  isLoading,
  isSaving,
  error,
  onSave,
  onDelete,
}: QuickNotesContentProps) {
  const [body, setBody] = useState(note?.body ?? '');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setBody(note?.body ?? '');
    setIsDirty(false);
  }, [note?.body, note?.uid]);

  const handleBodyChange = (value: string) => {
    setBody(value);
    setIsDirty(value !== (note?.body ?? ''));
  };

  const handleSave = async () => {
    const trimmed = body.trim();
    if (!trimmed) {
      return;
    }
    await onSave(trimmed);
    setIsDirty(false);
  };

  if (isLoading) {
    return (
      <Stack direction="column" alignItems="center" justifyContent="center" gap={2} height="100%">
        <Spinner />
        <Text color="secondary">
          <Trans i18nKey="dashboard.quick-notes.loading">Loading notes...</Trans>
        </Text>
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap={2} data-testid="quick-notes-drawer">
      {!canEdit && (
        <Alert
          severity="info"
          title={t('dashboard.quick-notes.read-only.title', 'Read only')}
          data-testid="quick-notes-read-only-alert"
        >
          <Trans i18nKey="dashboard.quick-notes.read-only.body">
            You can view notes on this dashboard but do not have permission to edit them.
          </Trans>
        </Alert>
      )}

      {error && (
        <Alert severity="error" title={t('dashboard.quick-notes.error.title', 'Something went wrong')}>
          {error}
        </Alert>
      )}

      {!note && <QuickNotesEmptyState canEdit={canEdit} />}

      <QuickNotesEditor
        dashboardTitle={dashboardTitle}
        body={body}
        canEdit={canEdit}
        isSaving={isSaving}
        isDirty={isDirty}
        hasExistingNote={Boolean(note)}
        onBodyChange={handleBodyChange}
        onSave={handleSave}
        onDelete={onDelete}
      />

      {note && <QuickNotesMeta note={note} />}
    </Stack>
  );
}
