import { css } from '@emotion/css';
import { useState } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Trans, t } from '@grafana/i18n';
import { Button, ConfirmModal, Field, Stack, TextArea, useStyles2 } from '@grafana/ui';

import { QUICK_NOTES_MAX_BODY_LENGTH } from './constants';

export interface QuickNotesEditorProps {
  dashboardTitle: string;
  body: string;
  canEdit: boolean;
  isSaving: boolean;
  isDirty: boolean;
  hasExistingNote: boolean;
  onBodyChange: (value: string) => void;
  onSave: () => void;
  onDelete: () => void;
}

export function QuickNotesEditor({
  dashboardTitle,
  body,
  canEdit,
  isSaving,
  isDirty,
  hasExistingNote,
  onBodyChange,
  onSave,
  onDelete,
}: QuickNotesEditorProps) {
  const styles = useStyles2(getStyles);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
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
          onChange={(event) => onBodyChange(event.currentTarget.value)}
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

      {canEdit && (
        <Stack direction="row" gap={1} justifyContent="flex-end" className={styles.actions}>
          {hasExistingNote && (
            <Button
              variant="destructive"
              fill="outline"
              disabled={isSaving}
              data-testid="quick-notes-delete"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trans i18nKey="dashboard.quick-notes.delete">Delete</Trans>
            </Button>
          )}
          <Button
            variant="primary"
            disabled={isSaving || !body.trim() || (!isDirty && hasExistingNote)}
            data-testid="quick-notes-save"
            onClick={onSave}
          >
            {isSaving ? (
              <Trans i18nKey="dashboard.quick-notes.saving">Saving...</Trans>
            ) : (
              <Trans i18nKey="dashboard.quick-notes.save">Save</Trans>
            )}
          </Button>
        </Stack>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        title={t('dashboard.quick-notes.delete-confirm.title', 'Delete note')}
        body={t('dashboard.quick-notes.delete-confirm.body', 'Are you sure you want to delete this quick note?')}
        confirmText={t('dashboard.quick-notes.delete-confirm.confirm', 'Delete')}
        onConfirm={() => {
          setShowDeleteModal(false);
          onDelete();
        }}
        onDismiss={() => setShowDeleteModal(false)}
      />
    </>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  actions: css({
    borderTop: `1px solid ${theme.colors.border.weak}`,
    paddingTop: theme.spacing(2),
    marginTop: theme.spacing(1),
  }),
});
