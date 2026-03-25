/**
 * calculator.test.tsx — 5 tests for CalculatorApp.
 *
 * Correction applied (#4): all user interactions use async userEvent.setup().
 * We test via the rendered component (not extracted helpers) so the tests
 * reflect real user behaviour through the UI.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalculatorApp } from '../apps/CalculatorApp';

describe('CalculatorApp', () => {
  it('shows "0" as the initial display value', () => {
    render(<CalculatorApp />);
    expect(screen.getByTestId('display')).toHaveTextContent(/^0$/);
  });

  it('updates the display when digit buttons are clicked', async () => {
    const user = userEvent.setup();
    render(<CalculatorApp />);

    await user.click(screen.getByRole('button', { name: '5' }));
    expect(screen.getByTestId('display')).toHaveTextContent(/^5$/);

    await user.click(screen.getByRole('button', { name: '3' }));
    expect(screen.getByTestId('display')).toHaveTextContent(/^53$/);
  });

  it('resets display to "0" after pressing an operator', async () => {
    const user = userEvent.setup();
    render(<CalculatorApp />);

    await user.click(screen.getByRole('button', { name: '7' }));
    await user.click(screen.getByRole('button', { name: '+' }));
    expect(screen.getByTestId('display')).toHaveTextContent(/^0$/);
  });

  it('evaluates the equation and shows the result when = is pressed', async () => {
    const user = userEvent.setup();
    render(<CalculatorApp />);

    await user.click(screen.getByRole('button', { name: '8' }));
    await user.click(screen.getByRole('button', { name: '+' }));
    await user.click(screen.getByRole('button', { name: '4' }));
    await user.click(screen.getByRole('button', { name: '=' }));

    expect(screen.getByTestId('display')).toHaveTextContent(/^12$/);
  });

  it('clears display and equation back to "0" when AC is pressed', async () => {
    const user = userEvent.setup();
    render(<CalculatorApp />);

    await user.click(screen.getByRole('button', { name: '9' }));
    await user.click(screen.getByRole('button', { name: 'AC' }));
    expect(screen.getByTestId('display')).toHaveTextContent(/^0$/);
  });
});
