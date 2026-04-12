import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UpdateStatus from '../UpdateStatus';

describe('UpdateStatus component', () => {
  const logistics = {
    _id: 'log1',
    orderId: 'order123',
    status: 'Scheduled',
    customerPhone: '+123456789'
  };

  it('renders when open and shows current status', () => {
    render(<UpdateStatus logistics={logistics} isOpen={true} onClose={() => {}} onSubmit={() => {}} />);
    expect(screen.getByText(/Update Delivery Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Current Status/i)).toBeInTheDocument();
    const scheduledMatches = screen.getAllByText(/Scheduled/);
    expect(scheduledMatches.length).toBeGreaterThan(0);
  });

  it('disables submit when new status equals current status', () => {
    render(<UpdateStatus logistics={logistics} isOpen={true} onClose={() => {}} onSubmit={() => {}} />);
    const submit = screen.getByRole('button', { name: /Update Status/i });
    expect(submit).toBeDisabled();
  });

  it('submits status change and calls onSubmit with notify flag', async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    const onClose = jest.fn();

    render(<UpdateStatus logistics={logistics} isOpen={true} onClose={onClose} onSubmit={onSubmit} />);

    // Select a different status
    const pickedUpRadio = screen.getByRole('radio', { name: /Picked Up/i });
    userEvent.click(pickedUpRadio);

    const submit = screen.getByRole('button', { name: /Update Status/i });
    expect(submit).not.toBeDisabled();

    // Click submit -> shows confirmation modal
    userEvent.click(submit);

    // Confirm & Notify button appears
    const confirm = await screen.findByRole('button', { name: /Confirm & Notify/i });
    userEvent.click(confirm);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('log1', 'Picked Up', true));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
