'use client';

import React, { useMemo } from 'react';
import type { HabitCompletion } from '@prisma/client';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import styles from './enhanced-line-chart.module.css';

interface EnhancedLineChartProps {
    completions: Pick<HabitCompletion, 'completedAt'>[];
}

const PERIOD_OPTIONS = [
    { label: '7D', value: 7 },
    { label: '14D', value: 14 },
    { label: '30D', value: 30 },
    { label: '90D', value: 90 },
    { label: 'Year', value: 'year' as const },
];

export default function EnhancedLineChart({ completions }: EnhancedLineChartProps) {
    const [selectedPeriod, setSelectedPeriod] = React.useState<number | 'year'>(30);

    const data = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let startDate: Date;
        let daysToGenerate: number;

        if (selectedPeriod === 'year') {
            startDate = new Date(today.getFullYear(), 0, 1);
            const diffTime = Math.abs(today.getTime() - startDate.getTime());
            daysToGenerate = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        } else {
            daysToGenerate = selectedPeriod;
            startDate = new Date(today);
            startDate.setDate(today.getDate() - (daysToGenerate - 1));
        }

        // Create a map of completions by date
        const byDate = new Map<string, number>();
        for (const c of completions) {
            const d = new Date(c.completedAt);
            const key = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
            byDate.set(key, (byDate.get(key) ?? 0) + 1);
        }

        const chartData = [];

        for (let i = 0; i < daysToGenerate; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            if (date > today) break;

            const dateKey = date.toLocaleDateString('en-CA');
            const count = byDate.get(dateKey) || 0;

            chartData.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count,
                fullDate: dateKey,
            });
        }

        return chartData;
    }, [completions, selectedPeriod]);

    const maxCount = Math.max(1, ...data.map(d => d.count));

    // Determine X-axis interval based on period
    const getInterval = () => {
        if (selectedPeriod === 'year') return 30;
        if (selectedPeriod >= 90) return 6;
        if (selectedPeriod >= 30) return 2;
        return 0;
    };

    return (
        <div className={styles.chartContainer}>
            <div className={styles.header}>
                <h3 className={styles.title}>Activity Trend</h3>
                <div className={styles.periodSelector}>
                    {PERIOD_OPTIONS.map((option) => (
                        <button
                            key={option.label}
                            className={`${styles.periodButton} ${selectedPeriod === option.value ? styles.active : ''
                                }`}
                            onClick={() => setSelectedPeriod(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="rgb(251, 146, 60)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="rgb(251, 146, 60)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            vertical={false}
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeDasharray="3 3"
                        />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
                            dy={10}
                            interval={getInterval()}
                        />
                        <YAxis
                            hide={false}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
                            domain={[0, maxCount + 1]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(30, 30, 40, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            }}
                            itemStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
                            labelStyle={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '4px' }}
                            formatter={(value: number | undefined) => [`${value ?? 0} completions`, '']}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="rgb(251, 146, 60)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorGradient)"
                            animationDuration={1000}
                            activeDot={{
                                r: 6,
                                strokeWidth: 0,
                                fill: 'rgb(251, 146, 60)',
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <p className={styles.caption}>
                Completions per day · {selectedPeriod === 'year' ? 'Full year' : `Last ${selectedPeriod} days`}
            </p>
        </div>
    );
}
