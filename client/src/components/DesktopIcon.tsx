import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

interface DesktopIconProps {
    id: string;
    title: string;
    icon: React.ReactNode;
}

export function DesktopIcon({ id, title, icon }: DesktopIconProps) {
    const openApp = useAppStore(state => state.openApp);

    return (
        <motion.div
            drag
            dragMomentum={false}
            onDoubleClick={() => openApp(id, title, id)}
            className="w-20 h-24 flex flex-col items-center justify-center gap-1 group cursor-default"
            whileTap={{ scale: 0.95 }}
        >
            <div className="w-14 h-14 rounded-xl glass flex items-center justify-center text-white/90 group-hover:bg-white/20 transition-colors shadow-lg">
                {icon}
            </div>
            <span className="text-[11px] font-medium text-white text-shadow px-1.5 py-0.5 rounded group-hover:bg-blue-600/80 transition-colors truncate w-full text-center drop-shadow-md">
                {title}
            </span>
        </motion.div>
    );
}
