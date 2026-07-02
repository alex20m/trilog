'use client';

import { C, SPORTS } from '@/lib/constants';
import { fmtKm, getPlanned, todayStr } from '@/lib/helpers';
import type { Plan, Session, Sport, WeekTargets } from '@/lib/types';
import SessionRow from './SessionRow';
import { StatPill } from './ui';

interface WeekViewProps {
  plan: Plan | null;
  allSessions: Session[];
  weekDates: string[];
  weekTotals: Record<Sport, number>;
  targets: WeekTargets;
  gymDone: number;
  lastSync: string | null;
  onDelete: (id: string | number) => void;
}

export default function WeekView({ plan, allSessions, weekDates, weekTotals, targets, gymDone, lastSync, onDelete }: WeekViewProps) {
  const totalKm = (Object.entries(weekTotals) as [Sport, number][])
    .filter(([k]) => k !== 'gym')
    .reduce((a, [, v]) => a + v, 0);
  const weekActual = allSessions.filter((s) => weekDates.includes(s.date));

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
        <StatPill label="Sessions" value={weekActual.length} />
        <StatPill label="Total km" value={fmtKm(totalKm)} />
        {lastSync && <StatPill label="Synced" value={lastSync} />}
      </div>

      <div style={{ background: C.surface, borderRadius: '14px', border: `1px solid ${C.border}`, padding: '16px', marginBottom: '16px' }}>
        <p style={{ margin: '0 0 14px', fontSize: '11px', fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          {plan ? 'Plan completion' : 'This week'}
        </p>

        {(['run', 'bike', 'swim'] as const).map((key) => {
          const sport = SPORTS[key];
          const done = weekTotals[key] || 0;
          const target = targets[key] || 0;
          const pct = target > 0 ? Math.min((done / target) * 100, 100) : 0;
          const hit = target > 0 && done >= target;
          return (
            <div key={key} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{sport.icon} {sport.label}</span>
                <span style={{ fontSize: '13px' }}>
                  <strong style={{ color: done > 0 ? (hit ? sport.color : C.text) : C.muted }}>{fmtKm(done)}</strong>
                  <span style={{ color: C.muted }}> / {fmtKm(target)} km</span>
                  {hit && <span style={{ color: sport.color, marginLeft: '4px' }}>✓</span>}
                </span>
              </div>
              <div style={{ height: '6px', background: C.bg, borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: sport.color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          );
        })}

        {(() => {
          const sport = SPORTS.gym;
          const target = targets.gym || 0;
          const pct = target > 0 ? Math.min((gymDone / target) * 100, 100) : 0;
          const hit = target > 0 && gymDone >= target;
          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{sport.icon} {sport.label}</span>
                <span style={{ fontSize: '13px' }}>
                  <strong style={{ color: gymDone > 0 ? (hit ? sport.color : C.text) : C.muted }}>{gymDone}</strong>
                  <span style={{ color: C.muted }}> / {target} sessions</span>
                  {hit && <span style={{ color: sport.color, marginLeft: '4px' }}>✓</span>}
                </span>
              </div>
              <div style={{ height: '6px', background: C.bg, borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: sport.color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          );
        })()}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {weekDates.map((date) => {
          const planned = getPlanned(plan, date);
          const actual = allSessions.filter((s) => s.date === date);
          const isToday = date === todayStr();
          const isPast = date < todayStr();
          if (!plan && actual.length === 0 && isPast && !isToday) return null;
          return <DayCard key={date} date={date} planned={planned} actual={actual} isToday={isToday} isPast={isPast} onDelete={onDelete} />;
        })}
      </div>
    </div>
  );
}

interface DayCardProps {
  date: string;
  planned: Session[];
  actual: Session[];
  isToday: boolean;
  isPast: boolean;
  onDelete: (id: string | number) => void;
}

function DayCard({ date, planned, actual, isToday, isPast, onDelete }: DayCardProps) {
  const isRest = planned.length === 0 && actual.length === 0;
  const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  const matchedActual = new Set<number>();
  const rows = planned.map((p) => {
    const match = actual.find((a, i) => a.sport === p.sport && !matchedActual.has(i));
    if (match) matchedActual.add(actual.indexOf(match));
    return { planned: p, actual: match ?? null };
  });
  const extras = actual.filter((_, i) => !matchedActual.has(i));

  const dim = isRest && isPast && !isToday;
  return (
    <div style={{
      background: dim ? 'transparent' : C.surface,
      borderRadius: '12px',
      border: dim ? 'none' : `1px solid ${isToday ? C.navy + '60' : C.border}`,
      borderLeft: dim ? 'none' : `4px solid ${isToday ? C.navy : C.border}`,
      padding: dim ? '4px 14px' : '12px 14px',
      opacity: dim ? 0.4 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isRest ? 0 : '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: isToday ? C.navy : C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {dayLabel}{isToday && ' · Today'}
        </span>
      </div>
      {isRest && <span style={{ fontSize: '13px', color: C.muted }}>Rest</span>}
      {!isRest && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rows.map((row, i) => <SessionRow key={i} planned={row.planned} actual={row.actual} onDelete={onDelete} />)}
          {extras.map((s, i) => <SessionRow key={'extra-' + i} planned={null} actual={s} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}
