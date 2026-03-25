import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Bot, User, Send, Cpu, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function JarvisApp() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello, I am Jarvis. How may I assist you with your code or research today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Call the actual backend AI endpoint
            const res = await api.post('/api/ai/chat', {
                messages: messages.concat(userMsg).map(m => ({ role: m.role, content: m.content }))
            });

            const data = res.data;

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.reply,
                timestamp: new Date()
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'System failure: Cannot reach the backend API.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0c] text-gray-200 font-sans">
            {/* Header */}
            <div className="h-14 border-b border-white/10 flex items-center px-4 bg-white/5 backdrop-blur-md shrink-0 justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                        <Cpu size={18} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            Jarvis AI <Sparkles size={12} className="text-purple-400" />
                        </h2>
                        <p className="text-[10px] text-purple-400/70 font-mono tracking-widest uppercase">System Online</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <AnimatePresence initial={false}>
                    {messages.map(msg => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center border ${msg.role === 'user'
                                        ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                                        : 'bg-purple-600/20 text-purple-400 border-purple-500/30'
                                    }`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>

                                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <span className="text-xs text-gray-500 mb-1 px-1">
                                        {msg.role === 'user' ? 'You' : 'Jarvis'} • {formatTime(msg.timestamp)}
                                    </span>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                            ? 'bg-blue-600/80 text-white rounded-tr-sm'
                                            : 'bg-white/10 text-gray-200 border border-white/5 rounded-tl-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="flex max-w-[85%] gap-3 flex-row">
                                <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex shrink-0 items-center justify-center border border-purple-500/30">
                                    <Bot size={16} />
                                </div>
                                <div className="flex flex-col items-start pt-1.5">
                                    <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/5 rounded-tl-sm flex items-center gap-2 text-purple-400/70 text-sm">
                                        <Loader2 size={16} className="animate-spin" /> Processing request...
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/5 backdrop-blur-md border-t border-white/10 shrink-0">
                <div className="relative flex items-center">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message Jarvis..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 resize-none max-h-32 transition-all"
                        rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 5) : 1}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 bottom-2 p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-gray-500">Press Enter to send, Shift+Enter for new line</span>
                </div>
            </div>
        </div>
    );
}
