import { useEffect, useState, useRef } from 'react';

type Phase = 'idle' | 'opening' | 'booting' | 'os' | 'shutdown' | 'closing';

interface MacBookIntroProps {
  onReady: () => void;
  onShutdown: () => void;
  triggerShutdown: boolean;
}

export function MacBookIntro({ onReady, onShutdown, triggerShutdown }: MacBookIntroProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [lidAngle, setLidAngle] = useState(270);   // 270 = fully closed, 180 = fully open flat
  const [floatY, setFloatY] = useState(0);
  const [rockY, setRockY] = useState(0);
  const animRef = useRef<number | null>(null);
  const busyRef = useRef(false);

  const cancelAnim = () => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
  };

  /* ─── Idle float + gentle rock ─── */
  useEffect(() => {
    if (phase !== 'idle') return;
    busyRef.current = false;
    let t = 0;
    const tick = () => {
      t += 0.01;
      setFloatY(Math.sin(t) * 14);
      setRockY(Math.sin(t * 0.55) * 10);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return cancelAnim;
  }, [phase]);

  /* ─── External shutdown trigger ─── */
  useEffect(() => {
    if (triggerShutdown && phase === 'os') startShutdown();
  }, [triggerShutdown]); // eslint-disable-line

  /* ─── Click to open ─── */
  const handleClick = () => {
    if (phase !== 'idle' || busyRef.current) return;
    busyRef.current = true;
    cancelAnim();
    setFloatY(0);
    setRockY(0);
    setPhase('opening');
    animateLid(270, 155, 1.6, () => {
      setPhase('booting');
      setTimeout(() => {
        setPhase('os');
        onReady();
      }, 2400);
    });
  };

  /* ─── Shutdown ─── */
  const startShutdown = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPhase('shutdown');
    setTimeout(() => {
      setPhase('closing');
      animateLid(155, 270, 1.6, () => {
        setPhase('idle');
        busyRef.current = false;
        onShutdown();
      });
    }, 2600);
  };

  /* ─── Eased lid animation ─── */
  const animateLid = (from: number, to: number, duration: number, onDone: () => void) => {
    const steps = duration * 60;
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
        onDone();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  };

  if (phase === 'os') return null;

  const screenLit = phase === 'booting' || phase === 'shutdown' || phase === 'closing';

  return (
    <div className="mb-scene" onClick={handleClick}>
      <div className="starfield" />

      {phase === 'idle' && (
        <p className="macbook-hint">Click to power on</p>
      )}

      {/* ── MacBook 3-D model ── */}
      <div
        className="mb-outer"
        style={{
          transform: `translateY(${floatY}px) rotateX(-22deg) rotateY(${rockY}deg)`,
        }}
      >
        {/* Lid (hinges at top of base, rotates on X) */}
        <div className="mb-lid" style={{ transform: `rotateX(${lidAngle}deg)` }}>
          <div className="mb-lid-front">
            <div className="mb-camera" />
            <div className="mb-screen" style={{ opacity: screenLit ? 1 : 0 }}>
              {phase === 'booting' && <BootScreen />}
              {(phase === 'shutdown' || phase === 'closing') && <ShutdownScreen />}
            </div>
          </div>
          <div className="mb-lid-back">
            <AppleLogo size={40} color="#555" />
          </div>
        </div>

        {/* Base / keyboard */}
        <div className="mb-base">
          <div className="mb-keys">
            {Array.from({ length: 52 }).map((_, i) => <div key={i} className="mb-key" />)}
          </div>
          <div className="mb-trackpad" />
        </div>
      </div>
    </div>
  );
}

function AppleLogo({ size = 36, color = 'white' }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} style={{ width: size, height: size }}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function BootScreen() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 8 + 2, 100));
    }, 75);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="boot-screen">
      <div className="boot-apple"><AppleLogo size={60} color="white" /></div>
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
