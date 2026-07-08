import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { QuickNotesContent } from './QuickNotesContent';

describe('QuickNotesContent', () => {
  const defaultProps = {
    dashboardUid: 'test-uid',
    dashboardTitle: 'Test Dashboard',
    canEdit: true,
    note: undefined,
    isLoading: false,
    isSaving: false,
    error: undefined,
    onSave: jest.fn().mockResolvedValue(undefined),
    onDelete: jest.fn().mockResolvedValue(undefined),
  };

  it('renders textarea and save button when editable', () => {
    render(<QuickNotesContent {...defaultProps} />);

    expect(screen.getByTestId('quick-notes-drawer')).toBeInTheDocument();
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
});
