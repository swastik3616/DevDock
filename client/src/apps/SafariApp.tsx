import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Shield, Search, Lock } from 'lucide-react';

export function SafariApp() {
    const [url, setUrl] = useState('https://www.google.com/search?igu=1');
    const [inputUrl, setInputUrl] = useState('google.com');

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

        setUrl(finalUrl);
        setInputUrl(finalUrl.replace('https://', '').replace('http://', ''));
    };

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e]">
            {/* Toolbar */}
            <div className="h-12 border-b border-white/10 flex items-center px-4 gap-4 bg-black/20">
                <div className="flex items-center gap-3">
                    <button className="opacity-40 hover:opacity-100 transition-opacity">
                        <ChevronLeft size={20} />
                    </button>
                    <button className="opacity-40 hover:opacity-100 transition-opacity">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="flex-1 max-w-2xl mx-auto flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg border border-white/5 focus-within:bg-white/15 transition-all">
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

                <div className="flex items-center gap-4">
                    <button className="opacity-40 hover:opacity-100 transition-opacity">
                        <Search size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-white">
                <iframe
                    src={url}
                    className="w-full h-full border-none"
                    title="Safari Browser"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>

            {/* Footer / Status Bar (optional) */}
            <div className="h-6 border-t border-white/5 bg-black/10 flex items-center px-4">
                <span className="text-[10px] opacity-40 text-white truncate">
                    {url}
                </span>
            </div>
        </div>
    );
}
