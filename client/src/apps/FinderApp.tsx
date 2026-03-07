import React, { useState, useEffect } from 'react';
import { Folder, File, LayoutGrid, List, Search, Pencil, Trash2, FolderPlus, FilePlus } from 'lucide-react';
import api from '../services/api';

interface FileItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    size: string;
}

export function FinderApp() {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await api.get('/files');
            setFiles(res.data);
        } catch (err) {
            console.error('Failed to fetch files', err);
        }
    };

    const createFile = async (type: 'file' | 'folder') => {
        try {
            const name = type === 'folder' ? 'New Folder' : 'new_file.txt';
            await api.post('/files', { name, type, size: type === 'folder' ? '--' : '0 B' });
            fetchFiles();
        } catch (err) {
            console.error('Failed to create item', err);
        }
    };

    const deleteFile = async (id: string) => {
        try {
            await api.delete(`/files/${id}`);
            fetchFiles();
        } catch (err) {
            console.error('Failed to delete item', err);
        }
    };

    const handleRename = async (id: string) => {
        if (!newName.trim()) {
            setRenamingId(null);
            return;
        }
        try {
            await api.patch(`/files/${id}`, { name: newName });
            setRenamingId(null);
            setNewName('');
            fetchFiles();
        } catch (err) {
            console.error('Failed to rename item', err);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] text-white/90">
            {/* Toolbar */}
            <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-black/20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 opacity-60">
                        <LayoutGrid size={16} className={view === 'grid' ? 'text-blue-400' : ''} onClick={() => setView('grid')} />
                        <List size={16} className={view === 'list' ? 'text-blue-400' : ''} onClick={() => setView('list')} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => createFile('folder')} className="p-1 hover:bg-white/10 rounded transition-colors" title="New Folder">
                            <FolderPlus size={16} />
                        </button>
                        <button onClick={() => createFile('file')} className="p-1 hover:bg-white/10 rounded transition-colors" title="New File">
                            <FilePlus size={16} />
                        </button>
                    </div>

                    <div className="relative ml-2">
                        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-40" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="bg-white/10 border-none rounded-md px-8 py-1 text-xs outline-none focus:bg-white/20"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-1">
                {/* Sidebar */}
                <div className="w-40 border-r border-white/10 p-3 flex flex-col gap-2 bg-black/10">
                    <span className="text-[10px] font-bold uppercase opacity-40 px-2">Favorites</span>
                    {['AirDrop', 'Recents', 'Applications', 'Documents', 'Downloads'].map((item) => (
                        <div key={item} className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 text-xs opacity-80 cursor-default">
                            {item === 'Applications' ? <LayoutGrid size={14} /> : <Folder size={14} />}
                            {item}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 grid grid-cols-4 sm:grid-cols-6 gap-4 content-start overflow-auto">
                    {files.map(file => (
                        <div key={file.id} className="flex flex-col items-center gap-2 group p-2 rounded-lg hover:bg-white/5 cursor-default relative">
                            <div className="w-12 h-12 flex items-center justify-center text-blue-400">
                                {file.type === 'folder' ? <Folder size={40} fill="currentColor" fillOpacity={0.2} /> : <File size={40} />}
                            </div>

                            {renamingId === file.id ? (
                                <input
                                    autoFocus
                                    className="text-[11px] text-center bg-blue-500/50 text-white rounded px-1 w-full outline-none"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onBlur={() => handleRename(file.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRename(file.id)}
                                />
                            ) : (
                                <span className="text-[11px] text-center truncate w-full px-1">{file.name}</span>
                            )}

                            {/* Action Buttons */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex flex-col gap-1 bg-[#1e1e1e]/80 p-1 rounded backdrop-blur-sm border border-white/10 transition-opacity">
                                <button
                                    onClick={() => { setRenamingId(file.id); setNewName(file.name); }}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                    <Pencil size={10} />
                                </button>
                                <button
                                    onClick={() => deleteFile(file.id)}
                                    className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                >
                                    <Trash2 size={10} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
