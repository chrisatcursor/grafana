import { dateTimeFormat } from '@grafana/data';
import { t } from '@grafana/i18n';
import { Text } from '@grafana/ui';

import { QuickNote } from './types';

interface QuickNotesMetaProps {
  note: QuickNote;
}

export function QuickNotesMeta({ note }: QuickNotesMetaProps) {
  if (note.updatedAt == null) {
    return null;
  }

  return (
    <Text variant="bodySmall" color="secondary" data-testid="quick-notes-meta">
      {t('dashboard.quick-notes.meta.updated', 'Last updated {{time}}', {
        time: dateTimeFormat(note.updatedAt),
      })}
    </Text>
  );
}
