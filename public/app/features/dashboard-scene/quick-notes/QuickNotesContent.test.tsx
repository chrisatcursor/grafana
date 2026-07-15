import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { QuickNotesContent } from './QuickNotesContent';
import { QuickNote } from './types';

const existingNote: QuickNote = {
  uid: 'note-1',
  dashboardUid: 'test-uid',
  body: 'Existing runbook',
  createdBy: 1,
  updatedBy: 1,
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_100_000,
};

describe('QuickNotesContent', () => {
  const defaultProps = {
    dashboardUid: 'test-uid',
    dashboardTitle: 'Test Dashboard',
    canEdit: true,
    note: undefined as QuickNote | undefined,
    isLoading: false,
    isSaving: false,
    error: undefined as string | undefined,
    onSave: jest.fn().mockResolvedValue(undefined),
    onDelete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders textarea and save button when editable', () => {
    render(<QuickNotesContent {...defaultProps} />);

    expect(screen.getByTestId('quick-notes-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('quick-notes-empty-state')).toBeInTheDocument();
    expect(screen.getByTestId('quick-notes-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('quick-notes-save')).toBeInTheDocument();
    expect(screen.queryByTestId('quick-notes-delete')).not.toBeInTheDocument();
  });

  it('shows read-only alert when user cannot edit', () => {
    render(<QuickNotesContent {...defaultProps} canEdit={false} />);

    expect(screen.getByTestId('quick-notes-read-only-alert')).toBeInTheDocument();
    expect(screen.getByTestId('quick-notes-textarea')).toBeDisabled();
  });

  it('calls onSave when save is clicked with content', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<QuickNotesContent {...defaultProps} onSave={onSave} />);

    await userEvent.type(screen.getByTestId('quick-notes-textarea'), 'Runbook link');
    await userEvent.click(screen.getByTestId('quick-notes-save'));

    expect(onSave).toHaveBeenCalledWith('Runbook link');
  });

  it('shows delete button for existing notes and confirms before deleting', async () => {
    const onDelete = jest.fn().mockResolvedValue(undefined);
    render(<QuickNotesContent {...defaultProps} note={existingNote} onDelete={onDelete} />);

    expect(screen.getByTestId('quick-notes-delete')).toBeInTheDocument();
    expect(screen.getByTestId('quick-notes-meta')).toBeInTheDocument();
    expect(screen.queryByTestId('quick-notes-empty-state')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('quick-notes-delete'));
    expect(screen.getByText('Delete note')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalled();
  });

  it('shows spinner while loading', () => {
    render(<QuickNotesContent {...defaultProps} isLoading />);

    expect(screen.getByText('Loading notes...')).toBeInTheDocument();
    expect(screen.queryByTestId('quick-notes-textarea')).not.toBeInTheDocument();
  });
});
