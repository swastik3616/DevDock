import { useEffect, useState, useRef } from 'react';

type Phase = 'idle' | 'opening' | 'booting' | 'os' | 'shutdown' | 'closing';

interface MacBookIntroProps {
  onReady: () => void;
  onShutdown: () => void;
  triggerShutdown: boolean;
}

const W = 480;
const LH = 300;
const BH = 278;

export function MacBookIntro({ onReady, onShutdown, triggerShutdown }: MacBookIntroProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [lidAngle, setLidAngle] = useState(0);
  const [floatY, setFloatY] = useState(0);
  const [rockY, setRockY] = useState(0);

  // Two separate rAF refs: one for idle loop, one for lid animation
  const idleRef = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const phaseRef = useRef<Phase>('idle');

  const setPhaseSync = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const stopIdle = () => {
    if (idleRef.current) { cancelAnimationFrame(idleRef.current); idleRef.current = null; }
  };
  const stopAnim = () => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
  };

  /* ─── Idle float animation ─── */
  useEffect(() => {
    if (phase !== 'idle') return;
    let t = 0;
    const tick = () => {
      t += 0.01;
      setFloatY(Math.sin(t) * 12);
      setRockY(Math.sin(t * 0.6) * 8);
      idleRef.current = requestAnimationFrame(tick);
    };
    idleRef.current = requestAnimationFrame(tick);
    return stopIdle; // cleanup stops ONLY the idle loop
  }, [phase]);

  /* ─── Shutdown trigger ─── */
  useEffect(() => {
    if (triggerShutdown && phaseRef.current === 'os') startShutdown();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerShutdown]);

  /* ─── Click to power on ─── */
  const handleClick = () => {
    if (phaseRef.current !== 'idle' || busyRef.current) return;
    busyRef.current = true;
    stopIdle();
    setFloatY(0); setRockY(0);
    setPhaseSync('opening');

    // Use setTimeout 0 so React flushes the phase update before rAF starts
    setTimeout(() => {
      animateLid(0, 105, 1.8, () => {
        setPhaseSync('booting');
        setTimeout(() => {
          setPhaseSync('os');
          onReady();
        }, 2400);
      });
    }, 0);
  };

  /* ─── Shutdown ─── */
  const startShutdown = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPhaseSync('shutdown');
    setTimeout(() => {
      setPhaseSync('closing');
      animateLid(105, 0, 1.8, () => {
        setPhaseSync('idle');
        busyRef.current = false;
        onShutdown();
      });
    }, 2600);
  };

  /* ─── Lid animation (uses separate animRef) ─── */
  const animateLid = (from: number, to: number, duration: number, onDone: () => void) => {
    stopAnim();
    const steps = Math.round(duration * 60);
    let i = 0;
    const tick = () => {
      i++;
      const p = i / steps;
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setLidAngle(from + (to - from) * e);
      if (i < steps) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setLidAngle(to);
        animRef.current = null;
        onDone();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  };

  if (phase === 'os') return null;

  const screenLit = phase === 'booting' || phase === 'shutdown' || phase === 'closing';
  const screenOpacity = screenLit ? Math.min(1, (lidAngle - 5) / 30) : 0;

  return (
    <div className="mb-scene" onClick={handleClick}>
      <div className="starfield" />
      {phase === 'idle' && <p className="macbook-hint">Click to power on</p>}

      <div
        className="mb-perspective"
        style={{
          transform: `translateY(${floatY}px) rotateX(-22deg) rotateY(${rockY}deg)`,
        }}
      >
        {/* Lid – hinges at the bottom edge of lid (= hinge with base) */}
        <div
          className="mb-lid-wrap"
          style={{
            width: W,
            height: LH,
            transformOrigin: 'bottom center',
            transform: `rotateX(${-lidAngle}deg)`,
          }}
        >
          {/* Screen face */}
          <div className="mb-lid-front" style={{ width: W, height: LH }}>
            <div className="mb-camera" />
            <div
              className="mb-screen"
              style={{ opacity: screenOpacity, flex: 1, width: '100%' }}
            >
              {phase === 'booting' && <BootScreen />}
              {(phase === 'shutdown' || phase === 'closing') && <ShutdownScreen />}
            </div>
          </div>
          {/* Lid back */}
          <div className="mb-lid-back" style={{ width: W, height: LH }}>
            <svg viewBox="0 0 24 24" fill="#555" style={{ width: 44, height: 44 }}>
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          </div>
        </div>

        {/* Base / keyboard */}
        <div className="mb-base" style={{ width: W, height: BH }}>
          <div className="mb-keys">
            {Array.from({ length: 52 }).map((_, i) => <div key={i} className="mb-key" />)}
          </div>
          <div className="mb-trackpad" />
        </div>
      </div>
    </div>
  );
}

function BootScreen() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setProgress(p => Math.min(p + Math.random() * 8 + 2, 100)), 75);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="boot-screen">
      <div className="boot-apple">
        <svg viewBox="0 0 24 24" fill="white" style={{ width: 60, height: 60 }}>
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      </div>
      <div className="boot-bar-track">
        <div className="boot-bar-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function ShutdownScreen() {
  return (
    <div className="shutdown-screen">
      <div className="shutdown-spinner" />
      <p className="shutdown-text">Shutting Down…</p>
    </div>
  );
}
