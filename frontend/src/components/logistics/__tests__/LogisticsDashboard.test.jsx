import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogisticsDashboard from '../LogisticsDashboard';

describe('LogisticsDashboard component', () => {
  const data = { logistics: [
    { _id: 'l1', orderId: 'o1', status: 'Scheduled', customerName: 'A', createdAt: new Date().toISOString() },
    { _id: 'l2', orderId: 'o2', status: 'Delivered', customerName: 'B', createdAt: new Date().toISOString() }
  ] };

  const orders = [{ _id: 'o3', customer: { name: 'C', phone: '+2' }, totalPrice: 100, status: 'Pending', paymentStatus: 'Paid', createdAt: new Date().toISOString() }];

  it('renders KPI cards and switches tabs', () => {
    const onCreateLogistics = jest.fn();
    const onRefreshOrders = jest.fn();

    render(
      <LogisticsDashboard
        data={data}
        loading={false}
        error={null}
        onViewDetails={() => {}}
        onCreateLogistics={onCreateLogistics}
        onUpdateStatus={() => {}}
        onDeleteLogistics={() => {}}
        pagination={null}
        onPageChange={() => {}}
        orders={orders}
        onRefreshOrders={onRefreshOrders}
      />
    );

    expect(screen.getByText(/Total Deliveries/i)).toBeInTheDocument();
    // Orders tab is active by default
    const scheduleBtn = screen.getByRole('button', { name: /Schedule Delivery/i });
    userEvent.click(scheduleBtn);
    expect(onCreateLogistics).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', async () => {
    render(
      <LogisticsDashboard
        data={{ logistics: [] }}
        loading={true}
        error={null}
        onViewDetails={() => {}}
        onCreateLogistics={() => {}}
        onUpdateStatus={() => {}}
        onDeleteLogistics={() => {}}
        pagination={null}
        onPageChange={() => {}}
      />
    );

    // The component defaults to the "orders" tab; switch to the logistics tab
    const activeTabBtn = screen.getByRole('button', { name: /Active Deliveries/i });
    await userEvent.click(activeTabBtn);

    expect(await screen.findByText(/Loading logistics data.../i)).toBeInTheDocument();
  });
});
