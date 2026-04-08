import React, { useState } from 'react';
import { Dock } from './Dock';
import { MenuBar } from './MenuBar';
import { DesktopIcon } from './DesktopIcon';
import { FileText, Mail, Cpu, Monitor } from 'lucide-react';
import { ContextMenu } from './ContextMenu';
import { useAppStore } from '../store/useAppStore';
import { MusicWidget } from './MusicWidget';
import api from '../services/api';

export function Desktop({ children }: { children?: React.ReactNode }) {
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
    const { wallpaper, setWallpaper, openApp } = useAppStore();

    const wallpapers = [
        'https://images.unsplash.com/photo-1611083360739-bdad6e0eb1fa?q=80&w=2600&auto=format&fit=crop', // Big Sur
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2600&auto=format&fit=crop', // Dark Abstract
        'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2600&auto=format&fit=crop', // Mountain
        'https://images.unsplash.com/photo-1502657877623-f66bf489d236?q=80&w=2600&auto=format&fit=crop', // Forest
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2600&auto=format&fit=crop', // Peak
        'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2600&auto=format&fit=crop'  // Deep Forest
    ];

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleNewFolder = async () => {
        try {
            await api.post('/files', { name: 'New Desktop Folder', type: 'folder', size: '--' });
            window.dispatchEvent(new Event('refresh-files'));
        } catch (err) {
            console.error('Failed to create item', err);
        }
    };

    const desktopItems = [
        { label: 'New Folder', action: handleNewFolder },
        { label: 'Get Info', action: () => console.log('Info') },
        { type: 'separator' as const, label: '', action: () => { } },
        {
            label: 'Next Wallpaper', action: () => {
                const index = wallpapers.indexOf(wallpaper);
                setWallpaper(wallpapers[(index + 1) % wallpapers.length]);
            }
        },
        { label: 'Use Stacks', action: () => console.log('Stacks'), shortcut: '⌃⌘S' },
        { label: 'Sort By', action: () => console.log('Sort') },
        { label: 'Clean Up', action: () => console.log('Clean') },
        { type: 'separator' as const, label: '', action: () => { } },
        { label: 'Desktop Settings...', action: () => openApp('settings', 'System Settings', 'settings') },
    ];

    return (
        <div
            className="relative w-screen h-screen overflow-hidden bg-cover bg-center flex flex-col transition-all duration-1000"
            onContextMenu={handleContextMenu}
            style={{ backgroundImage: `url("${wallpaper}")` }}
        >
            <MenuBar />

            {/* Main Content Areas (Windows) */}
            <div className="relative flex-1 w-full pt-10 px-4 flex flex-col flex-wrap gap-4 content-end items-end">
                <DesktopIcon id="finder" title="Finder" icon={<Monitor size={32} />} />
                <DesktopIcon id="notes" title="Notes" icon={<FileText size={32} />} />
                <DesktopIcon id="mail" title="Mail" icon={<Mail size={32} />} />
                <DesktopIcon id="jarvis" title="Jarvis" icon={<Cpu size={32} />} />
                {children}
            </div>

            <MusicWidget />

            <Dock />

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    items={desktopItems}
                />
            )}
        </div>
    );
}
