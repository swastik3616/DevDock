import { create } from 'zustand';

interface Window {
    id: string;
    title: string;
    icon: string;
    isOpen: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
}

interface AppState {
    windows: Window[];
    activeWindowId: string | null;
    currentUser: string | null;
    isSiriOpen: boolean;
    isAsleep: boolean;
    isShuttingDown: boolean;
    wallpaper: string;
    theme: 'light' | 'dark';
    openApp: (id: string, title: string, icon: string) => void;
    closeApp: (id: string) => void;
    minimizeApp: (id: string) => void;
    focusApp: (id: string) => void;
    toggleMaximize: (id: string) => void;
    toggleSiri: () => void;
    toggleSleep: () => void;
    setAuth: (user: string | null) => void;
    setWallpaper: (url: string) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    shutdown: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    windows: [],
    activeWindowId: null,
    currentUser: null,
    isSiriOpen: false,
    isAsleep: false,
    isShuttingDown: false,
    wallpaper: 'https://images.unsplash.com/photo-1611083360739-bdad6e0eb1fa?q=80&w=2600&auto=format&fit=crop',
    theme: 'light',
    setAuth: (user) => set({ currentUser: user }),
    toggleSleep: () => set((state) => ({ isAsleep: !state.isAsleep })),
    setWallpaper: (url) => set({ wallpaper: url }),
    setTheme: (theme) => set({ theme }),
    shutdown: () => set({ isShuttingDown: true }),
    openApp: (id, title, icon) => set((state) => {
        const existing = state.windows.find(w => w.id === id);
        if (existing) {
            return {
                activeWindowId: id,
                windows: state.windows.map(w => w.id === id ? { ...w, isOpen: true, isMinimized: false } : w)
            };
        }
        const newWindow: Window = {
            id, title, icon,
            isOpen: true,
            isMinimized: false,
            isMaximized: false,
            zIndex: state.windows.length + 10
        };
        return {
            windows: [...state.windows, newWindow],
            activeWindowId: id
        };
    }),
    closeApp: (id) => set((state) => ({
        windows: state.windows.filter(w => w.id !== id),
        activeWindowId: state.activeWindowId === id ? null : state.activeWindowId
    })),
    minimizeApp: (id) => set((state) => ({
        windows: state.windows.map(w => w.id === id ? { ...w, isMinimized: true } : w),
        activeWindowId: state.activeWindowId === id ? null : state.activeWindowId
    })),
    focusApp: (id) => set((state) => ({
        activeWindowId: id,
        windows: state.windows.map(w => ({
            ...w,
            zIndex: w.id === id ? Math.max(...state.windows.map(w => w.zIndex)) + 1 : w.zIndex
        }))
    })),
    toggleMaximize: (id: string) => set((state) => ({
        windows: state.windows.map(w => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    })),
    toggleSiri: () => set((state) => ({ isSiriOpen: !state.isSiriOpen })),
}));
