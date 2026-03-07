import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Mic, X } from 'lucide-react';

export function SiriApp() {
    const { isSiriOpen, toggleSiri, openApp } = useAppStore();
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [reply, setReply] = useState('How can I help you?');
    const [recognition, setRecognition] = useState<any>(null);

    const speakReply = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    const processCommand = useCallback((text: string) => {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('open safari') || lowerText.includes('browser') || lowerText.includes('internet')) {
            setReply('Opening Safari...');
            speakReply('Opening Safari');
            openApp('safari', 'Safari', 'safari');
            setTimeout(toggleSiri, 2000);
        } else if (lowerText.includes('open calculator') || lowerText.includes('calc')) {
            setReply('Opening Calculator...');
            speakReply('Opening Calculator');
            openApp('calc', 'Calculator', 'calc');
            setTimeout(toggleSiri, 2000);
        } else if (lowerText.includes('open finder') || lowerText.includes('files') || lowerText.includes('documents')) {
            setReply('Opening Finder...');
            speakReply('Here are your files');
            openApp('finder', 'Finder', 'finder');
            setTimeout(toggleSiri, 2000);
        } else if (lowerText.includes('close siri') || lowerText.includes('stop') || lowerText.includes('nevermind')) {
            toggleSiri();
        } else {
            setReply("I heard you say: '" + text + "'. I can only open apps right now.");
            speakReply("I can only open apps right now.");
        }
    }, [openApp, toggleSiri]);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const rec = new SpeechRec();
            rec.continuous = true; // Wait longer for the user to speak
            rec.interimResults = true;
            rec.lang = 'en-US';

            rec.onstart = () => setIsListening(true);

            rec.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }

                // If we have a final transcript, set it. Otherwise just show interim.
                if (finalTranscript) {
                    setTranscript(finalTranscript);
                    // Force processing immediately when we have a final result
                    processCommand(finalTranscript);
                    rec.stop(); // Stop listening after a successful command
                } else {
                    const current = event.resultIndex;
                    setTranscript(event.results[current][0].transcript);
                }
            };

            rec.onend = () => {
                setIsListening(false);
            };

            rec.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    setReply("Please allow microphone access.");
                } else if (event.error === 'no-speech') {
                    setReply("I didn't hear anything. Try clicking again.");
                    // Don't auto-stop on no-speech if continuous is true, but just in case:
                    rec.stop();
                } else {
                    setReply(`Error: ${event.error}`);
                }
            };

            setRecognition(rec);
        } else {
            setReply("Sorry, your browser doesn't support voice recognition.");
        }
    }, [processCommand]);

    useEffect(() => {
        if (!isListening && transcript) {
            processCommand(transcript);
        }
    }, [isListening, transcript, processCommand]);

    const handleListen = () => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
        } else {
            setTranscript('');
            setReply('Listening...');
            try {
                recognition.start();
            } catch (e) {
                console.error("Failed to start", e);
            }
        }
    };

    // Stop listening when Siri is closed
    useEffect(() => {
        if (!isSiriOpen && isListening && recognition) {
            recognition.stop();
        }
        if (isSiriOpen) {
            setTranscript('');
            setReply('How can I help you?');
            handleListen(); // Auto-start listening when opened
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSiriOpen]);

    if (!isSiriOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-12 right-4 z-[3000] w-72 rounded-2xl p-4 glass-dark shadow-2xl border border-white/20 flex flex-col items-center gap-4 text-white overflow-hidden"
            >
                {/* Close Button */}
                <button
                    onClick={toggleSiri}
                    className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full transition-colors opacity-50 hover:opacity-100"
                >
                    <X size={14} />
                </button>

                {/* Siri Orb / Visualizer */}
                <div
                    onClick={handleListen}
                    className="relative w-20 h-20 rounded-full flex items-center justify-center cursor-pointer group mt-2"
                >
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-cyan-500 blur-md transition-all duration-500 ${isListening ? 'opacity-100 scale-110 animate-pulse' : 'opacity-60 scale-100 group-hover:scale-105 group-hover:opacity-80'}`} />
                    <div className={`absolute inset-1 rounded-full bg-black/40 backdrop-blur-sm z-10`} />
                    <Mic size={24} className={`z-20 transition-all duration-300 ${isListening ? 'text-white' : 'text-white/70'}`} />
                </div>

                {/* Text Feedback */}
                <div className="text-center space-y-2 mb-2 w-full">
                    <p className="text-[13px] font-medium opacity-90 h-10 flex items-center justify-center">
                        {reply}
                    </p>
                    {transcript && (
                        <p className="text-[11px] opacity-60 italic truncate px-2">
                            "{transcript}"
                        </p>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
