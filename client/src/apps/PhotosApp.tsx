import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, UploadCloud, X, ZoomIn } from 'lucide-react';

interface Photo {
    id: string;
    url: string;
    name: string;
}

const DEFAULT_PHOTOS: Photo[] = [
    { id: '1', name: 'Mountain', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop' },
    { id: '2', name: 'Ocean', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=800&auto=format&fit=crop' },
    { id: '3', name: 'Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db8855?q=80&w=800&auto=format&fit=crop' },
    { id: '4', name: 'City', url: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=800&auto=format&fit=crop' }
];

export function PhotosApp() {
    const [photos, setPhotos] = useState<Photo[]>(DEFAULT_PHOTOS);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        handleFiles(files);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = (files: File[]) => {
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    const newPhoto: Photo = {
                        id: Date.now().toString() + Math.random().toString(),
                        name: file.name,
                        url: e.target.result as string
                    };
                    setPhotos(prev => [newPhoto, ...prev]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    return (
        <div
            className="flex flex-col h-full bg-white relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Toolbar */}
            <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-gray-50/80 backdrop-blur-md z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <ImageIcon size={20} className="text-blue-500" />
                    <h2 className="font-semibold text-gray-800">Photos</h2>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                    <UploadCloud size={16} /> Upload
                </button>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileInput}
                />
            </div>

            {/* Masonry Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                {photos.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon size={48} className="mb-4 opacity-50" />
                        <p>No photos yet</p>
                    </div>
                ) : (
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                        {photos.map(photo => (
                            <motion.div
                                key={photo.id}
                                layoutId={`photo-${photo.id}`}
                                className="relative group cursor-pointer break-inside-avoid rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                onClick={() => setSelectedPhoto(photo)}
                            >
                                <img src={photo.url} alt={photo.name} className="w-full h-auto object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ZoomIn size={24} className="text-white drop-shadow-lg" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Drag Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-blue-500/20 backdrop-blur-sm border-2 border-blue-500 border-dashed rounded-lg m-4 flex flex-col items-center justify-center pointer-events-none"
                    >
                        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                            <UploadCloud size={48} className="text-blue-500 animate-bounce" />
                            <h3 className="text-xl font-bold text-gray-800">Drop Images Here</h3>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fullscreen Preview Overlay */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center"
                    >
                        <button
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            <X size={24} />
                        </button>
                        <motion.img
                            layoutId={`photo-${selectedPhoto.id}`}
                            src={selectedPhoto.url}
                            alt={selectedPhoto.name}
                            className="max-w-[90%] max-h-[90%] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
