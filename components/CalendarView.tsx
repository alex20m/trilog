'use client';

import { useState, CSSProperties } from 'react';
import { C, SPORTS } from '@/lib/constants';
import { getMonthDays, todayStr, fmtDateLong } from '@/lib/helpers';
import type { Plan, Session } from '@/lib/types';
import SessionRow from './SessionRow';

interface Props {
  plan: Plan | null;
  allSessions: Session[];
}

export default function CalendarView({ plan, allSessions }: Props) {
  const today = todayStr();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  const days = getMonthDays(y, m);

  type DayData = { planned: Session[]; actual: Session[] };
  const dayMap: Record<string, DayData> = {};
  const addToMap = (date: string, key: keyof DayData, val: Session) => {
    if (!dayMap[date]) dayMap[date] = { planned: [], actual: [] };
    dayMap[date][key].push(val);
  };
  plan?.sessions?.forEach((s) => addToMap(s.date, 'planned', s));
  allSessions.forEach((s) => addToMap(s.date, 'actual', s));

  const navBtn: CSSProperties = {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px',
    padding: '6px 12px', cursor: 'pointer', fontSize: '14px', color: C.text, fontFamily: 'inherit',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button style={navBtn} onClick={() => setViewDate(new Date(y, m - 1, 1))}>←</button>
        <span style={{ fontWeight: '600', fontSize: '16px' }}>
          {viewDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </span>
        <button style={navBtn} onClick={() => setViewDate(new Date(y, m + 1, 1))}>→</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', color: C.muted, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const ds = d.toISOString().split('T')[0];
          const data = dayMap[ds] ?? { planned: [], actual: [] };
          const isToday = ds === today;
          const isSel = ds === selectedDay;
          const plannedSports = [...new Set(data.planned.map((s) => s.sport))];
          const actualSports  = [...new Set(data.actual.map((s) => s.sport))];
          const allSports = [...new Set([...plannedSports, ...actualSports])];

          return (
            <div key={i} onClick={() => setSelectedDay(isSel ? null : ds)} style={{
              background: isSel ? C.navy : isToday ? C.navy + '0F' : C.surface,
              borderRadius: '10px',
              border: `1px solid ${isToday && !isSel ? C.navy + '50' : C.border}`,
              padding: '6px 2px 8px', cursor: 'pointer', minHeight: '50px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            }}>
              <span style={{ fontSize: '13px', fontWeight: isToday ? '700' : '400', color: isSel ? C.white : isToday ? C.navy : C.text }}>
                {d.getDate()}
              </span>
              <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {allSports.slice(0, 3).map((sport) => {
                  const hasActual = actualSports.includes(sport);
                  const color = SPORTS[sport]?.color ?? '#888';
                  return (
                    <div key={sport} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: hasActual ? color : 'transparent',
                      border: `1.5px solid ${color}`,
                    }} />
                  );
                })}
                {allSports.length > 3 && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.muted }} />}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <DaySheet
          date={selectedDay}
          planned={dayMap[selectedDay]?.planned ?? []}
          actual={dayMap[selectedDay]?.actual ?? []}
          onClose={() => setSelectedDay(null)}
        />
      )}

      <div style={{ display: 'flex', gap: '14px', marginTop: '14px', flexWrap: 'wrap' }}>
        {Object.entries(SPORTS).map(([key, sport]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sport.color }} />
            <span style={{ fontSize: '12px', color: C.muted }}>{sport.label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: `1.5px solid ${C.muted}`, background: 'transparent' }} />
          <span style={{ fontSize: '12px', color: C.muted }}>Planned, not done</span>
        </div>
      </div>
    </div>
  );
}

interface DaySheetProps {
  date: string;
  planned: Session[];
  actual: Session[];
  onClose: () => void;
}

function DaySheet({ date, planned, actual, onClose }: DaySheetProps) {
  const matchedActual = new Set<number>();
  const rows = planned.map((p) => {
    const match = actual.find((a, i) => a.sport === p.sport && !matchedActual.has(i));
    if (match) matchedActual.add(actual.indexOf(match));
    return { planned: p, actual: match ?? null };
  });
  const extras = actual.filter((_, i) => !matchedActual.has(i));
  const isRest = planned.length === 0 && actual.length === 0;

  return (
    <div style={{ marginTop: '14px', background: C.surface, borderRadius: '14px', border: `1px solid ${C.border}`, padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontWeight: '600', fontSize: '15px' }}>{fmtDateLong(date)}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: C.muted, lineHeight: '1' }}>×</button>
      </div>
      {isRest && <p style={{ color: C.muted, fontSize: '14px', margin: 0 }}>Rest day</p>}
      {rows.map((row, i) => <SessionRow key={i} planned={row.planned} actual={row.actual} onDelete={() => {}} />)}
      {extras.map((s, i) => <SessionRow key={'x' + i} planned={null} actual={s} onDelete={() => {}} />)}
    </div>
  );
}
