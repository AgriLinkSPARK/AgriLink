import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home portal screen with all three portals', () => {
  render(<App />);
  expect(screen.getByText(/fresh harvests\. fair prices/i)).toBeInTheDocument();
  expect(screen.getByText(/shop as buyer/i)).toBeInTheDocument();
  expect(screen.getByText(/sell as farmer/i)).toBeInTheDocument();
  expect(screen.getByText(/admin access/i)).toBeInTheDocument();
});