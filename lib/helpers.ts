import type { Plan, Session, WeekTargets, WorkoutStep } from './types';

export const todayStr = () => new Date().toISOString().split('T')[0];

export function getWeekDates(): string[] {
  const d = new Date();
  const diff = d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1);
  const mon = new Date(new Date().setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(mon);
    x.setDate(mon.getDate() + i);
    return x.toISOString().split('T')[0];
  });
}

export function getMonthDays(y: number, m: number): (Date | null)[] {
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const pad = (first.getDay() + 6) % 7;
  return [
    ...Array<null>(pad).fill(null),
    ...Array.from({ length: last.getDate() }, (_, i) => new Date(y, m, i + 1)),
  ];
}

export function getCurrentPhase(plan: Plan | null): string | null {
  if (!plan?.phases || !plan?.startDate) return null;
  const weekNum = Math.floor(
    (Date.now() - new Date(plan.startDate + 'T12:00:00').getTime()) / (7 * 864e5)
  ) + 1;
  return plan.phases.find((p) => p.weeks.includes(weekNum))?.name ?? null;
}

export function getRaceDays(plan: Plan | null): number | null {
  if (!plan?.raceDate) return null;
  return Math.ceil((new Date(plan.raceDate + 'T12:00:00').getTime() - Date.now()) / 864e5);
}

export function getPlanned(plan: Plan | null, date: string): Session[] {
  return plan?.sessions?.filter((s) => s.date === date) ?? [];
}

/** Pair planned sessions with matching actuals (by sport, first unmatched wins). */
export function pairSessions(planned: Session[], actual: Session[]) {
  const matched = new Set<number>();
  const rows = planned.map((p) => {
    const idx = actual.findIndex((a, i) => a.sport === p.sport && !matched.has(i));
    if (idx >= 0) matched.add(idx);
    return { planned: p, actual: idx >= 0 ? actual[idx] : null };
  });
  const extras = actual.filter((_, i) => !matched.has(i));
  return { rows, extras };
}

/** Current plan week number and total weeks, for the phase timeline. */
export function getPlanWeekInfo(plan: Plan | null): { week: number; total: number } | null {
  if (!plan?.phases?.length || !plan.startDate) return null;
  const week = Math.floor(
    (Date.now() - new Date(plan.startDate + 'T12:00:00').getTime()) / (7 * 864e5)
  ) + 1;
  const total = Math.max(...plan.phases.flatMap((p) => p.weeks));
  return { week, total };
}

export function getWeekTargets(
  plan: Plan | null,
  weekDates: string[],
  customTargets: WeekTargets,
): WeekTargets {
  if (!plan?.sessions) return customTargets;
  const wp = plan.sessions.filter((s) => weekDates.includes(s.date));
  return {
    run:  wp.filter((s) => s.sport === 'run').reduce((a, s) => a + (s.distance ?? 0), 0),
    bike: wp.filter((s) => s.sport === 'bike').reduce((a, s) => a + (s.distance ?? 0), 0),
    swim: wp.filter((s) => s.sport === 'swim').reduce((a, s) => a + (s.distance ?? 0), 0),
    gym:  wp.filter((s) => s.sport === 'gym').length,
  };
}

export const fmtKm = (n: number) => (n % 1 === 0 ? String(n) : n.toFixed(1));

export const fmtDate = (s: string) =>
  new Date(s + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export const fmtDateLong = (s: string) =>
  new Date(s + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export const fmtDur = (min: number) => {
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
};

export const fmtPace = (mpk: number) => {
  const m = Math.floor(mpk), s = Math.round((mpk - m) * 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

export function fmtStep(step: WorkoutStep): string {
  const parts: string[] = [];
  if (step.reps)     parts.push(`${step.reps}×`);
  if (step.duration) parts.push(`${step.duration}min`);
  if (step.distance) parts.push(`${fmtKm(step.distance)}km`);
  if (step.pace)     parts.push(`@ ${step.pace}`);
  if (step.rest)     parts.push(`(${step.rest} rest)`);
  return parts.join(' ');
}

export function buildAIPrompt(allSessions: Session[]): string {
  const sorted = [...allSessions].sort((a, b) => b.date.localeCompare(a.date));
  const runs  = sorted.filter((s) => s.sport === 'run'  && s.distance && s.duration).slice(0, 8);
  const bikes = sorted.filter((s) => s.sport === 'bike' && s.distance && s.duration).slice(0, 5);
  const swims = sorted.filter((s) => s.sport === 'swim' && s.distance && s.duration).slice(0, 5);

  const lines: string[] = [];
  const hr = (s: Session) => s.heartRate ? `, avg HR ${s.heartRate} bpm` : '';

  if (runs.length) {
    lines.push('Recent runs:');
    runs.forEach((s) =>
      lines.push(`  ${s.date}: ${fmtKm(s.distance!)}km in ${fmtDur(s.duration)} — ${fmtPace(s.duration / s.distance!)}/km${hr(s)}`)
    );
  }
  if (bikes.length) {
    lines.push('Recent bikes:');
    bikes.forEach((s) =>
      lines.push(`  ${s.date}: ${fmtKm(s.distance!)}km in ${fmtDur(s.duration)} — ${(s.distance! / (s.duration / 60)).toFixed(1)} km/h avg${hr(s)}`)
    );
  }
  if (swims.length) {
    lines.push('Recent swims:');
    swims.forEach((s) => {
      const p = s.duration / (s.distance! * 10);
      lines.push(`  ${s.date}: ${fmtKm(s.distance!)}km in ${fmtDur(s.duration)} — ${fmtPace(p)}/100m${hr(s)}`);
    });
  }

  const historyBlock = lines.length
    ? `\nAthlete training history (use paces and heart rates to calibrate all workout zones):\n${lines.join('\n')}\n`
    : '\n[No history yet — use reasonable beginner paces]\n';

  return `Generate a half ironman training plan in JSON format.
${historyBlock}
Fill in: startDate, raceDate, weeks, constraints (e.g. rest days).

Rules:
- Use SPECIFIC paces from the athlete's history, not generic labels
- Harder run/bike/swim sessions should include a "steps" array (warmup → main set → cooldown); easy/recovery sessions can omit it
- Gym sessions: set "note" to "Upper body", "Lower body", or "Full body" — no exercises field
- Step types: warmup, easy, tempo, threshold, interval, vo2max, race-pace, cooldown, recovery
- Paces: run → "X:XX/km",  bike → "XX km/h",  swim → "X:XX/100m"
- Intervals: include "reps", "duration" (per rep, minutes), "pace", "rest" (e.g. "90s easy")
- Output ONLY raw JSON, no markdown fences

{
  "name": "Half Ironman 16-Week Plan",
  "startDate": "YYYY-MM-DD",
  "raceDate": "YYYY-MM-DD",
  "phases": [
    { "name": "Base",  "weeks": [1,2,3,4] },
    { "name": "Build", "weeks": [5,6,7,8,9,10] },
    { "name": "Peak",  "weeks": [11,12,13,14] },
    { "name": "Taper", "weeks": [15,16] }
  ],
  "sessions": [
    {
      "date": "YYYY-MM-DD", "sport": "run", "distance": 10, "duration": 65,
      "note": "Easy aerobic run",
      "steps": [
        { "type": "warmup",   "duration": 10, "pace": "6:30/km" },
        { "type": "easy",     "duration": 45, "pace": "6:00/km" },
        { "type": "cooldown", "duration": 10, "pace": "6:30/km" }
      ]
    },
    { "date": "YYYY-MM-DD", "sport": "gym", "duration": 60, "note": "Upper body" }
  ]
}`;
}
