import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    items: {
        label: string;
        action: () => void;
        type?: 'item' | 'separator';
        shortcut?: string;
    }[];
}

export function ContextMenu({ x, y, onClose, items }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Adjust position if menu goes off screen
    const adjustedX = Math.min(x, window.innerWidth - 250);
    const adjustedY = Math.min(y, window.innerHeight - (items.length * 30 + 20));

    return (
        <AnimatePresence>
            <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                style={{ left: adjustedX, top: adjustedY }}
                className="fixed z-[9999] w-56 p-1.5 rounded-xl glass-dark border border-white/10 shadow-2xl backdrop-blur-3xl overflow-hidden"
            >
                {items.map((item, index) => (
                    item.type === 'separator' ? (
                        <div key={index} className="h-[1px] bg-white/10 my-1 mx-2" />
                    ) : (
                        <div
                            key={index}
                            onClick={() => {
                                item.action();
                                onClose();
                            }}
                            className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-blue-600 group cursor-default transition-colors"
                        >
                            <span className="text-[13px] text-white/90 group-hover:text-white">{item.label}</span>
                            {item.shortcut && (
                                <span className="text-[11px] text-white/40 group-hover:text-white/60">{item.shortcut}</span>
                            )}
                        </div>
                    )
                ))}
            </motion.div>
        </AnimatePresence>
    );
}
