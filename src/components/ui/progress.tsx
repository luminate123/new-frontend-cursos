interface ProgressProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function Progress({ value, className = '', showLabel = false }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-1.5 flex-1 rounded-full bg-[#1e2d4a]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-400 tabular-nums">{clamped}%</span>
      )}
    </div>
  );
}
