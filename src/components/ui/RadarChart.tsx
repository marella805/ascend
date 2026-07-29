'use client';

interface RadarChartProps {
  str: number;
  end: number;
  mob: number;
  con: number;
  size?: number;
}

const LABELS = [
  { key: 'str', label: 'STR', color: '#FF5A3C' },
  { key: 'end', label: 'END', color: '#3CC5FF' },
  { key: 'mob', label: 'MOB', color: '#B57BFF' },
  { key: 'con', label: 'CON', color: '#FFC53C' },
] as const;

function polarToXY(angle: number, r: number, cx: number, cy: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function RadarChart({ str, end, mob, con, size = 220 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;
  const values = [str, end, mob, con];
  const angles = [0, 90, 180, 270];

  // Grid rings at 25, 50, 75, 100
  const rings = [0.25, 0.5, 0.75, 1];

  const gridPolygons = rings.map(frac => {
    const pts = angles.map(a => {
      const { x, y } = polarToXY(a, maxR * frac, cx, cy);
      return `${x},${y}`;
    });
    return pts.join(' ');
  });

  // Data polygon
  const dataPoints = values.map((v, i) => {
    const frac = Math.max(0, Math.min(100, v)) / 100;
    return polarToXY(angles[i], maxR * frac, cx, cy);
  });
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Axis lines
  const axisLines = angles.map(a => {
    const end = polarToXY(a, maxR, cx, cy);
    return { x1: cx, y1: cy, x2: end.x, y2: end.y };
  });

  // Label positions
  const labelOffset = maxR + 20;
  const labelPositions = LABELS.map((l, i) => {
    const { x, y } = polarToXY(angles[i], labelOffset, cx, cy);
    return { ...l, x, y, value: values[i] };
  });

  return (
    <svg width={size} height={size} style={{ overflow: 'visible', display: 'block', margin: '0 auto' }}>
      {/* Grid */}
      {gridPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="#23282F" strokeWidth={1} />
      ))}
      {/* Axes */}
      {axisLines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#23282F" strokeWidth={1} />
      ))}
      {/* Data fill */}
      <polygon
        points={dataPolygon}
        fill="rgba(198,241,53,0.08)"
        stroke="#C6F135"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={LABELS[i].color} />
      ))}
      {/* Labels */}
      {labelPositions.map(l => (
        <g key={l.key} textAnchor="middle">
          <text
            x={l.x}
            y={l.y - 6}
            fontSize={9}
            letterSpacing="0.12em"
            fill="#8A939C"
            fontFamily="'Oswald', sans-serif"
          >
            {l.label}
          </text>
          <text
            x={l.x}
            y={l.y + 8}
            fontSize={14}
            fill={l.color}
            fontFamily="'Oswald', sans-serif"
            fontWeight={600}
          >
            {l.value}
          </text>
        </g>
      ))}
    </svg>
  );
}
