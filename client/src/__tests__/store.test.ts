/**
 * store.test.ts — 7 tests for the useAppStore Zustand store.
 *
 * Key pattern (Correction #3): beforeEach resets the store to its initial
 * state via getInitialState() so no test bleeds into the next.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';

beforeEach(() => {
  // Reset store to initial values between every test to prevent state bleed
  useAppStore.setState(useAppStore.getInitialState());
});

describe('useAppStore initial state', () => {
  it('starts with an empty windows array and null activeWindowId', () => {
    const { windows, activeWindowId } = useAppStore.getState();
    expect(windows).toEqual([]);
    expect(activeWindowId).toBeNull();
  });

  it('starts with null currentUser and light theme', () => {
    const { currentUser, theme } = useAppStore.getState();
    expect(currentUser).toBeNull();
    expect(theme).toBe('light');
  });
});

describe('openApp', () => {
  it('adds a new window and sets it as active', () => {
    useAppStore.getState().openApp('finder', 'Finder', '📁');
    const { windows, activeWindowId } = useAppStore.getState();
    expect(windows).toHaveLength(1);
    expect(windows[0].id).toBe('finder');
    expect(windows[0].isOpen).toBe(true);
    expect(activeWindowId).toBe('finder');
  });

  it('does not duplicate a window — instead un-minimizes the existing one', () => {
    useAppStore.getState().openApp('finder', 'Finder', '📁');
    useAppStore.getState().minimizeApp('finder');
    useAppStore.getState().openApp('finder', 'Finder', '📁'); // second open
    const { windows } = useAppStore.getState();
    expect(windows).toHaveLength(1);
    expect(windows[0].isMinimized).toBe(false);
  });
});

describe('closeApp', () => {
  it('removes the window from the list and clears activeWindowId', () => {
    useAppStore.getState().openApp('notes', 'Notes', '📝');
    useAppStore.getState().closeApp('notes');
    const { windows, activeWindowId } = useAppStore.getState();
    expect(windows).toHaveLength(0);
    expect(activeWindowId).toBeNull();
  });
});

describe('minimizeApp', () => {
  it('marks the window as minimized and clears activeWindowId', () => {
    useAppStore.getState().openApp('notes', 'Notes', '📝');
    useAppStore.getState().minimizeApp('notes');
    const { windows, activeWindowId } = useAppStore.getState();
    expect(windows[0].isMinimized).toBe(true);
    expect(activeWindowId).toBeNull();
  });
});

describe('toggleMaximize', () => {
  it('toggles isMaximized on the target window', () => {
    useAppStore.getState().openApp('calc', 'Calculator', '🧮');
    useAppStore.getState().toggleMaximize('calc');
    expect(useAppStore.getState().windows[0].isMaximized).toBe(true);
    useAppStore.getState().toggleMaximize('calc');
    expect(useAppStore.getState().windows[0].isMaximized).toBe(false);
  });
});

describe('setAuth and setTheme', () => {
  it('setAuth updates currentUser', () => {
    useAppStore.getState().setAuth('alice');
    expect(useAppStore.getState().currentUser).toBe('alice');
    useAppStore.getState().setAuth(null);
    expect(useAppStore.getState().currentUser).toBeNull();
  });

  it('setTheme switches between light and dark', () => {
    useAppStore.getState().setTheme('dark');
    expect(useAppStore.getState().theme).toBe('dark');
    useAppStore.getState().setTheme('light');
    expect(useAppStore.getState().theme).toBe('light');
  });
});
