import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Edit3, Trash2, Send, Flame, Maximize2, Minimize2, CheckSquare } from 'lucide-react';

interface Email {
    id: string;
    from: string;
    subject: string;
    body: string;
    date: string;
    isBurn: boolean;
    read: boolean;
}

const INITIAL_EMAILS: Email[] = [
    {
        id: '1',
        from: 'System Admin',
        subject: 'Welcome to AquaMail',
        body: 'Enjoy your new inbox experience featuring Zen Mode, Smart Action Extraction, and Burn After Reading.',
        date: '10:00 AM',
        isBurn: false,
        read: false
    },
    {
        id: '2',
        from: 'Secret Agent',
        subject: 'Eyes Only',
        body: 'This message will self-destruct 5 seconds after you open it. Do not share these launch codes... just kidding, there are no launch codes. But it will burn!',
        date: '09:45 AM',
        isBurn: true,
        read: false
    }
];

export function MailApp() {
    const [view, setView] = useState<'inbox' | 'compose' | 'reading'>('inbox');
    const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

    // Compose State
    const [draftTo, setDraftTo] = useState('');
    const [draftSubject, setDraftSubject] = useState('');
    const [draftBody, setDraftBody] = useState('');
    const [isZenMode, setIsZenMode] = useState(false);
    const [isBurnDraft, setIsBurnDraft] = useState(false);
    const [actionItems, setActionItems] = useState<string[]>([]);

    // Reading State
    const [burnCountdown, setBurnCountdown] = useState<number | null>(null);

    // Smart Action Extractor
    useEffect(() => {
        if (view === 'compose') {
            const lines = draftBody.split('\n');
            const extracted = lines
                .filter(line => line.trim().match(/^(to[\s-]?do|task|action|\*|-)\s*:/i) || line.trim().match(/^-\s*\[\s*\]/))
                .map(line => line.replace(/^(to[\s-]?do|task|action|\*|-)\s*:/i, '').replace(/^-\s*\[\s*\]/, '').trim())
                .filter(item => item.length > 0);
            setActionItems(extracted);
        }
    }, [draftBody, view]);

    // Burn After Reading Logic
    useEffect(() => {
        if (view === 'reading' && selectedEmail?.isBurn) {
            setBurnCountdown(5);
            const interval = setInterval(() => {
                setBurnCountdown(prev => {
                    if (prev === null || prev <= 1) {
                        clearInterval(interval);
                        // Trigger destruct
                        setTimeout(() => {
                            setEmails(curr => curr.filter(e => e.id !== selectedEmail.id));
                            setView('inbox');
                            setSelectedEmail(null);
                        }, 500); // Wait for animation
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setBurnCountdown(null);
        }
    }, [view, selectedEmail]);

    const handleSend = () => {
        const newEmail: Email = {
            id: Date.now().toString(),
            from: 'Me',
            subject: draftSubject || 'No Subject',
            body: draftBody,
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isBurn: isBurnDraft,
            read: true
        };
        setEmails([newEmail, ...emails]);
        setView('inbox');
        setDraftTo('');
        setDraftSubject('');
        setDraftBody('');
        setIsZenMode(false);
        setIsBurnDraft(false);
    };

    const deleteEmail = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEmails(emails.filter(email => email.id !== id));
        if (selectedEmail?.id === id) {
            setView('inbox');
            setSelectedEmail(null);
        }
    };

    const openEmail = (email: Email) => {
        setEmails(emails.map(e => e.id === email.id ? { ...e, read: true } : e));
        setSelectedEmail(email);
        setView('reading');
    };

    return (
        <div className="w-full h-full flex flex-col bg-white overflow-hidden font-sans">
            {/* Zen Mode Backdrop Overlay */}
            <AnimatePresence>
                {isZenMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9900] bg-white/40 backdrop-blur-3xl"
                    />
                )}
            </AnimatePresence>

            {/* Main Application Container */}
            <motion.div
                layout
                className={`flex-1 flex flex-col h-full bg-white relative ${isZenMode ? 'fixed inset-4 z-[9910] rounded-2xl shadow-2xl overflow-hidden glass' : ''}`}
            >
                {/* Header Toolbar */}
                <div className="h-12 border-b flex items-center justify-between px-4 bg-gray-50/80 backdrop-blur shrink-0">
                    <div className="flex items-center gap-2">
                        {view !== 'inbox' && (
                            <button
                                onClick={() => { setView('inbox'); setIsZenMode(false); }}
                                className="px-3 py-1 text-sm font-medium hover:bg-black/5 rounded-md transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <Mail size={16} /> AquaMail
                        </h2>
                    </div>

                    {view === 'inbox' && (
                        <button
                            onClick={() => setView('compose')}
                            className="p-1.5 hover:bg-black/5 rounded-md transition-colors"
                            title="Compose"
                        >
                            <Edit3 size={18} />
                        </button>
                    )}
                </div>

                {/* INBOX VIEW */}
                {view === 'inbox' && (
                    <div className="flex-1 overflow-y-auto">
                        {emails.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                Inbox is empty
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {emails.map(email => (
                                    <div
                                        key={email.id}
                                        onClick={() => openEmail(email)}
                                        className={`p-4 cursor-pointer hover:bg-blue-50/50 transition-colors group flex items-start gap-4 ${!email.read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-sm truncate pr-2 ${!email.read ? 'font-bold' : 'font-medium'}`}>
                                                    {email.from} {email.isBurn && <Flame size={12} className="inline text-red-500 ml-1" />}
                                                </span>
                                                <span className="text-xs text-gray-400 whitespace-nowrap">{email.date}</span>
                                            </div>
                                            <p className={`text-sm truncate mb-0.5 ${!email.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                {email.subject}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{email.body}</p>
                                        </div>
                                        <button
                                            onClick={(e) => deleteEmail(email.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 text-red-500 rounded transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* READING VIEW */}
                {view === 'reading' && selectedEmail && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedEmail.id}
                            initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            animate={{ opacity: burnCountdown === 0 ? 0 : 1, scale: burnCountdown === 0 ? 0.9 : 1, filter: burnCountdown === 0 ? 'blur(10px)' : 'blur(0px)' }}
                            transition={{ duration: 0.5 }}
                            className="flex-1 flex flex-col overflow-hidden relative"
                        >
                            <div className="p-6 border-b shrink-0 bg-white">
                                <h1 className="text-2xl font-bold mb-4">{selectedEmail.subject}</h1>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                            {selectedEmail.from.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{selectedEmail.from}</p>
                                            <p className="text-gray-500 text-xs">to me</p>
                                        </div>
                                    </div>
                                    <span className="text-gray-400">{selectedEmail.date}</span>
                                </div>
                            </div>
                            <div className="p-6 overflow-y-auto text-gray-800 text-sm leading-relaxed whitespace-pre-wrap flex-1 bg-white">
                                {selectedEmail.body}
                            </div>

                            {/* Burn Overlay */}
                            {selectedEmail.isBurn && burnCountdown !== null && (
                                <div className="absolute top-4 right-4 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold font-mono flex items-center gap-2 shadow-sm border border-red-100">
                                    <Flame size={14} className="animate-pulse" />
                                    Destructing in {burnCountdown}s
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* COMPOSE VIEW */}
                {view === 'compose' && (
                    <div className="flex-1 flex overflow-hidden">
                        <div className={`flex-1 flex flex-col transition-all duration-500 ${isZenMode ? 'p-12 max-w-3xl mx-auto w-full' : 'p-0'}`}>
                            {/* Compose Header */}
                            <div className={`shrink-0 flex items-center px-4 border-b ${isZenMode ? 'border-transparent mb-4' : 'h-10 border-gray-100'}`}>
                                <span className="text-gray-400 text-sm w-12">To:</span>
                                <input
                                    type="text"
                                    value={draftTo}
                                    onChange={e => setDraftTo(e.target.value)}
                                    className={`flex-1 text-sm outline-none bg-transparent ${isZenMode ? 'text-lg font-medium' : ''}`}
                                />
                            </div>
                            <div className={`shrink-0 flex items-center px-4 border-b ${isZenMode ? 'border-transparent mb-8' : 'h-10 border-gray-100'}`}>
                                <span className="text-gray-400 text-sm w-12">Subj:</span>
                                <input
                                    type="text"
                                    value={draftSubject}
                                    onChange={e => setDraftSubject(e.target.value)}
                                    className={`flex-1 text-sm outline-none bg-transparent ${isZenMode ? 'text-3xl font-bold placeholder:text-gray-200' : ''}`}
                                    placeholder={isZenMode ? 'Glorious Purpose...' : ''}
                                />
                            </div>

                            {/* Compose Body */}
                            <textarea
                                value={draftBody}
                                onChange={e => setDraftBody(e.target.value)}
                                className={`flex-1 w-full p-4 resize-none outline-none bg-transparent ${isZenMode ? 'text-lg leading-relaxed text-gray-700 placeholder:text-gray-300' : 'text-sm text-gray-800'}`}
                                placeholder="Write something meaningful... (Use 'Task: ' to create action items!)"
                            />

                            {/* Compose Toolbar */}
                            <div className={`shrink-0 h-14 border-t px-4 flex items-center justify-between ${isZenMode ? 'border-gray-200' : 'bg-gray-50/50'}`}>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSend}
                                        disabled={!draftTo || !draftBody}
                                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Send size={14} /> Send
                                    </button>
                                    <button
                                        onClick={() => setIsBurnDraft(!isBurnDraft)}
                                        className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs font-semibold ${isBurnDraft ? 'bg-red-100 text-red-600' : 'hover:bg-black/5 text-gray-500'}`}
                                        title="Burn After Reading"
                                    >
                                        <Flame size={16} /> {isBurnDraft ? 'Burn ON' : ''}
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsZenMode(!isZenMode)}
                                    className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-black/5 rounded-md transition-colors"
                                    title="Toggle Zen Mode"
                                >
                                    {isZenMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Smart Action Extractor Sidebar */}
                        <AnimatePresence>
                            {(view === 'compose' && actionItems.length > 0) && (
                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 256, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    className="border-l bg-blue-50/30 overflow-hidden flex flex-col whitespace-nowrap"
                                >
                                    <div className="p-4 border-b bg-blue-100/30">
                                        <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                                            <CheckSquare size={14} /> Identified Actions
                                        </h3>
                                    </div>
                                    <div className="p-4 flex-1 overflow-y-auto select-none">
                                        {actionItems.map((item, idx) => (
                                            <motion.div
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={idx}
                                                className="mb-3 flex items-start gap-2 text-sm text-gray-700"
                                            >
                                                <div className="w-4 h-4 rounded border border-blue-400 shrink-0 mt-0.5" />
                                                <span className="whitespace-normal break-words">{item}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
