# AIBoard Testing Guide

This document provides instructions for running tests in the AIBoard project.

## Test Types

The project includes three types of tests:

1. **Unit Tests**: Test individual functions and utilities
2. **Component Tests**: Test React components in isolation
3. **End-to-End (E2E) Tests**: Test complete user flows in a browser environment

## Running Tests

### Unit and Component Tests

To run unit and component tests:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### End-to-End Tests

To run E2E tests:

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in a specific browser
npx playwright test --project=chromium

# Run E2E tests in UI mode
npx playwright test --ui
```

## Test Structure

- `__tests__/`: Contains unit and component tests
  - `__tests__/components/`: Tests for React components
  - `__tests__/utils/`: Tests for utility functions
  - `__tests__/screens/`: Tests for screen components

- `__e2e__/`: Contains end-to-end tests
  - `__e2e__/fixtures/`: Test data for E2E tests

## Writing Tests

### Unit Tests

Unit tests should focus on testing individual functions and utilities. Example:

```typescript
import { someFunction } from '../../utils/someModule';

describe('someFunction', () => {
  it('should return expected result', () => {
    const result = someFunction(input);
    expect(result).toBe(expectedOutput);
  });
});
```

### Component Tests

Component tests should focus on testing component rendering and interactions. Example:

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import MyComponent from '../../components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Some Text')).toBeTruthy();
  });
  
  it('handles user interaction', () => {
    render(<MyComponent />);
    fireEvent.press(screen.getByText('Button Text'));
    expect(screen.getByText('Result Text')).toBeTruthy();
  });
});
```

### E2E Tests

E2E tests should focus on testing complete user flows. Example:

```typescript
import { test, expect } from '@playwright/test';

test('user can login and access dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## Mocking

The project uses Jest's mocking capabilities to mock external dependencies:

- API calls are mocked to avoid actual network requests
- Supabase client is mocked to simulate authentication and database operations
- File system operations are mocked to simulate file uploads
- PDF processing is mocked to avoid actual PDF processing

## Coverage

Test coverage reports are generated when running `npm run test:coverage`. The report shows:

- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

Aim for at least 80% coverage for critical code paths.
