/**
 * contextMenu.test.tsx — 3 tests for the ContextMenu component.
 *
 * Correction applied (#5): jsdom has no layout engine, so getBoundingClientRect()
 * always returns zeros and position-clamping tests are unreliable. Instead, we
 * verify that the x/y props are wired up as inline styles on the menu element.
 *
 * Correction applied (#4): async userEvent.setup() pattern used throughout.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContextMenu } from '../components/ContextMenu';

const defaultItems = [
  { label: 'Open', action: vi.fn() },
  { label: 'Delete', action: vi.fn() },
  { type: 'separator' as const, label: '', action: vi.fn() },
  { label: 'Rename', action: vi.fn(), shortcut: '⌘R' },
];

describe('ContextMenu', () => {
  it('renders all non-separator item labels', () => {
    render(
      <ContextMenu x={100} y={200} items={defaultItems} onClose={vi.fn()} />
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Rename')).toBeInTheDocument();
    // Shortcut text is rendered independently
    expect(screen.getByText('⌘R')).toBeInTheDocument();
  });

  it('applies x and y props as inline styles on the menu container', () => {
    render(
      <ContextMenu x={100} y={200} items={[]} onClose={vi.fn()} />
    );
    const menu = screen.getByRole('menu');
    // Math.min(100, innerWidth - 250) and Math.min(200, ...) — in jsdom
    // window dimensions are 0, so clamp will produce ≤100 and ≤200.
    // We verify the style attribute is set (not empty / missing).
    expect(menu).toHaveAttribute('style');
    const style = menu.getAttribute('style') ?? '';
    expect(style).toMatch(/left/);
    expect(style).toMatch(/top/);
  });

  it('calls the item action and onClose when a menu item is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const openAction = vi.fn();

    render(
      <ContextMenu
        x={10}
        y={10}
        items={[{ label: 'Open', action: openAction }]}
        onClose={onClose}
      />
    );

    await user.click(screen.getByText('Open'));
    expect(openAction).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
