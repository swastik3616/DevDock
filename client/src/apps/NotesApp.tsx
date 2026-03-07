import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../services/api';

interface Note {
    id: string;
    title: string;
    content: string;
    date: string;
}

export function NotesApp() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await api.get('/notes');
            setNotes(res.data);
            if (res.data.length > 0) setActiveNoteId(res.data[0].id);
        } catch (err) {
            console.error('Failed to fetch notes', err);
        }
    };

    const activeNote = notes.find(n => n.id === activeNoteId);

    const addNote = async () => {
        try {
            const res = await api.post('/notes', { title: 'New Note', content: '' });
            setNotes([res.data, ...notes]);
            setActiveNoteId(res.data.id);
        } catch (err) {
            console.error('Failed to create note', err);
        }
    };

    const updateNote = async (id: string, updates: Partial<Note>) => {
        try {
            const res = await api.put(`/notes/${id}`, updates);
            setNotes(notes.map(n => n.id === id ? res.data : n));
        } catch (err) {
            console.error('Failed to update note', err);
        }
    };

    const deleteNote = async (id: string) => {
        try {
            await api.delete(`/notes/${id}`);
            const remaining = notes.filter(n => n.id !== id);
            setNotes(remaining);
            if (activeNoteId === id) {
                setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
            }
        } catch (err) {
            console.error('Failed to delete note', err);
        }
    };

    return (
        <div className="flex h-full text-white/90">
            {/* Sidebar */}
            <div className="w-48 border-r border-white/10 flex flex-col bg-black/20">
                <div className="p-3 flex justify-between items-center border-b border-white/10">
                    <span className="font-bold text-xs uppercase tracking-wider opacity-60">All Notes</span>
                    <Plus size={16} className="cursor-pointer hover:text-white" onClick={addNote} />
                </div>
                <div className="flex-1 overflow-auto">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => setActiveNoteId(note.id)}
                            className={`p-3 cursor-default hover:bg-white/5 transition-colors relative group ${activeNoteId === note.id ? 'bg-blue-600/40' : ''}`}
                        >
                            <h4 className="text-sm font-semibold truncate pr-6">{note.title || 'Untitled'}</h4>
                            <p className="text-[11px] opacity-40">{note.date}</p>
                            <Trash2
                                size={12}
                                className="absolute right-2 top-4 opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity cursor-pointer text-red-400"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNote(note.id);
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 flex flex-col">
                {activeNote ? (
                    <>
                        <input
                            className="bg-transparent border-none outline-none p-4 text-xl font-bold border-b border-white/5"
                            value={activeNote.title}
                            onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                            placeholder="Title..."
                        />
                        <textarea
                            className="flex-1 bg-transparent border-none outline-none p-4 resize-none leading-relaxed text-sm"
                            value={activeNote.content}
                            onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                            placeholder="Start typing..."
                        />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center opacity-20">
                        <p>Select a note to read</p>
                    </div>
                )}
            </div>
        </div>
    );
}
