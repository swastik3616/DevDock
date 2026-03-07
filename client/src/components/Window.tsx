import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { X, Minus } from 'lucide-react';

interface WindowProps {
    id: string;
    title: string;
    children: React.ReactNode;
}

export function Window({ id, title, children }: WindowProps) {
    const { windows, closeApp, minimizeApp, focusApp, toggleMaximize, activeWindowId } = useAppStore();
    const windowData = windows.find(w => w.id === id);

    if (!windowData || !windowData.isOpen || windowData.isMinimized) return null;

    const isActive = activeWindowId === id;
    const isMaximized = windowData.isMaximized;

    return (
        <motion.div
            drag={isMaximized ? false : true}
            dragMomentum={false}
            onPointerDown={() => focusApp(id)}
            animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                width: isMaximized ? '100vw' : 'auto',
                height: isMaximized ? 'calc(100vh - 32px)' : 'auto',
                top: isMaximized ? '32px' : '',
                left: isMaximized ? 0 : '',
            }}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
                zIndex: isMaximized ? 999 : windowData.zIndex,
                position: isMaximized ? 'fixed' : 'absolute'
            }}
            className={`${isMaximized ? 'rounded-none' : 'absolute top-20 left-20 min-w-[400px] min-h-[300px] rounded-xl'} overflow-hidden glass-dark border border-white/20 flex flex-col transition-shadow duration-300 ${isActive ? 'window-shadow-active z-50' : 'window-shadow-inactive z-10'}`}
        >
            {/* Title Bar */}
            <div className={`h-[52px] flex items-center justify-between px-4 cursor-default select-none border-b border-white/10 ${isActive ? 'bg-white/5' : 'bg-transparent'}`}>
                <div className="flex gap-2 group/controls w-20">
                    <button
                        onClick={(e) => { e.stopPropagation(); closeApp(id); }}
                        className={`traffic-light traffic-light-close ${!isActive && 'traffic-light-inactive'}`}
                    >
                        <X size={8} strokeWidth={4} className="text-black/60 opacity-20 group-hover/controls:opacity-100 transition-opacity" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); minimizeApp(id); }}
                        className={`traffic-light traffic-light-minimize ${!isActive && 'traffic-light-inactive'}`}
                    >
                        <Minus size={10} strokeWidth={4} className="text-black/60 opacity-20 group-hover/controls:opacity-100 transition-opacity" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }}
                        className={`traffic-light traffic-light-maximize ${!isActive && 'traffic-light-inactive'}`}
                    >
                        <svg viewBox="0 0 10 10" className="w-1.5 h-1.5 text-black/60 opacity-20 group-hover/controls:opacity-100 transition-opacity">
                            <path fill="currentColor" d="M1 9 L4 6 M1 9 L4 9 M1 9 L1 6 M9 1 L6 4 M9 1 L6 1 M9 1 L9 4" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col items-center">
                    <span className={`text-[13px] font-semibold transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/30'}`}>{title}</span>
                </div>

                <div className="w-20" /> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-[#1e1e1e]/60 text-white/90 backdrop-blur-md">
                {children}
            </div>
        </motion.div>
    );
}
