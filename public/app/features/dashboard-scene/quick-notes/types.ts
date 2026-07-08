export interface QuickNote {
  uid: string;
  dashboardUid: string;
  title?: string;
  body: string;
  createdBy: number;
  updatedBy: number;
  createdAt: number;
  updatedAt: number;
  createdByName?: string;
  updatedByName?: string;
}

export interface QuickNoteListResponse {
  notes: QuickNote[];
}

export interface QuickNoteResponse {
  note: QuickNote;
}

export interface CreateQuickNotePayload {
  title?: string;
  body: string;
}

export interface UpdateQuickNotePayload {
  title?: string;
  body?: string;
}
