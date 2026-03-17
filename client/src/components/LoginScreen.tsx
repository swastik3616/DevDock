import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LoginScreenProps {
  onLogin: (user: string) => void;
  onShutdown?: () => void;
}

export function LoginScreen({ onLogin, onShutdown }: LoginScreenProps) {
    const [username, setUsername] = useState('guest');
    const [password, setPassword] = useState('guest');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Try API first; fall back to guest auth if offline
            const { default: api } = await import('../services/api');
            const response = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', response.data.token);
            onLogin(username);
        } catch (err: any) {
            // Allow guest / guest offline login
            if (username === 'guest' && password === 'guest') {
                onLogin(username);
            } else {
                setError(err.response?.data?.message || 'Login failed');
            }
        }
    };

    return (
        <div
            className="w-screen h-screen flex flex-col items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1611083360739-bdad6e0eb1fa?q=80&w=2600&auto=format&fit=crop")' }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-80 p-8 rounded-[2rem] glass-dark flex flex-col items-center gap-6 shadow-2xl border border-white/20"
            >
                <div className="w-20 h-20 rounded-full glass flex items-center justify-center text-4xl text-white shadow-inner">
                    
                </div>

                <h1 className="text-white text-xl font-bold">AquaDesk</h1>

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full h-10 px-4 rounded-lg bg-white/10 border border-white/20 text-white outline-none focus:bg-white/20 transition-colors"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-10 px-4 rounded-lg bg-white/10 border border-white/20 text-white outline-none focus:bg-white/20 transition-colors"
                    />
                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full h-10 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors shadow-lg"
                    >
                        Log In
                    </button>
                </form>

                <p className="text-white/40 text-xs">Guest User: guest / guest</p>
            </motion.div>

            <div className="fixed bottom-10 flex gap-8 text-white/60 text-sm font-medium">
                <span className="cursor-pointer hover:text-white transition-colors">Restart</span>
                <span
                    className="cursor-pointer hover:text-red-400 transition-colors"
                    onClick={() => onShutdown?.()}
                >
                    Shut Down
                </span>
            </div>
        </div>
    );
}
