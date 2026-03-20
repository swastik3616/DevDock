/**
 * calculator.test.tsx — 5 tests for CalculatorApp.
 *
 * Correction applied (#4): all user interactions use async userEvent.setup().
 * We test via the rendered component (not extracted helpers) so the tests
 * reflect real user behaviour through the UI.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalculatorApp } from '../apps/CalculatorApp';

describe('CalculatorApp', () => {
  it('shows "0" as the initial display value', () => {
    render(<CalculatorApp />);
    // The large display text — the only element with font-light text-4xl
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('updates the display when digit buttons are clicked', async () => {
    const user = userEvent.setup();
    render(<CalculatorApp />);

    await user.click(screen.getByText('5'));
    expect(screen.getByText('5')).toBeInTheDocument();

    await user.click(screen.getByText('3'));
    expect(screen.getByText('53')).toBeInTheDocument();
  });

  it('resets display to "0" after pressing an operator', async () => {
    const user = userEvent.setup();
    render(<CalculatorApp />);

    await user.click(screen.getByText('7'));
    await user.click(screen.getByText('+'));
    // After operator the display resets to '0' and equation is stored
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('evaluates the equation and shows the result when = is pressed', async () => {
    const user = userEvent.setup();
    render(<CalculatorApp />);

    await user.click(screen.getByText('8'));
    await user.click(screen.getByText('+'));
    await user.click(screen.getByText('4'));
    await user.click(screen.getByText('='));

    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('clears display and equation back to "0" when AC is pressed', async () => {
    const user = userEvent.setup();
    render(<CalculatorApp />);

    await user.click(screen.getByText('9'));
    await user.click(screen.getByText('AC'));
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
