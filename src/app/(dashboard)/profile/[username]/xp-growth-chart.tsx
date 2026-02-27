"use client";

import { useMemo } from "react";

interface XPGrowthChartProps {
    completions: { completedAt: Date; pointsAwarded: number }[];
}

export function XPGrowthChart({ completions }: XPGrowthChartProps) {
    const chartData = useMemo(() => {
        // Group completions by month and accumulate XP
        const now = new Date();
        const months: { label: string; xp: number }[] = [];

        for (let i = 8; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = d.toLocaleString("en-US", { month: "short" });
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

            const monthXP = completions
                .filter((c) => {
                    const date = new Date(c.completedAt);
                    return date >= monthStart && date <= monthEnd;
                })
                .reduce((sum, c) => sum + c.pointsAwarded, 0);

            months.push({ label, xp: monthXP });
        }

        return months;
    }, [completions]);

    // SVG dimensions
    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxXP = Math.max(100, ...chartData.map((d) => d.xp));

    // Generate points
    const points = chartData.map((d, i) => {
        const x = padding.left + (i / (chartData.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (d.xp / maxXP) * chartHeight;
        return { x, y, ...d };
    });

    // Create path
    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const areaPath = `${linePath} L${points[points.length - 1].x},${height - padding.bottom} L${points[0].x},${height - padding.bottom}Z`;

    // Grid lines
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
        y: padding.top + chartHeight * (1 - pct),
        label: Math.round(maxXP * pct).toLocaleString(),
    }));

    return (
        <div className="relative">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-64 overflow-visible"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="xpAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {gridLines.map((line, i) => (
                    <g key={i}>
                        <line
                            x1={padding.left}
                            y1={line.y}
                            x2={width - padding.right}
                            y2={line.y}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="1"
                        />
                        <text
                            x={padding.left - 8}
                            y={line.y + 4}
                            fill="#64748b"
                            fontSize="10"
                            textAnchor="end"
                            fontFamily="Space Grotesk, sans-serif"
                        >
                            {line.label}
                        </text>
                    </g>
                ))}

                {/* Area fill */}
                <path d={areaPath} fill="url(#xpAreaGradient)" />

                {/* Line */}
                <path
                    d={linePath}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))" }}
                />

                {/* Data points */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="#0a0c10"
                        stroke="#3B82F6"
                        strokeWidth="2"
                    />
                ))}
            </svg>

            {/* Bottom labels */}
            <div className="flex justify-between text-[10px] text-slate-500 font-mono uppercase mt-2 px-10">
                {chartData.map((d, i) => (
                    <span key={i}>{d.label}</span>
                ))}
            </div>
        </div>
    );
}
