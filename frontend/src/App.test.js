import { render, screen } from '@testing-library/react';
import App from './App';

test('renders department title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Applied Business Research Department/i);
  expect(titleElement).toBeInTheDocument();
});
