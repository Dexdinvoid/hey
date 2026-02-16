"use client";

import type { HabitCompletion } from "@prisma/client";

const WEEKS_IN_YEAR = 53;
const DAYS_IN_WEEK = 7;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getGreenStyle(count: number, maxCount: number, isFuture: boolean): string {
  if (isFuture) return "rgba(255,255,255,0.06)";
  if (count === 0) return "rgba(255,255,255,0.08)";
  const level = maxCount <= 1 ? 1 : Math.min(4, Math.ceil((count / maxCount) * 4));
  const greens = [
    "rgb(14, 68, 41)",
    "rgb(0, 109, 50)",
    "rgb(38, 166, 65)",
    "rgb(57, 211, 83)",
  ];
  return greens[level - 1];
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Props = {
  completions: Pick<HabitCompletion, "completedAt">[];
};

export function Heatmap({ completions }: Props) {
  const byDate = new Map<string, number>();
  for (const c of completions) {
    const d = new Date(c.completedAt);
    const key = toDateKey(d);
    byDate.set(key, (byDate.get(key) ?? 0) + 1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const jan1 = new Date(year, 0, 1);
  jan1.setHours(0, 0, 0, 0);
  const start = new Date(jan1);
  start.setDate(jan1.getDate() - jan1.getDay());
  start.setHours(0, 0, 0, 0);

  const grid: { date: Date; count: number }[][] = [];
  for (let row = 0; row < DAYS_IN_WEEK; row++) {
    const weekRow: { date: Date; count: number }[] = [];
    for (let col = 0; col < WEEKS_IN_YEAR; col++) {
      const d = new Date(start);
      d.setDate(d.getDate() + col * DAYS_IN_WEEK + row);
      const key = toDateKey(d);
      weekRow.push({ date: d, count: byDate.get(key) ?? 0 });
    }
    grid.push(weekRow);
  }

  const allCounts = grid.flatMap((r) => r.map((c) => c.count));
  const maxCount = Math.max(1, ...allCounts);
  const hasAny = completions.length > 0;

  let lastMonth = -1;
  const monthLabels: string[] = [];
  for (let col = 0; col < WEEKS_IN_YEAR; col++) {
    const d = new Date(start);
    d.setDate(d.getDate() + col * DAYS_IN_WEEK);
    const m = d.getMonth();
    monthLabels.push(m !== lastMonth ? d.toLocaleDateString("en-US", { month: "short" }) : "");
    lastMonth = m;
  }

  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <div
        className="grid gap-x-2 gap-y-1.5"
        style={{
          gridTemplateColumns: "auto 1fr",
          gridTemplateRows: "auto 1fr",
          width: "max-content",
          maxWidth: "100%",
          marginRight: "auto",
        }}
      >
        <div className="w-10 shrink-0" aria-hidden />

        <div
          className="grid gap-[2px]"
          style={{ gridTemplateColumns: `repeat(${WEEKS_IN_YEAR}, minmax(6px, 12px))` }}
        >
          {monthLabels.map((label, i) => (
            <div key={i} className="text-[10px] text-white/50 truncate text-center">
              {label}
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-between text-[10px] text-white/50 shrink-0 py-0.5 w-10">
          {DAY_LABELS.map((label, i) => (
            <span key={i} className="leading-none">
              {label}
            </span>
          ))}
        </div>

        <div
          className="grid gap-[2px] min-w-0"
          style={{
            gridTemplateColumns: `repeat(${WEEKS_IN_YEAR}, minmax(8px, 1fr))`,
            gridTemplateRows: "repeat(7, 1fr)",
            width: "max-content",
            maxWidth: "100%",
            aspectRatio: `${WEEKS_IN_YEAR} / 7`,
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isFuture = cell.date > today;
              const beforeYear = cell.date < jan1;
              const bg = beforeYear
                ? "rgba(255,255,255,0.04)"
                : getGreenStyle(cell.count, maxCount, isFuture);
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  title={`${cell.date.toLocaleDateString()}: ${cell.count} completion(s)`}
                  className="rounded-[2px] min-w-0 min-h-0 w-full aspect-square max-w-[14px] max-h-[14px]"
                  style={{ backgroundColor: bg }}
                />
              );
            })
          )}
        </div>
      </div>

      <p className="text-white/50 text-xs mt-4 flex items-center gap-1.5 flex-wrap">
        <span>Less</span>
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="inline-block rounded-[2px]"
            style={{
              width: 12,
              height: 12,
              backgroundColor: getGreenStyle(i, 4, false),
            }}
          />
        ))}
        <span>More</span>
      </p>

      {!hasAny && (
        <p className="text-white/40 text-sm mt-2">
          Complete habits below to see your activity here.
        </p>
      )}
    </div>
  );
}
