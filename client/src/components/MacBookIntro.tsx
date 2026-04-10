import { useEffect, useState, useRef } from 'react';

type Phase =
  | 'closed'    // Full-screen Apple logo (back of lid)
  | 'opening'   // Lid swinging open + MacBook scaling into view
  | 'booting'   // MacBook fully open, front-facing, boot animation
  | 'os'        // Hidden – OS has taken over
  | 'shutdown'  // Screen fading to black
  | 'closing';  // Lid swinging shut

interface MacBookIntroProps {
  onReady: () => void;
  onShutdown: () => void;
  triggerShutdown: boolean;
}

const W = 520;
const LH = 325;
const BH = 290;

export function MacBookIntro({ onReady, onShutdown, triggerShutdown }: MacBookIntroProps) {
  const [phase, setPhase] = useState<Phase>('closed');
  const [lidAngle, setLidAngle] = useState(180);
  // Controls how much the MacBook has "scaled into view" during opening
  const [revealProgress, setRevealProgress] = useState(0); // 0 = closed fullscreen, 1 = laptop visible

  const animRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const phaseRef = useRef<Phase>('closed');

  const setPhaseSync = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const stopAnim = () => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
  };

  /* ─── Lid animation ─── */
  const animateLid = (from: number, to: number, duration: number, onDone: () => void) => {
    stopAnim();
    const steps = Math.round(duration * 60);
    let i = 0;
    const tick = () => {
      i++;
      const p = i / steps;
      // Ease in-out cubic
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setLidAngle(from + (to - from) * e);
      setRevealProgress(e);
      if (i < steps) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setLidAngle(to);
        setRevealProgress(1);
        animRef.current = null;
        onDone();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  };

  /* ─── Shutdown trigger ─── */
  useEffect(() => {
    if (triggerShutdown && phaseRef.current === 'os') startShutdown();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerShutdown]);

  /* ─── Click the Apple logo to open ─── */
  const handleClick = () => {
    if (phaseRef.current !== 'closed' || busyRef.current) return;
    busyRef.current = true;
    setPhaseSync('opening');

    setTimeout(() => {
      animateLid(180, 90, 2.0, () => {
        setPhaseSync('booting');
        setTimeout(() => {
          setPhaseSync('os');
          busyRef.current = false;
          onReady();
        }, 2600);
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
      animateLid(90, 180, 2.0, () => {
        setRevealProgress(0);
        setPhaseSync('closed');
        busyRef.current = false;
        onShutdown();
      });
    }, 2400);
  };

  /* ─── Derived visuals ─── */
  // During closing, revealProgress goes 1→0, so we invert
  const isClosing = phase === 'closing' || phase === 'shutdown';
  const rp = isClosing ? 1 - revealProgress : revealProgress;

  const screenLit = phase === 'booting' || phase === 'shutdown' || phase === 'closing';
  const screenOpacity = screenLit ? Math.min(1, (lidAngle - 5) / 30) : 0;

  // Phase 'os' → invisible
  if (phase === 'os') return null;

  // ── Closed state: full-screen Apple logo ──
  if (phase === 'closed') {
    return (
      <div className="mbi-closed-screen" onClick={handleClick}>
        <div className="mbi-closed-glow" />
        <div className="mbi-apple-wrap">
          <svg viewBox="0 0 814 1000" fill="url(#appleGrad)" className="mbi-apple-svg">
            <defs>
              <linearGradient id="appleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d0d0d0" />
                <stop offset="50%" stopColor="#a8a8a8" />
                <stop offset="100%" stopColor="#787878" />
              </linearGradient>
            </defs>
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49.1 190.5-49.1zM549.1 87.2c32.3-38.5 56.5-92.3 56.5-146.1 0-7.5-.6-15.1-2-21.7-53.6 2-117 35.6-155.5 79.4-29.6 33.4-58.1 87.2-58.1 141.9 0 8.1 1.4 16.3 2 19.4 3.2.6 8.1 1.4 13 1.4 48.4 0 109.6-32.3 144.1-74.3z"/>
          </svg>
          <p className="mbi-closed-hint">Click to open</p>
        </div>
      </div>
    );
  }

  // ── Opening / Booting / Closing / Shutdown states ──
  // The MacBook scales in from "fullscreen back view" → proper laptop size
  // rp: 0 = just starting (large, back-facing), 1 = fully open (laptop size)
  const ease = rp;

  // Scale: start huge (so only Apple logo fills screen), shrink to normal
  const scale = 2.2 - ease * 1.2; // 2.2 → 1.0
  // Perspective tilt: 0 = face-on vertical, 70 = base lies flat on a desk
  const tiltX = ease * 70;
  const tiltY = ease * 0;

  return (
    <div className="mbi-scene">
      <div className="starfield" />

      <div
        className="mb-perspective"
        style={{
          transform: `scale(${scale}) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: phase === 'booting' ? 'transform 0.6s ease' : 'none',
        }}
      >
        {/* Lid – hinges at bottom */}
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

          {/* Lid back (Apple logo) */}
          <div className="mb-lid-back" style={{ width: W, height: LH }}>
            <svg viewBox="0 0 24 24" fill="#666" style={{ width: 48, height: 48 }}>
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
