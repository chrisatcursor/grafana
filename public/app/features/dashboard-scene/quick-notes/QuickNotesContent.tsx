import { css } from '@emotion/css';
import { useEffect, useState } from 'react';

import { GrafanaTheme2, dateTimeFormat } from '@grafana/data';
import { Trans, t } from '@grafana/i18n';
import { Alert, Button, Field, Spinner, Stack, Text, TextArea, useStyles2 } from '@grafana/ui';

import { QUICK_NOTES_MAX_BODY_LENGTH } from './constants';
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
  const styles = useStyles2(getStyles);
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

  const metaText =
    note?.updatedAt != null
      ? t('dashboard.quick-notes.meta.updated', 'Last updated {{time}}', {
          time: dateTimeFormat(note.updatedAt),
        })
      : undefined;

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

      <Field
        label={t('dashboard.quick-notes.field.label', 'Note for {{dashboardTitle}}', { dashboardTitle })}
        description={
          canEdit
            ? t('dashboard.quick-notes.field.description', 'Add context, runbooks, or reminders for this dashboard.')
            : undefined
        }
      >
        <TextArea
          data-testid="quick-notes-textarea"
          value={body}
          onChange={(event) => handleBodyChange(event.currentTarget.value)}
          rows={12}
          disabled={!canEdit || isSaving}
          maxLength={QUICK_NOTES_MAX_BODY_LENGTH}
          placeholder={
            canEdit
              ? t('dashboard.quick-notes.placeholder', 'Write a quick note...')
              : t('dashboard.quick-notes.empty-readonly', 'No notes for this dashboard.')
          }
        />
      </Field>

      {metaText && (
        <Text variant="bodySmall" color="secondary" className={styles.meta}>
          {metaText}
        </Text>
      )}

      {canEdit && (
        <Stack direction="row" gap={1} justifyContent="flex-end" className={styles.actions}>
          {note && (
            <Button
              variant="destructive"
              fill="outline"
              disabled={isSaving}
              data-testid="quick-notes-delete"
              onClick={() => onDelete()}
            >
              <Trans i18nKey="dashboard.quick-notes.delete">Delete</Trans>
            </Button>
          )}
          <Button
            variant="primary"
            disabled={isSaving || !body.trim() || (!isDirty && Boolean(note))}
            data-testid="quick-notes-save"
            onClick={handleSave}
          >
            {isSaving ? (
              <Trans i18nKey="dashboard.quick-notes.saving">Saving...</Trans>
            ) : (
              <Trans i18nKey="dashboard.quick-notes.save">Save</Trans>
            )}
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  meta: css({
    marginTop: theme.spacing(-1),
  }),
  actions: css({
    borderTop: `1px solid ${theme.colors.border.weak}`,
    paddingTop: theme.spacing(2),
    marginTop: theme.spacing(1),
  }),
});
