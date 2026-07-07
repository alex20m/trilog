'use client';

import { SPORTS } from '@/lib/constants';
import { fmtKm, getPlanned, pairSessions, todayStr } from '@/lib/helpers';
import type { Plan, Session, Sport, WeekTargets } from '@/lib/types';
import SessionRow from './SessionRow';
import { IconChart, IconCheck, IconZzz, SPORT_ICONS } from './icons';
import { EmptyState, StatCard } from './ui';

interface WeekViewProps {
  plan: Plan | null;
  allSessions: Session[];
  weekDates: string[];
  weekTotals: Record<Sport, number>;
  targets: WeekTargets;
  gymDone: number;
  lastSync: string | null;
  syncing: boolean;
  onDelete: (id: string | number) => void;
  onQuickAdd: (sport: Sport | null) => void;
  onGoLog: () => void;
}

const RING_C = 226.2; // 2π × 36

export default function WeekView({
  plan, allSessions, weekDates, weekTotals, targets, gymDone,
  lastSync, syncing, onDelete, onQuickAdd, onGoLog,
}: WeekViewProps) {
  const today = todayStr();
  const weekActual = allSessions.filter((s) => weekDates.includes(s.date));
  const totalKm = (Object.entries(weekTotals) as [Sport, number][])
    .filter(([k]) => k !== 'gym')
    .reduce((a, [, v]) => a + v, 0);

  if (!plan && allSessions.length === 0) {
    return (
      <EmptyState
        icon={<IconChart />}
        title="No sessions yet"
        body="Log your first workout or sync Strava to see your week fill up."
        action={
          <button className="btn btn-secondary" onClick={onGoLog}>
            Log a session
          </button>
        }
      />
    );
  }

  // Per-sport completion: distance sports by km, gym by session count.
  const bars: { key: Sport; done: number; target: number; unit: 'km' | 'sessions' }[] = [
    { key: 'run', done: weekTotals.run || 0, target: targets.run || 0, unit: 'km' },
    { key: 'bike', done: weekTotals.bike || 0, target: targets.bike || 0, unit: 'km' },
    { key: 'swim', done: weekTotals.swim || 0, target: targets.swim || 0, unit: 'km' },
    { key: 'gym', done: gymDone, target: targets.gym || 0, unit: 'sessions' },
  ];
  const withTargets = bars.filter((b) => b.target > 0);
  const overall = withTargets.length
    ? withTargets.reduce((a, b) => a + Math.min(b.done / b.target, 1), 0) / withTargets.length
    : 0;
  const overallPct = Math.round(overall * 100);

  return (
    <div className="week-grid">
      <div className="week-aside">
        <div className="stat-row">
          <StatCard label="Sessions" value={weekActual.length} />
          <StatCard label="Total km" value={fmtKm(totalKm)} />
          <StatCard
            label={lastSync || syncing ? 'Synced' : 'Not synced'}
            value={syncing ? '…' : lastSync ?? '—'}
          />
        </div>

        <section className="card progress-card">
          <span className="t-overline">{plan ? 'Plan completion' : 'This week'}</span>
          <div className="progress-body">
            <svg
              className={overallPct >= 100 ? 'progress-ring is-complete' : 'progress-ring'}
              width="84" height="84" viewBox="0 0 84 84"
              role="img" aria-label={`Week ${overallPct}% complete`}
            >
              <circle className="ring-track" cx="42" cy="42" r="36" fill="none"
                stroke="var(--c-surface-2)" strokeWidth="8" />
              <circle className="ring-fill" cx="42" cy="42" r="36" fill="none"
                stroke="var(--c-accent)" strokeWidth="8" strokeLinecap="round"
                transform="rotate(-90 42 42)"
                strokeDasharray={RING_C}
                style={{ strokeDashoffset: `calc(${RING_C} * (1 - var(--pct)))`, '--pct': overall } as React.CSSProperties}
              />
              <text x="42" y="47" textAnchor="middle">{overallPct}%</text>
            </svg>
            <div className="progress-bars">
              {bars.map((b) => (
                <ProgressItem key={b.key} sport={b.key} done={b.done} target={b.target} unit={b.unit} />
              ))}
            </div>
          </div>
        </section>

        <TodayCard plan={plan} allSessions={allSessions} onDelete={onDelete} onQuickAdd={onQuickAdd} />
      </div>

      <div className="week-main">
        <div className="day-list">
          {weekDates.filter((d) => d !== today).map((date) => {
            const planned = getPlanned(plan, date);
            const actual = allSessions.filter((s) => s.date === date);
            const isPast = date < today;
            if (!plan && actual.length === 0 && isPast) return null;
            return (
              <DayCard key={date} date={date} planned={planned} actual={actual}
                isPast={isPast} onDelete={onDelete} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProgressItem({
  sport, done, target, unit,
}: {
  sport: Sport;
  done: number;
  target: number;
  unit: 'km' | 'sessions';
}) {
  const Icon = SPORT_ICONS[sport];
  const label = SPORTS[sport].label;
  const pct = target > 0 ? Math.min((done / target) * 100, 100) : 0;
  const hit = target > 0 && done >= target;
  const fmt = (n: number) => (unit === 'km' ? fmtKm(n) : String(n));

  return (
    <div className={`progress-item sport-${sport}${hit ? ' is-hit' : ''}`}>
      <div className="progress-head">
        <span className="progress-name">
          <Icon /> {label}
        </span>
        <span className="progress-nums t-num">
          <strong>{fmt(done)}</strong> / {fmt(target)} {unit}
          <IconCheck className="hit-check" />
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${fmt(done)} of ${fmt(target)} ${unit}`}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TodayCard({
  plan, allSessions, onDelete, onQuickAdd,
}: {
  plan: Plan | null;
  allSessions: Session[];
  onDelete: (id: string | number) => void;
  onQuickAdd: (sport: Sport | null) => void;
}) {
  const today = todayStr();
  const planned = getPlanned(plan, today);
  const actual = allSessions.filter((s) => s.date === today);
  const { rows, extras } = pairSessions(planned, actual);
  const isRest = planned.length === 0 && actual.length === 0;
  const firstOpenSport = rows.find((r) => !r.actual)?.planned.sport ?? null;
  const label = new Date(today + 'T12:00:00')
    .toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <section className="card today-card">
      <div className="today-head">
        <span className="t-overline">Today · {label}</span>
        <button className="btn-quick-add" onClick={() => onQuickAdd(firstOpenSport)}>
          + Log
        </button>
      </div>
      {isRest ? (
        <span className="today-rest">
          <IconZzz /> Rest day — recover well.
        </span>
      ) : (
        <div className="session-list">
          {rows.map((row, i) => (
            <SessionRow key={i} planned={row.planned} actual={row.actual} onDelete={onDelete} />
          ))}
          {extras.map((s, i) => (
            <SessionRow key={'extra-' + i} planned={null} actual={s} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}

function DayCard({
  date, planned, actual, isPast, onDelete,
}: {
  date: string;
  planned: Session[];
  actual: Session[];
  isPast: boolean;
  onDelete: (id: string | number) => void;
}) {
  const isRest = planned.length === 0 && actual.length === 0;
  const dim = isRest && isPast;
  const dayLabel = new Date(date + 'T12:00:00')
    .toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const { rows, extras } = pairSessions(planned, actual);

  return (
    <div className={dim ? 'day-card is-dim' : 'day-card'}>
      <span className="day-label t-overline">{dayLabel}</span>
      {isRest ? (
        <span className="day-rest">Rest</span>
      ) : (
        <div className="session-list">
          {rows.map((row, i) => (
            <SessionRow key={i} planned={row.planned} actual={row.actual} onDelete={onDelete} />
          ))}
          {extras.map((s, i) => (
            <SessionRow key={'extra-' + i} planned={null} actual={s} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
