// League tiers and point thresholds (PRD: Unranked to Radiant)
const LEAGUE_THRESHOLDS = [
  { name: "Unranked", minPoints: 0 },
  { name: "Iron", minPoints: 100 },
  { name: "Bronze", minPoints: 300 },
  { name: "Silver", minPoints: 600 },
  { name: "Gold", minPoints: 1000 },
  { name: "Platinum", minPoints: 1500 },
  { name: "Diamond", minPoints: 2500 },
  { name: "Radiant", minPoints: 4000 },
] as const;

export const POINTS_PER_COMPLETION = 10;

export function getLeagueFromPoints(points: number): string {
  let league: string = LEAGUE_THRESHOLDS[0].name;
  for (const tier of LEAGUE_THRESHOLDS) {
    if (points >= tier.minPoints) league = tier.name;
  }
  return league;
}

export function getNextLeague(points: number): { name: string; pointsNeeded: number } | null {
  const current = getLeagueFromPoints(points);
  const idx = LEAGUE_THRESHOLDS.findIndex((t) => t.name === current);
  if (idx === -1 || idx >= LEAGUE_THRESHOLDS.length - 1) return null;
  const next = LEAGUE_THRESHOLDS[idx + 1];
  return {
    name: next.name,
    pointsNeeded: next.minPoints - points,
  };
}
