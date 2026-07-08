import { useCallback, useEffect, useState } from 'react';

import { createQuickNote, deleteQuickNote, fetchQuickNotes, updateQuickNote } from './api';
import { QuickNote } from './types';

interface UseQuickNotesOptions {
  dashboardUid: string;
  enabled?: boolean;
}

interface UseQuickNotesResult {
  note: QuickNote | undefined;
  isLoading: boolean;
  isSaving: boolean;
  error: string | undefined;
  saveNote: (body: string, title?: string) => Promise<void>;
  deleteNote: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useQuickNotes({ dashboardUid, enabled = true }: UseQuickNotesOptions): UseQuickNotesResult {
  const [note, setNote] = useState<QuickNote | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    if (!enabled || !dashboardUid) {
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const notes = await fetchQuickNotes(dashboardUid);
      setNote(notes[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
      setNote(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardUid, enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveNote = useCallback(
    async (body: string, title?: string) => {
      if (!dashboardUid) {
        return;
      }

      setIsSaving(true);
      setError(undefined);

      try {
        const saved = note
          ? await updateQuickNote(dashboardUid, note.uid, { body, title })
          : await createQuickNote(dashboardUid, { body, title });
        setNote(saved);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save note');
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [dashboardUid, note]
  );

  const deleteNoteHandler = useCallback(async () => {
    if (!dashboardUid || !note) {
      return;
    }

    setIsSaving(true);
    setError(undefined);

    try {
      await deleteQuickNote(dashboardUid, note.uid);
      setNote(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [dashboardUid, note]);

  return {
    note,
    isLoading,
    isSaving,
    error,
    saveNote,
    deleteNote: deleteNoteHandler,
    refresh,
  };
}
