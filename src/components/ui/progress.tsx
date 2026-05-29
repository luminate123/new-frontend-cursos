interface ProgressProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function Progress({ value, className = '', showLabel = false }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-1.5 flex-1 rounded-full bg-[#c9beab]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-stone-800 to-stone-600 transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-stone-600 tabular-nums">{clamped}%</span>
      )}
    </div>
  );
}
