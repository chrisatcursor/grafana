import { t } from '@grafana/i18n';
import { SceneComponentProps, SceneObjectBase, SceneObjectRef, SceneObjectState } from '@grafana/scenes';
import { Drawer } from '@grafana/ui';

import { DashboardScene } from '../scene/DashboardScene';

import { QuickNotesContent } from './QuickNotesContent';
import { useQuickNotes } from './useQuickNotes';

export interface QuickNotesDrawerState extends SceneObjectState {
  dashboardRef: SceneObjectRef<DashboardScene>;
}

export class QuickNotesDrawer extends SceneObjectBase<QuickNotesDrawerState> {
  public onClose = () => {
    this.state.dashboardRef.resolve().setState({ overlay: undefined });
  };

  static Component = QuickNotesDrawerComponent;
}

function QuickNotesDrawerComponent({ model }: SceneComponentProps<QuickNotesDrawer>) {
  const dashboard = model.state.dashboardRef.resolve();
  const { uid, title, meta } = dashboard.useState();

  const { note, isLoading, isSaving, error, saveNote, deleteNote } = useQuickNotes({
    dashboardUid: uid ?? '',
    enabled: Boolean(uid),
  });

  if (!uid) {
    return null;
  }

  const canEdit = Boolean(meta.canEdit);

  return (
    <Drawer
      title={t('dashboard.quick-notes.drawer.title', 'Quick notes')}
      subtitle={title}
      size="sm"
      onClose={model.onClose}
    >
      <QuickNotesContent
        dashboardUid={uid}
        dashboardTitle={title}
        canEdit={canEdit}
        note={note}
        isLoading={isLoading}
        isSaving={isSaving}
        error={error}
        onSave={(body) => saveNote(body)}
        onDelete={() => deleteNote()}
      />
    </Drawer>
  );
}
