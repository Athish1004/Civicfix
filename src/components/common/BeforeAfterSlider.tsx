import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  subtitle?: string;
  height?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Before: Reported Hazard',
  afterLabel = 'After: Municipal Repair Verified',
  title = 'Interactive Before / After Resolution Inspection',
  subtitle = 'Drag the slider to inspect the verified field transformation',
  height = 'h-72 sm:h-96',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            {title}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Before
          </span>
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fixed
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className={`relative ${height} w-full rounded-xl overflow-hidden select-none cursor-ew-resize border border-slate-200 shadow-inner`}
      >
        {/* After Image (Background) */}
        <img
          src={afterImage}
          alt="After resolution"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 text-[11px] font-bold shadow-md flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{afterLabel}</span>
        </div>

        {/* Before Image (Clipped Overlay) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt="Before resolution"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%', maxWidth: 'none' }}
          />
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/40 text-[11px] font-bold shadow-md flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{beforeLabel}</span>
          </div>
        </div>

        {/* Vertical Divider Line with handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none transition-transform z-20 flex items-center justify-center"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-8 h-8 rounded-full bg-slate-950 text-teal-400 border-2 border-white shadow-xl flex items-center justify-center font-bold text-xs">
            ⇄
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
        <span>◀ Drag left for "After"</span>
        <span className="italic">Click & drag slider across image</span>
        <span>Drag right for "Before" ▶</span>
      </div>
    </div>
  );
};
