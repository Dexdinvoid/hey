'use client';

import React, { useMemo } from 'react';
import type { HabitCompletion } from '@prisma/client';
import styles from './enhanced-heatmap.module.css';

interface EnhancedHeatmapProps {
  completions: Pick<HabitCompletion, 'completedAt'>[];
  year?: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function toDateKey(d: Date): string {
  return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
}

function getLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  const level = maxCount <= 1 ? 1 : Math.min(4, Math.ceil((count / maxCount) * 4));
  return level as 0 | 1 | 2 | 3 | 4;
}

export default function EnhancedHeatmap({ completions, year: providedYear }: EnhancedHeatmapProps) {
  const year = providedYear || new Date().getFullYear();
  
  const [hoveredDay, setHoveredDay] = React.useState<{ date: string; count: number; level: number } | null>(null);

  // Generate calendar data
  const calendarData = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const c of completions) {
      const key = toDateKey(new Date(c.completedAt));
      byDate.set(key, (byDate.get(key) ?? 0) + 1);
    }

    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInYear = isLeapYear ? 366 : 365;
    const days = [];

    for (let i = 0; i < daysInYear; i++) {
      const currentDate = new Date(year, 0, 1);
      currentDate.setDate(1 + i);
      const dateString = toDateKey(currentDate);
      const count = byDate.get(dateString) || 0;
      
      days.push({
        date: dateString,
        count,
        level: 0 as 0 | 1 | 2 | 3 | 4,
      });
    }

    // Calculate max for levels
    const maxCount = Math.max(1, ...days.map(d => d.count));
    days.forEach(d => {
      d.level = getLevel(d.count, maxCount);
    });

    return days;
  }, [completions, year]);

  // Group into weeks
  const weeks = useMemo(() => {
    const result: typeof calendarData[] = [];
    let currentWeek: typeof calendarData = [];

    const startDate = new Date(year, 0, 1);
    const startDayOfWeek = startDate.getDay();

    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({ date: '', count: 0, level: 0 });
    }

    calendarData.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }

    return result;
  }, [calendarData, year]);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; index: number }[] = [];

    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week.find(d => d.date !== '');
      if (!firstDayOfWeek) return;

      const [y, m, d] = firstDayOfWeek.date.split('-').map(Number);
      const month = m - 1;

      const prevWeek = weekIndex > 0 ? weeks[weekIndex - 1] : null;
      const prevDayStr = prevWeek ? prevWeek.find(d => d.date !== '')?.date : null;

      if (!prevDayStr) {
        labels.push({ month: MONTHS[month], index: weekIndex });
      } else {
        const [py, pm, pd] = prevDayStr.split('-').map(Number);
        if (pm - 1 !== month) {
          labels.push({ month: MONTHS[month], index: weekIndex });
        }
      }
    });

    return labels;
  }, [weeks]);

  const totalCompletions = calendarData.reduce((sum, day) => sum + day.count, 0);
  const activeDays = calendarData.filter(day => day.count > 0).length;
  const consistencyPercent = Math.round((activeDays / calendarData.length) * 100);

  return (
    <div className={styles.container}>
      {/* Header with stats */}
      <div className={styles.headerRow}>
        <div className={styles.statsSummary}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalCompletions}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{consistencyPercent}%</span>
            <span className={styles.statLabel}>Consistency</span>
          </div>
        </div>

        {/* Day Detail Card */}
        <div className={styles.dayDetailCard}>
          {hoveredDay ? (
            <div className={styles.activeDetailContent}>
              <div className={styles.detailDate}>
                {(() => {
                  const [y, m, d] = hoveredDay.date.split('-').map(Number);
                  const date = new Date(y, m - 1, d);
                  return date.toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                })()}
              </div>
              <div className={styles.detailStats}>
                <span className={styles.detailCount}>
                  {hoveredDay.count > 0 ? '🔥' : '⚫'} <strong>{hoveredDay.count}</strong> completions
                </span>
                {hoveredDay.count > 0 && (
                  <span className={styles.detailMessage}>
                    {hoveredDay.count >= 5 ? 'Incredible! 🚀' :
                      hoveredDay.count >= 3 ? 'Great! 💪' : 'Good! 🌱'}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.emptyDetailContent}>
              <span className={styles.hintIcon}>👆</span>
              <span>Hover over the grid to see details</span>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className={styles.heatmapWrapper}>
        <div className={styles.monthLabels}>
          {monthLabels.map(({ month, index }) => (
            <span
              key={`${month}-${index}`}
              className={styles.monthLabel}
              style={{ left: `${index * 14}px`, gridColumn: index + 2 }}
            >
              {month}
            </span>
          ))}
        </div>

        <div className={styles.gridContainer}>
          <div className={styles.dayLabels}>
            {DAYS.map((day, i) => (
              <span key={i} className={styles.dayLabel}>{day}</span>
            ))}
          </div>

          <div className={styles.grid}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className={styles.week}>
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`${styles.cell} ${styles[`level${day.level || 0}`]} ${!day.date ? styles.empty : ''}`}
                    onMouseEnter={() => day.date && setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendLabel}>Less</span>
        <div className={`${styles.cell} ${styles.level0}`} />
        <div className={`${styles.cell} ${styles.level1}`} />
        <div className={`${styles.cell} ${styles.level2}`} />
        <div className={`${styles.cell} ${styles.level3}`} />
        <div className={`${styles.cell} ${styles.level4}`} />
        <span className={styles.legendLabel}>More</span>
      </div>
    </div>
  );
}
