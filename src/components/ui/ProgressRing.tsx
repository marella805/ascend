'use client';

interface ProgressRingProps {
  value: number; // 0–100
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ value, color = '#C6F135', size = 44, strokeWidth = 3.5 }: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#23282F" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className="anim-ring"
      />
    </svg>
  );
}
