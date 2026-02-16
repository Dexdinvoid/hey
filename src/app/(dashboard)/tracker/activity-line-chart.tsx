"use client";

import type { HabitCompletion } from "@prisma/client";

const CHART_HEIGHT = 220;
const CHART_PADDING = { top: 20, right: 24, bottom: 32, left: 40 };

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getYStep(maxVal: number): number {
  if (maxVal <= 1) return 1;
  if (maxVal <= 5) return 1;
  if (maxVal <= 10) return 2;
  if (maxVal <= 20) return 5;
  return Math.ceil(maxVal / 5);
}

type Props = {
  completions: Pick<HabitCompletion, "completedAt">[];
};

export function ActivityLineChart({ completions }: Props) {
  const byDate = new Map<string, number>();
  for (const c of completions) {
    const d = new Date(c.completedAt);
    const key = toDateKey(d);
    byDate.set(key, (byDate.get(key) ?? 0) + 1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  startOfYear.setHours(0, 0, 0, 0);

  const points: { date: Date; count: number }[] = [];
  const d = new Date(startOfYear);
  while (d <= today) {
    const key = toDateKey(d);
    points.push({ date: new Date(d), count: byDate.get(key) ?? 0 });
    d.setDate(d.getDate() + 1);
  }

  const numPoints = points.length;
  const maxCount = Math.max(1, ...points.map((p) => p.count));
  const yStep = getYStep(maxCount);
  const yMax = Math.max(maxCount, yStep);
  const yTicks: number[] = [];
  for (let v = 0; v <= yMax; v += yStep) yTicks.push(v);
  if (yTicks[yTicks.length - 1] < maxCount) yTicks.push(yTicks[yTicks.length - 1] + yStep);

  const width = 640;
  const innerWidth = width - CHART_PADDING.left - CHART_PADDING.right;
  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  const toX = (i: number) =>
    numPoints <= 1
      ? CHART_PADDING.left
      : CHART_PADDING.left + (i / (numPoints - 1)) * innerWidth;
  const toY = (count: number) =>
    CHART_PADDING.top + innerHeight - (count / yMax) * innerHeight;

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.count)}`)
    .join(" ");
  const areaD = `${pathD} L ${toX(numPoints - 1)} ${CHART_PADDING.top + innerHeight} L ${toX(0)} ${CHART_PADDING.top + innerHeight} Z`;

  const gridColor = "rgba(255,255,255,0.12)";
  const labelColor = "rgba(255,255,255,0.5)";

  // Month boundaries for X-axis (first day of each month that appears in range)
  const monthTicks: { index: number; label: string }[] = [];
  let lastMonth = -1;
  points.forEach((p, i) => {
    const m = p.date.getMonth();
    if (m !== lastMonth) {
      monthTicks.push({ index: i, label: p.date.toLocaleDateString("en-US", { month: "short" }) });
      lastMonth = m;
    }
  });

  const showDots = numPoints <= 60;

  return (
    <div className="w-full py-2">
      <svg
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        className="w-full h-[220px] block"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="lineChartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(251, 146, 60)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(251, 146, 60)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = CHART_PADDING.top + innerHeight - (tick / yMax) * innerHeight;
          return (
            <g key={tick}>
              <line
                x1={CHART_PADDING.left}
                y1={y}
                x2={width - CHART_PADDING.right}
                y2={y}
                stroke={gridColor}
                strokeWidth="1"
              />
              <text
                x={CHART_PADDING.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill={labelColor}
              >
                {tick}
              </text>
            </g>
          );
        })}

        {monthTicks.map(({ index }) => {
          const x = toX(index);
          return (
            <line
              key={index}
              x1={x}
              y1={CHART_PADDING.top}
              x2={x}
              y2={CHART_PADDING.top + innerHeight}
              stroke={gridColor}
              strokeWidth="1"
            />
          );
        })}

        <path d={areaD} fill="url(#lineChartGradient)" />
        <polyline
          points={points.map((p, i) => `${toX(i)},${toY(p.count)}`).join(" ")}
          fill="none"
          stroke="rgb(251, 146, 60)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {showDots &&
          points.map((p, i) => (
            <circle
              key={i}
              cx={toX(i)}
              cy={toY(p.count)}
              r="4"
              fill="rgb(251, 146, 60)"
            />
          ))}
      </svg>

      <div className="flex justify-between text-[11px] mt-3 w-full text-white/50">
        {monthTicks.map(({ index, label }) => (
          <span key={index} style={{ marginLeft: index === 0 ? 0 : undefined }}>
            {label}
          </span>
        ))}
      </div>

      <p className="text-white/50 text-xs mt-4">
        Completions per day · {startOfYear.toLocaleDateString("en-US", { month: "short", year: "numeric" })} – today
      </p>
    </div>
  );
}
