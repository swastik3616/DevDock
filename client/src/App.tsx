import { Desktop } from './components/Desktop';
import { Window } from './components/Window';
import { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { NotesApp } from './apps/NotesApp';
import { TerminalApp } from './apps/TerminalApp';
import { FinderApp } from './apps/FinderApp';
import { CalculatorApp } from './apps/CalculatorApp';
import { SafariApp } from './apps/SafariApp';
import { SiriApp } from './apps/SiriApp';
import { MailApp } from './apps/MailApp';
import { SettingsApp } from './apps/SettingsApp';
import { JarvisApp } from './apps/JarvisApp';
import { PhotosApp } from './apps/PhotosApp';
import { LoginScreen } from './components/LoginScreen';
import { MacBookIntro } from './components/MacBookIntro';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { windows, currentUser, setAuth, isAsleep, toggleSleep, theme, isShuttingDown, shutdown } = useAppStore();

  // Whether the MacBook intro is showing (true = 3D MacBook visible)
  const [macBookPhase, setMacBookPhase] = useState<'intro' | 'os'>('intro');
  // Trigger the MacBook lid-close sequence from within the OS
  const [triggerShutdown, setTriggerShutdown] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // When the OS store signals shutdown, pass it to MacBookIntro
  useEffect(() => {
    if (isShuttingDown && macBookPhase === 'os') {
      setTriggerShutdown(true);
    }
  }, [isShuttingDown]);

  const handleMacReady = () => {
    // MacBook lid is open & boot done → show the OS
    setMacBookPhase('os');
  };

  const handleMacShutdownComplete = () => {
    // MacBook lid fully closed → reset everything
    setTriggerShutdown(false);
    setMacBookPhase('intro');
    setAuth(null);
    // Reset shutdown flag in store
    useAppStore.setState({ isShuttingDown: false, windows: [], currentUser: null });
  };

  const renderAppContent = (id: string) => {
    switch (id) {
      case 'finder':
        return <FinderApp />;
      case 'notes':
        return <NotesApp />;
      case 'terminal':
        return <TerminalApp />;
      case 'calc':
        return <CalculatorApp />;
      case 'safari':
        return <SafariApp />;
      case 'mail':
        return <MailApp />;
      case 'settings':
        return <SettingsApp />;
      case 'jarvis':
        return <JarvisApp />;
      case 'photos':
        return <PhotosApp />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* ── 3-D MacBook Intro (always mounted; hides itself when phase===os) ── */}
      <MacBookIntro
        onReady={handleMacReady}
        onShutdown={handleMacShutdownComplete}
        triggerShutdown={triggerShutdown}
      />

      {/* ── OS Layer – only rendered after MacBook is open ── */}
      <AnimatePresence>
        {macBookPhase === 'os' && (
          <motion.div
            key="os-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'fixed', inset: 0, zIndex: 1 }}
          >
            {!currentUser ? (
              <LoginScreen onLogin={setAuth} onShutdown={shutdown} />
            ) : (
              <>
                <Desktop>
                  {windows.map((win) => (
                    <Window key={win.id} id={win.id} title={win.title}>
                      {renderAppContent(win.id)}
                    </Window>
                  ))}
                </Desktop>
                <SiriApp />

                {/* Sleep Mode Overlay */}
                <AnimatePresence>
                  {isAsleep && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      onClick={toggleSleep}
                      className="fixed inset-0 bg-black z-[9999] cursor-pointer flex items-center justify-center"
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        transition={{ delay: 2, duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        className="text-white text-sm"
                      >
                        Click anywhere to wake
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
