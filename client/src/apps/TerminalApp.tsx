import React, { useState, useRef, useEffect } from 'react';

export function TerminalApp() {
    const [history, setHistory] = useState<string[]>(['Welcome to AquaDesk Terminal', 'Type "help" to see available commands.']);
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    const handleCommand = (e: React.FormEvent) => {
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
                response = 'aquadesk_user';
                break;
            case 'ls':
                response = 'Documents  Downloads  Desktop  Applications';
                break;
            default:
                if (cmd.startsWith('echo ')) {
                    response = cmd.slice(5);
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
