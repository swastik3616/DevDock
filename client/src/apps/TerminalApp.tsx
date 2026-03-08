import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export function TerminalApp() {
    const [history, setHistory] = useState<string[]>(['Welcome to AquaDesk Terminal', 'Type "help" to see available commands.']);
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const currentUser = useAppStore(state => state.currentUser);

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = input.trim().toLowerCase();
        let response = '';

        switch (cmd) {
            case 'help':
                response = 'Available commands: help, clear, date, whoami, ls, echo [text]';
                break;
            case 'clear':
                setHistory([]);
                setInput('');
                return;
            case 'date':
                response = new Date().toString();
                break;
            case 'whoami':
                response = currentUser || 'guest';
                break;
            case 'ls':
                try {
                    const res = await fetch('http://localhost:5000/api/files', {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    if (res.ok) {
                        const files = await res.json();
                        response = files.map((f: any) =>
                            f.type === 'folder' ? `<dir> ${f.name}` : `      ${f.name}`
                        ).join('\n');
                    } else {
                        response = 'ls: cannot access files';
                    }
                } catch (err) {
                    response = 'ls: connection error';
                }
                break;
            default:
                if (cmd.startsWith('echo ')) {
                    response = cmd.slice(5);
                } else if (cmd.startsWith('mkdir ') || cmd.startsWith('touch ')) {
                    const isDir = cmd.startsWith('mkdir');
                    const name = cmd.slice(6).trim();
                    if (!name) {
                        response = isDir ? 'mkdir: missing operand' : 'touch: missing operand';
                    } else {
                        try {
                            const res = await fetch('http://localhost:5000/api/files', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                },
                                body: JSON.stringify({ name, type: isDir ? 'folder' : 'file', size: isDir ? '--' : '0 B' })
                            });
                            if (res.ok) {
                                response = '';
                            } else {
                                response = `cannot create ${name}: server error`;
                            }
                        } catch (err) {
                            response = `cannot create ${name}: connection error`;
                        }
                    }
                } else if (cmd === '') {
                    response = '';
                } else {
                    response = `command not found: ${cmd}`;
                }
        }

        setHistory([...history, `$ ${input}`, response].filter(line => line !== ''));
        setInput('');
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    return (
        <div className="p-4 font-mono text-xs md:text-sm text-green-400 h-full flex flex-col overflow-auto bg-black/80">
            <div className="flex-1">
                {history.map((line, i) => (
                    <div key={i} className="mb-1 leading-relaxed whitespace-pre-wrap">{line}</div>
                ))}
                <div ref={bottomRef} />
            </div>
            <form onSubmit={handleCommand} className="flex gap-2 mt-2">
                <span className="text-white font-bold">$</span>
                <input
                    autoFocus
                    className="bg-transparent border-none outline-none flex-1 text-white"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
            </form>
        </div>
    );
}
