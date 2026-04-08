import { useState, useEffect } from 'react';
import { Save, Loader2, FileText } from 'lucide-react';
import api from '../services/api';
import { useAppStore } from '../store/useAppStore';

export function TextEditorApp({ windowId }: { windowId: string }) {
    const { windows } = useAppStore();
    const appData = windows.find(w => w.id === windowId)?.appData;
    const fileId = appData?.fileId;

    const [content, setContent] = useState('');
    const [fileName, setFileName] = useState('Loading...');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        if (!fileId) return;
        
        const fetchFile = async () => {
            try {
                const res = await api.get(`/files/${fileId}`);
                setContent(res.data.content || '');
                setFileName(res.data.name);
            } catch (err) {
                console.error('Failed to fetch file content', err);
                setFileName('Error loading file');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFile();
    }, [fileId]);

    const handleSave = async () => {
        if (!fileId) return;
        setIsSaving(true);
        setSaveMessage('Saving...');
        try {
            await api.patch(`/files/${fileId}`, { content });
            setSaveMessage('Saved successfully');
            setTimeout(() => setSaveMessage(''), 2000);
        } catch (err) {
            console.error('Failed to save file', err);
            setSaveMessage('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    if (!fileId) {
        return (
            <div className="flex h-full items-center justify-center text-white/50 bg-[#1e1e1e]">
                <p>No file specified</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex h-full flex-col items-center justify-center text-white/50 bg-[#1e1e1e] gap-4">
                <Loader2 size={24} className="animate-spin text-blue-400" />
                <p>Loading file...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] text-white/90">
            {/* Toolbar */}
            <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-black/20 shrink-0">
                <div className="flex items-center gap-2 max-w-[60%]">
                    <FileText size={16} className="text-blue-400 shrink-0" />
                    <span className="text-xs font-semibold truncate">{fileName}</span>
                    {saveMessage && (
                        <span className="text-[10px] text-white/40 ml-2 animate-pulse">{saveMessage}</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-xs transition-colors disabled:opacity-50"
                        title="Save (Ctrl+S)"
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
                <textarea
                    autoFocus
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                            e.preventDefault();
                            handleSave();
                        }
                    }}
                    spellCheck={false}
                    className="flex-1 w-full h-full bg-transparent border-none outline-none resize-none font-mono text-sm leading-relaxed text-gray-300 custom-scrollbar"
                    placeholder="Start typing..."
                />
            </div>
        </div>
    );
}
