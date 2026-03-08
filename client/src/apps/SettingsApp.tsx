import { useState } from 'react';
import { Monitor, Palette, Moon, Sun } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const WALLPAPERS = [
    { name: 'Big Sur', url: 'https://images.unsplash.com/photo-1611083360739-bdad6e0eb1fa?q=80&w=2600&auto=format&fit=crop' },
    { name: 'Dark Abstract', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2600&auto=format&fit=crop' },
    { name: 'Mountain', url: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2600&auto=format&fit=crop' },
    { name: 'Forest', url: 'https://images.unsplash.com/photo-1502657877623-f66bf489d236?q=80&w=2600&auto=format&fit=crop' },
    { name: 'Peak', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2600&auto=format&fit=crop' },
    { name: 'Deep Forest', url: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2600&auto=format&fit=crop' }
];

export function SettingsApp() {
    const { wallpaper, theme, setWallpaper, setTheme } = useAppStore();
    const [activeTab, setActiveTab] = useState<'desktop' | 'appearance'>('desktop');

    return (
        <div className="flex h-full bg-white/95 backdrop-blur-xl">
            {/* Sidebar */}
            <div className="w-48 bg-gray-50/50 border-r border-gray-200/50 p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                    System
                </div>
                <nav className="space-y-1">
                    <button
                        onClick={() => setActiveTab('desktop')}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'desktop' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-black/5'}`}
                    >
                        <Monitor size={16} /> Desktop
                    </button>
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === 'appearance' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-black/5'}`}
                    >
                        <Palette size={16} /> Appearance
                    </button>
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6 drop-shadow-sm">
                    {activeTab === 'desktop' ? 'Desktop Wallpaper' : 'Appearance'}
                </h1>

                {activeTab === 'desktop' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {WALLPAPERS.map((wp, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setWallpaper(wp.url)}
                                    className={`relative rounded-xl overflow-hidden cursor-pointer cursor-default transition-all shadow-sm ${wp.url === wallpaper ? 'ring-4 ring-blue-500 ring-offset-2 scale-[1.02]' : 'hover:scale-[1.02] hover:shadow-md'}`}
                                >
                                    <img src={wp.url} alt={wp.name} className="w-full h-32 object-cover" />
                                    <div className="absolute font-semibold bottom-0 inset-x-0 bg-black/40 backdrop-blur-md p-2 text-xs text-white">
                                        {wp.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'appearance' && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-4">Theme Preference</h3>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <div className="w-16 h-12 rounded bg-gray-100 border shadow-inner flex items-center justify-center text-gray-400">
                                        <Sun size={24} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Light</span>
                                </button>

                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                >
                                    <div className="w-16 h-12 rounded bg-gray-800 border shadow-inner flex items-center justify-center text-gray-400">
                                        <Moon size={24} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Dark</span>
                                </button>
                            </div>
                            <p className="mt-4 text-xs text-gray-500">
                                Note: Changing the theme primarily affects supported applications. The main OS retains its glassmorphism style.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
