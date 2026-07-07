'use client';

import { useState } from 'react';
import { SPORTS } from '@/lib/constants';
import { dateStr, fmtDateLong, getMonthDays, pairSessions, todayStr } from '@/lib/helpers';
import type { Plan, Session, Sport } from '@/lib/types';
import SessionRow from './SessionRow';
import { IconChevronL, IconChevronR, IconFlag, IconX, IconZzz } from './icons';
import { EmptyState } from './ui';

interface Props {
  plan: Plan | null;
  allSessions: Session[];
  onDelete: (id: string | number) => void;
}

export default function CalendarView({ plan, allSessions, onDelete }: Props) {
  const today = todayStr();
  const now = new Date();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  const days = getMonthDays(y, m);
  const isCurrentMonth = y === now.getFullYear() && m === now.getMonth();

  type DayData = { planned: Session[]; actual: Session[] };
  const dayMap: Record<string, DayData> = {};
  const addToMap = (date: string, key: keyof DayData, val: Session) => {
    if (!dayMap[date]) dayMap[date] = { planned: [], actual: [] };
    dayMap[date][key].push(val);
  };
  plan?.sessions?.forEach((s) => addToMap(s.date, 'planned', s));
  allSessions.forEach((s) => addToMap(s.date, 'actual', s));

  return (
    <div>
      <div className="cal-nav">
        <button
          className="icon-btn is-bordered"
          onClick={() => setViewDate(new Date(y, m - 1, 1))}
          aria-label="Previous month"
        >
          <IconChevronL width={20} height={20} />
        </button>
        <div className="cal-nav-center">
          <span className="t-h1">
            {viewDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </span>
          {!isCurrentMonth && (
            <button className="btn-ghost-sm" onClick={() => setViewDate(new Date())}>
              Today
            </button>
          )}
        </div>
        <button
          className="icon-btn is-bordered"
          onClick={() => setViewDate(new Date(y, m + 1, 1))}
          aria-label="Next month"
        >
          <IconChevronR width={20} height={20} />
        </button>
      </div>

      <div className="cal-dow">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="t-overline">{d}</span>
        ))}
      </div>

      <div className="cal-grid">
        {days.map((d, i) => {
          if (!d) return <div key={i} aria-hidden="true" />;
          const ds = dateStr(d);
          const data = dayMap[ds] ?? { planned: [], actual: [] };
          const isToday = ds === today;
          const isSel = ds === selectedDay;
          const isRace = plan?.raceDate === ds;
          const actualSports = new Set(data.actual.map((s) => s.sport));
          const allSports = [...new Set([...data.planned.map((s) => s.sport), ...actualSports])];

          const cellClass = [
            'cal-cell',
            isToday && 'is-today',
            isSel && 'is-selected',
            isRace && 'is-race',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={i}
              className={cellClass}
              onClick={() => setSelectedDay(isSel ? null : ds)}
              aria-pressed={isSel}
              aria-label={fmtDateLong(ds) + (isRace ? ', race day' : '')}
            >
              <span className="num">{d.getDate()}</span>
              <span className="cal-dots">
                {allSports.slice(0, 3).map((sport: Sport) => (
                  <span
                    key={sport}
                    className={`cal-dot sport-${sport}${actualSports.has(sport) ? '' : ' is-planned'}`}
                  />
                ))}
                {allSports.length > 3 && <span className="cal-dot is-overflow" />}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <DayDetail
          date={selectedDay}
          planned={dayMap[selectedDay]?.planned ?? []}
          actual={dayMap[selectedDay]?.actual ?? []}
          isRace={plan?.raceDate === selectedDay}
          onClose={() => setSelectedDay(null)}
          onDelete={onDelete}
        />
      )}

      <div className="cal-legend">
        {(Object.keys(SPORTS) as Sport[]).map((key) => (
          <span key={key}>
            <span className={`cal-dot sport-${key}`} /> {SPORTS[key].label}
          </span>
        ))}
        <span><span className="cal-dot is-planned is-neutral" /> Planned</span>
        <span><span className="legend-race" /> Race</span>
      </div>
    </div>
  );
}

function DayDetail({
  date, planned, actual, isRace, onClose, onDelete,
}: {
  date: string;
  planned: Session[];
  actual: Session[];
  isRace: boolean;
  onClose: () => void;
  onDelete: (id: string | number) => void;
}) {
  const { rows, extras } = pairSessions(planned, actual);
  const isRest = planned.length === 0 && actual.length === 0;

  return (
    <div className="card cal-detail">
      <div className="cal-detail-head">
        <span className="t-h3">{fmtDateLong(date)}</span>
        {isRace && (
          <span className="chip chip-race">
            <IconFlag width={12} height={12} /> RACE DAY
          </span>
        )}
        <button className="icon-btn" onClick={onClose} aria-label="Close day details">
          <IconX width={20} height={20} />
        </button>
      </div>
      {isRest ? (
        <EmptyState icon={<IconZzz />} title="Rest day" body="Nothing planned or logged." />
      ) : (
        <div className="session-list">
          {rows.map((row, i) => (
            <SessionRow key={i} planned={row.planned} actual={row.actual} onDelete={onDelete} />
          ))}
          {extras.map((s, i) => (
            <SessionRow key={'x' + i} planned={null} actual={s} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
