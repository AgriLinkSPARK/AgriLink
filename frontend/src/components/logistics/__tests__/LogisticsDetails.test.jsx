import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogisticsDetails from '../LogisticsDetails';

describe('LogisticsDetails component', () => {
  const logistics = {
    _id: 'log1',
    orderId: 'order123',
    status: 'In Transit',
    createdAt: new Date().toISOString(),
    customerName: 'Alice',
    customerPhone: '+111',
    deliveryPartner: 'FastExpress',
    pickupLocation: 'Store A',
    deliveryLocation: 'Customer Address',
    notes: 'Handle with care',
    notifications: []
  };

  it('renders details and buttons', () => {
    const onUpdateStatus = jest.fn();
    const onClose = jest.fn();

    render(
      <LogisticsDetails
        logistics={logistics}
        isOpen={true}
        onClose={onClose}
        onUpdateStatus={onUpdateStatus}
        onSendNotification={() => {}}
      />
    );

    expect(screen.getByText(/Logistics Details/i)).toBeInTheDocument();
    const statusMatches = screen.getAllByText(/In Transit/i);
    expect(statusMatches.length).toBeGreaterThan(0);
    expect(screen.getByText(/Customer Info/i)).toBeInTheDocument();

    const updateBtn = screen.getByRole('button', { name: /Update Status/i });
    userEvent.click(updateBtn);
    expect(onUpdateStatus).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByRole('button', { name: /Close/i });
    userEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
