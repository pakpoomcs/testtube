import { render } from '@testing-library/react';
import App from './App';

// Smoke test: app renders without crashing
test('renders without crashing', () => {
  render(<App />);
  expect(document.body).toBeTruthy();
});
