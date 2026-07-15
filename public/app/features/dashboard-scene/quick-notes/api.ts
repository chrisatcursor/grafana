import { getBackendSrv } from '@grafana/runtime';

import { QUICK_NOTES_API_BASE } from './constants';
import {
  CreateQuickNotePayload,
  QuickNote,
  QuickNoteListResponse,
  QuickNoteResponse,
  UpdateQuickNotePayload,
} from './types';

function getNotesUrl(dashboardUid: string) {
  return `${QUICK_NOTES_API_BASE}/${dashboardUid}/quick-notes`;
}

function getNoteUrl(dashboardUid: string, noteUid: string) {
  return `${getNotesUrl(dashboardUid)}/${noteUid}`;
}

export async function fetchQuickNotes(dashboardUid: string): Promise<QuickNote[]> {
  const response = await getBackendSrv().get<QuickNoteListResponse>(getNotesUrl(dashboardUid));
  return response.notes ?? [];
}

export async function createQuickNote(dashboardUid: string, payload: CreateQuickNotePayload): Promise<QuickNote> {
  const response = await getBackendSrv().post<QuickNoteResponse>(getNotesUrl(dashboardUid), payload);
  return response.note;
}

export async function updateQuickNote(
  dashboardUid: string,
  noteUid: string,
  payload: UpdateQuickNotePayload
): Promise<QuickNote> {
  const response = await getBackendSrv().patch<QuickNoteResponse>(getNoteUrl(dashboardUid, noteUid), payload);
  return response.note;
}

export async function deleteQuickNote(dashboardUid: string, noteUid: string): Promise<void> {
  await getBackendSrv().delete(getNoteUrl(dashboardUid, noteUid));
}
