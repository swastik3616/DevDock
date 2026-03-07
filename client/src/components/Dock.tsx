import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Monitor, Terminal as TerminalIcon, FileText, Calculator, Compass, MessageSquare, Mail, Play, Settings } from 'lucide-react';

const APPS = [
    { id: 'finder', title: 'Finder', icon: Monitor, color: 'bg-blue-500' },
    { id: 'safari', title: 'Safari', icon: Compass, color: 'bg-blue-400' },
    { id: 'messages', title: 'Messages', icon: MessageSquare, color: 'bg-green-500' },
    { id: 'mail', title: 'Mail', icon: Mail, color: 'bg-blue-300' },
    { id: 'notes', title: 'Notes', icon: FileText, color: 'bg-yellow-500' },
    { id: 'calc', title: 'Calculator', icon: Calculator, color: 'bg-orange-500' },
    { id: 'terminal', title: 'Terminal', icon: TerminalIcon, color: 'bg-gray-800' },
    { id: 'settings', title: 'Settings', icon: Settings, color: 'bg-gray-500' },
];

function DockIcon({ app, mouseX }: { app: any, mouseX: any }) {
    const ref = React.useRef<HTMLDivElement>(null);
    const { openApp, windows } = useAppStore();
    const isOpen = windows.some(w => w.id === app.id && w.isOpen);

    const distance = useTransform(mouseX, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [50, 90, 50]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <div className="relative flex flex-col items-center">
            <motion.div
                ref={ref}
                style={{ width, height: width }}
                onClick={() => openApp(app.id, app.title, app.id)}
                className={`rounded-[20%] flex items-center justify-center cursor-pointer group relative overflow-visible shadow-lg transition-all active:scale-90 ${app.color || 'glass-dark'}`}
            >
                <app.icon className="w-3/5 h-3/5 text-white drop-shadow-md" />

                {/* Tooltip */}
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg glass-dark text-white text-[13px] font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap window-shadow">
                    {app.title}
                </span>
            </motion.div>

            {/* Indicator Dot */}
            {isOpen && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-white opacity-80" />
            )}

            {/* Reflection (CSS based) */}
            <div
                className="absolute -bottom-12 w-full h-full pointer-events-none hidden md:block"
                style={{
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)'
                }}
            >
                <app.icon className="w-full h-full text-white/10 transform scale-y-[-1]" />
            </div>
        </div>
    );
}

export function Dock() {
    const mouseX = useMotionValue(Infinity);

    return (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[1000] mb-2">
            <motion.div
                onMouseMove={(e) => mouseX.set(e.pageX)}
                onMouseLeave={() => mouseX.set(Infinity)}
                className="flex items-end gap-2 px-3 py-2.5 rounded-[24px] glass-dark border border-white/20 shadow-2xl"
            >
                {APPS.map((app) => (
                    <DockIcon key={app.id} app={app} mouseX={mouseX} />
                ))}
            </motion.div>
        </div>
    );
}
