import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Music } from 'lucide-react';

const TRACKS = [
    {
        title: 'Lofi Study',
        artist: 'FASSounds',
        url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
        cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop'
    },
    {
        title: 'Good Night',
        artist: 'FASSounds',
        url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_1aa513689f.mp3?filename=good-night-160166.mp3',
        cover: 'https://images.unsplash.com/photo-1623625434462-e5e42318ae49?q=80&w=400&auto=format&fit=crop'
    },
    {
        title: 'Indian Tabla & Sitar',
        artist: 'Sonics_Podcasts',
        url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_5aa7954b05.mp3?filename=indian-music-with-sitar-and-tabla-111093.mp3',
        cover: 'https://images.unsplash.com/photo-1590400589332-9df7d01878cf?q=80&w=400&auto=format&fit=crop'
    },
    {
        title: 'Bollywood Melody',
        artist: 'Ashot-Danielyan',
        url: 'https://cdn.pixabay.com/download/audio/2022/11/08/audio_ee4e69bdaf.mp3?filename=indian-traditional-music-124945.mp3',
        cover: 'https://images.unsplash.com/photo-1610192534825-e51f50aebb39?q=80&w=400&auto=format&fit=crop'
    },
    {
        title: 'Desi Lofi Chill',
        artist: 'Coma-Media',
        url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_b2813583fc.mp3?filename=chill-lofi-song-8444.mp3',
        cover: 'https://images.unsplash.com/photo-1601312389146-248aa6174d81?q=80&w=400&auto=format&fit=crop'
    },
    {
        title: 'Sunset in Mumbai',
        artist: 'Semaev',
        url: 'https://cdn.pixabay.com/download/audio/2023/11/26/audio_24483ae59a.mp3?filename=indian-background-music-177218.mp3',
        cover: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=400&auto=format&fit=crop'
    },
    {
        title: 'Himalayan Breeze',
        artist: 'Olexy',
        url: 'https://cdn.pixabay.com/download/audio/2022/12/28/audio_2d5351e6ec.mp3?filename=indian-flute-and-sitar-133544.mp3',
        cover: 'https://images.unsplash.com/photo-1510443900741-94e41ba9e742?q=80&w=400&auto=format&fit=crop'
    },
    {
        title: 'Taj Mahal Nights',
        artist: 'Prazkhanal',
        url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b3cb8dc3.mp3?filename=smooth-waters-115977.mp3',
        cover: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=400&auto=format&fit=crop'
    },
    {
        title: 'Delhi Grooves',
        artist: 'Lepa_Stosic',
        url: 'https://cdn.pixabay.com/download/audio/2023/10/24/audio_dc2cba8ac7.mp3?filename=indian-lounge-172551.mp3',
        cover: 'https://images.unsplash.com/photo-1587413620950-8b1b3693fb1d?q=80&w=400&auto=format&fit=crop'
    },
    {
        title: 'Monsoon Rains',
        artist: 'Grand_Project',
        url: 'https://cdn.pixabay.com/download/audio/2024/01/29/audio_2731835920.mp3?filename=indian-meditation-188613.mp3',
        cover: 'https://images.unsplash.com/photo-1616016168016-168a2bf06cf7?q=80&w=400&auto=format&fit=crop'
    },
    {
        title: 'Spiritual Ganges',
        artist: 'Yurii_Semenyk',
        url: 'https://cdn.pixabay.com/download/audio/2024/02/10/audio_5a85536555.mp3?filename=indian-chants-190623.mp3',
        cover: 'https://images.unsplash.com/photo-1605333469376-788b14a27bc5?q=80&w=400&auto=format&fit=crop'
    },
    {
        title: 'Royal Rajasthan',
        artist: 'SoundGalleryBy',
        url: 'https://cdn.pixabay.com/download/audio/2024/01/18/audio_d1c5d03edb.mp3?filename=indian-summer-185497.mp3',
        cover: 'https://images.unsplash.com/photo-1596422846543-75c6ff1978f4?q=80&w=400&auto=format&fit=crop'
    }
];

export function MusicWidget() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const track = TRACKS[currentTrackIdx];

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const nextTrack = () => {
        setCurrentTrackIdx((prev) => (prev + 1) % TRACKS.length);
        setIsPlaying(true);
        // Play automatically on next 
        setTimeout(() => {
            if (audioRef.current) audioRef.current.play();
        }, 50);
    };

    const prevTrack = () => {
        setCurrentTrackIdx((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
        setIsPlaying(true);
        setTimeout(() => {
            if (audioRef.current) audioRef.current.play();
        }, 50);
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            className="absolute top-20 right-8 z-40 w-64 bg-black/60 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="p-4 flex items-center gap-4">
                <div className="relative">
                    <motion.div
                        animate={{ rotate: isPlaying ? 360 : 0 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 rounded-full overflow-hidden border border-white/10 shadow-lg"
                    >
                        <img src={track.cover} alt="album art" className="w-full h-full object-cover" />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-4 h-4 bg-black/80 rounded-full border border-white/20 backdrop-blur-sm" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{track.title}</h3>
                    <p className="text-xs text-white/50 truncate">{track.artist}</p>

                    <div className="flex divide-x divide-white/10 border border-white/10 rounded-lg mt-3 overflow-hidden bg-white/5">
                        <button onClick={prevTrack} className="flex-1 py-1.5 flex justify-center hover:bg-white/10 transition-colors">
                            <SkipBack size={14} />
                        </button>
                        <button onClick={togglePlay} className="flex-1 py-1.5 flex justify-center hover:bg-white/10 transition-colors">
                            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button onClick={nextTrack} className="flex-1 py-1.5 flex justify-center hover:bg-white/10 transition-colors">
                            <SkipForward size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={track.url}
                onEnded={nextTrack}
            />

            <div className="absolute top-2 right-2 opacity-30 pointer-events-none">
                <Music size={12} />
            </div>
        </motion.div>
    );
}
