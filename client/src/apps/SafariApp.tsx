import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Lock, Shield, Plus, X, Star, Bookmark } from 'lucide-react';

interface Tab {
    id: string;
    url: string;
    title: string;
}

export function SafariApp() {
    const [tabs, setTabs] = useState<Tab[]>([{ id: '1', url: 'https://www.google.com/search?igu=1', title: 'Google' }]);
    const [activeTabId, setActiveTabId] = useState('1');
    const [bookmarks, setBookmarks] = useState<string[]>(['https://www.wikipedia.org']);
    const [showBookmarks, setShowBookmarks] = useState(false);

    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
    const [inputUrl, setInputUrl] = useState(activeTab.url.replace('https://', '').replace('http://', ''));

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        let finalUrl = inputUrl.trim();

        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
                finalUrl = 'https://' + finalUrl;
            } else {
                finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}&igu=1`;
            }
        }

        setTabs(tabs.map(t => t.id === activeTabId ? { ...t, url: finalUrl, title: finalUrl.replace('https://', '').split('/')[0] } : t));
        setInputUrl(finalUrl.replace('https://', ''));
    };

    const addTab = () => {
        const newTab = { id: Date.now().toString(), url: 'https://www.google.com/search?igu=1', title: 'New Tab' };
        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
        setInputUrl('google.com');
    };

    const closeTab = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (tabs.length === 1) return; // Don't close last tab
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTabId === id) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
            setInputUrl(newTabs[newTabs.length - 1].url.replace('https://', ''));
        }
    };

    const toggleBookmark = () => {
        if (bookmarks.includes(activeTab.url)) {
            setBookmarks(bookmarks.filter(b => b !== activeTab.url));
        } else {
            setBookmarks([...bookmarks, activeTab.url]);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e]">
            {/* Tab Bar */}
            <div className="flex bg-[#2a2a2a] pt-2 px-2 gap-1 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        onClick={() => {
                            setActiveTabId(tab.id);
                            setInputUrl(tab.url.replace('https://', ''));
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 min-w-[120px] max-w-[200px] cursor-pointer rounded-t-lg border-b border-transparent transition-colors group ${activeTabId === tab.id ? 'bg-[#3a3a3a]' : 'hover:bg-[#333]'
                            }`}
                    >
                        <span className="flex-1 text-xs text-white/80 truncate">{tab.title}</span>
                        <button
                            onClick={(e) => closeTab(tab.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded-md transition-all text-white/50 hover:text-white"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
                <button onClick={addTab} className="p-1.5 ml-1 text-white/50 hover:text-white hover:bg-white/10 rounded-lg self-center mb-1 transition-colors">
                    <Plus size={16} />
                </button>
            </div>

            {/* Toolbar */}
            <div className="h-12 border-b border-white/10 flex items-center px-4 gap-4 bg-[#3a3a3a]">
                <div className="flex items-center gap-3 text-white">
                    <button className="opacity-40 hover:opacity-100 transition-opacity">
                        <ChevronLeft size={20} />
                    </button>
                    <button className="opacity-40 hover:opacity-100 transition-opacity">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="flex-1 max-w-2xl mx-auto flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg border border-white/5 focus-within:bg-white/15 transition-all text-white">
                    <Shield size={14} className="text-green-400 opacity-60" />
                    <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                        <Lock size={10} className="opacity-40" />
                        <input
                            type="text"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            className="flex-1 bg-transparent border-none text-xs text-white/90 outline-none placeholder:text-white/20"
                            placeholder="Search or enter website name"
                        />
                        <button type="submit" className="hidden" />
                    </form>
                    <RotateCw size={14} className="opacity-40 hover:opacity-100 cursor-pointer transition-opacity" />
                </div>

                <div className="flex items-center gap-4 text-white relative">
                    <button onClick={toggleBookmark} className={`transition-opacity ${bookmarks.includes(activeTab.url) ? 'text-yellow-400 opacity-100' : 'opacity-40 hover:opacity-100'}`}>
                        <Star size={18} fill={bookmarks.includes(activeTab.url) ? "currentColor" : "none"} />
                    </button>

                    <button onClick={() => setShowBookmarks(!showBookmarks)} className={`transition-opacity ${showBookmarks ? 'opacity-100 bg-white/10 rounded p-1' : 'opacity-40 hover:opacity-100'}`}>
                        <Bookmark size={18} />
                    </button>

                    {showBookmarks && (
                        <div className="absolute top-full mt-2 right-0 w-64 bg-[#2a2a2a] border border-white/10 rounded-xl shadow-2xl p-2 z-50">
                            <h3 className="text-xs font-semibold text-white/50 mb-2 px-2">Bookmarks</h3>
                            {bookmarks.length === 0 ? (
                                <p className="text-xs text-white/30 px-2 pb-2">No bookmarks yet.</p>
                            ) : (
                                bookmarks.map((bm, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            setTabs(tabs.map(t => t.id === activeTabId ? { ...t, url: bm, title: bm.replace('https://', '').split('/')[0] } : t));
                                            setInputUrl(bm.replace('https://', ''));
                                            setShowBookmarks(false);
                                        }}
                                        className="text-xs text-white/90 px-2 py-1.5 hover:bg-blue-500 rounded cursor-pointer truncate"
                                    >
                                        {bm}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content (Render active tab iframe only to save memory/DOM) */}
            <div className="flex-1 bg-white relative">
                {tabs.map(tab => (
                    <iframe
                        key={tab.id}
                        src={tab.url}
                        className={`w-full h-full border-none absolute inset-0 ${activeTabId === tab.id ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'}`}
                        title={`Safari Tab - ${tab.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ))}
            </div>

            {/* Status Bar */}
            <div className="h-6 border-t border-white/5 bg-black/10 flex items-center px-4">
                <span className="text-[10px] opacity-40 text-white truncate">
                    {activeTab.url}
                </span>
            </div>
        </div>
    );
}
