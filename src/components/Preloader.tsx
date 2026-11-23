import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

export function Preloader() {
  const { active, progress, loaded, total } = useProgress();
  const [dismissed, setDismissed] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    setDisplayProgress((prev) => Math.max(prev, Math.round(progress)));
  }, [progress]);

  useEffect(() => {
    const isComplete = !active && (progress >= 100 || (total > 0 && loaded >= total));
    if (isComplete) {
      setDisplayProgress(100);
      const timer = window.setTimeout(() => setDismissed(true), 450);
      return () => window.clearTimeout(timer);
    }

    // Safety fallback so UI never hangs indefinitely if a browser caches instantly
    const safety = window.setTimeout(() => {
      if (!active) {
        setDisplayProgress(100);
        setDismissed(true);
      }
    }, 3500);
    return () => window.clearTimeout(safety);
  }, [active, progress, loaded, total]);

  if (dismissed) return null;

  const isDone = displayProgress >= 100 && !active;

  return (
    <div
      aria-live="polite"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F5F2EB] px-6 transition-opacity duration-500 ${
        isDone ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-sm text-center">
        <span className="inline-block rounded-full border border-[#A88B68]/40 bg-white/70 px-3 py-1 text-[10px] font-semibold tracking-[0.22em] uppercase text-[#8C7150]">
          Concept Demo · 3D Showcase
        </span>

        <h2 className="font-display mt-5 text-3xl sm:text-4xl font-medium tracking-[0.06em] text-[#18181B]">
          VERDANT SKY RESIDENCE
        </h2>
        <p className="mt-2 text-xs tracking-wide text-stone-500">
          Menyiapkan ruang 1-Bedroom Japandi Modern Luxury (48 m²)…
        </p>

        <div className="mt-8">
          <div className="flex items-center justify-between text-[11px] font-medium text-stone-500">
            <span>Memuat aset arsitektur 3D</span>
            <span className="tabular-nums font-semibold text-[#18181B]">
              {displayProgress}%
            </span>
          </div>
          <div className="mt-2 h-[2px] w-full overflow-hidden rounded-full bg-stone-300/70">
            <div
              className="h-full rounded-full bg-[#18181B] transition-all duration-300 ease-out"
              style={{ width: `${Math.max(4, displayProgress)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
