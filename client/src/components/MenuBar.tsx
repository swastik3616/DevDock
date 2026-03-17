import { useState, useEffect } from 'react';
import { Wifi, Battery, Search, LayoutGrid, Mic } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function MenuBar() {
    const [time, setTime] = useState(new Date());
    const { toggleSiri } = useAppStore();

    const [isAppleMenuOpen, setIsAppleMenuOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSleep = () => {
        useAppStore.getState().toggleSleep();
        setIsAppleMenuOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        useAppStore.getState().setAuth(null);
        setIsAppleMenuOpen(false);
    };

    const handleShutdown = () => {
        setIsAppleMenuOpen(false);
        useAppStore.getState().shutdown();
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="fixed top-0 w-full h-8 glass flex items-center justify-between px-4 z-[2000] text-[13px] font-medium text-white shadow-sm">
            <div className="flex items-center gap-4 relative">
                <div className="relative">
                    <span
                        className={`text-lg leading-none mt-[-2px] hover:bg-white/10 px-2 rounded cursor-pointer transition-colors block ${isAppleMenuOpen ? 'bg-white/20' : ''}`}
                        onClick={() => setIsAppleMenuOpen(!isAppleMenuOpen)}
                    >
                        
                    </span>

                    {/* Apple Dropdown Menu */}
                    {isAppleMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-[1999]" onClick={() => setIsAppleMenuOpen(false)} />
                            <div className="absolute top-full mt-1 left-0 w-48 rounded-lg outline-none overflow-hidden glass shadow-2xl border border-white/20 z-[2000] py-1 flex flex-col">
                                <button className="w-full text-left px-4 py-1.5 hover:bg-blue-500 hover:text-white transition-colors text-white whitespace-nowrap">
                                    About This Mac
                                </button>
                                <div className="h-[1px] bg-white/20 my-1 mx-2" />
                                <button
                                    onClick={handleSleep}
                                    className="w-full text-left px-4 py-1.5 hover:bg-blue-500 hover:text-white transition-colors text-white whitespace-nowrap"
                                >
                                    Sleep
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-1.5 hover:bg-blue-500 hover:text-white transition-colors text-white whitespace-nowrap"
                                >
                                    Restart...
                                </button>
                                <button
                                    onClick={handleShutdown}
                                    className="w-full text-left px-4 py-1.5 hover:bg-blue-500 hover:text-white transition-colors text-white whitespace-nowrap"
                                >
                                    Shut Down...
                                </button>
                                <div className="h-[1px] bg-white/20 my-1 mx-2" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-1.5 hover:bg-blue-500 hover:text-white transition-colors text-white whitespace-nowrap"
                                >
                                    Lock Screen
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-1.5 hover:bg-blue-500 hover:text-white transition-colors text-white whitespace-nowrap"
                                >
                                    Log Out Developer...
                                </button>
                            </div>
                        </>
                    )}
                </div>
                <span className="font-bold hover:bg-white/10 px-2 rounded cursor-default">AquaDesk</span>
                <span className="hidden md:block hover:bg-white/10 px-2 rounded cursor-default">File</span>
                <span className="hidden md:block hover:bg-white/10 px-2 rounded cursor-default">Edit</span>
                <span className="hidden md:block hover:bg-white/10 px-2 rounded cursor-default">View</span>
                <span className="hidden md:block hover:bg-white/10 px-2 rounded cursor-default">Go</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 pr-2 border-r border-white/20">
                    <button onClick={toggleSiri} title="Siri" className="flex items-center justify-center p-0 m-0 border-none bg-transparent">
                        <Mic size={14} className="opacity-90 cursor-pointer hover:opacity-100 text-purple-400 transition-colors" />
                    </button>
                    <Wifi size={14} className="opacity-90 cursor-default" />
                    <Battery size={14} className="opacity-90 cursor-default" />
                    <Search size={14} className="opacity-90 cursor-default" />
                    <LayoutGrid size={14} className="opacity-90 cursor-default" />
                </div>
                <div className="hover:bg-white/10 px-2 rounded cursor-default flex gap-2">
                    <span>{formatDate(time)}</span>
                    <span>{formatTime(time)}</span>
                </div>
            </div>
        </div>
    );
}
