'use client';

import { useEffect, useRef, useState } from 'react';
import { SPORTS } from '@/lib/constants';
import { fmtKm, fmtDur, fmtPace, todayStr } from '@/lib/helpers';
import type { Session } from '@/lib/types';
import { IconCheck, IconHeart, IconTrash, SPORT_ICONS } from './icons';
import { StepList } from './ui';

interface Props {
  planned: Session | null;
  actual: Session | null;
  onDelete: (id: string | number) => void;
}

export default function SessionRow({ planned, actual, onDelete }: Props) {
  const sportKey = (planned ?? actual!).sport;
  const sport = SPORTS[sportKey];
  const Icon = SPORT_ICONS[sportKey];
  const isDone = !!actual;
  const isFuture = !actual && (planned?.date ?? '') > todayStr();

  const [confirm, setConfirm] = useState(false);
  const [removing, setRemoving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const deletable = actual?.source === 'manual' && actual.id !== undefined;

  const handleDelete = () => {
    clearTimeout(timer.current);
    if (!confirm) {
      setConfirm(true);
      timer.current = setTimeout(() => setConfirm(false), 3000);
    } else {
      setRemoving(true);
      timer.current = setTimeout(() => onDelete(actual!.id!), 200);
    }
  };

  const rowClass = [
    'session-row',
    `sport-${sportKey}`,
    isDone && 'is-done',
    confirm && 'is-confirm',
    removing && 'is-removing',
  ].filter(Boolean).join(' ');

  return (
    <div className={rowClass}>
      <span
        className={`session-status ${isDone ? 'is-done' : isFuture ? 'is-future' : 'is-missed'}`}
        aria-hidden="true"
      >
        {isDone ? <IconCheck /> : isFuture ? null : '!'}
      </span>

      <Icon className="session-icon" />

      <div className="session-content">
        {planned && (
          <div className="session-planned">
            <span className="session-sport">{sport.label}</span>
            {planned.distance !== undefined && (
              <span className="t-num"> · {fmtKm(planned.distance)} km</span>
            )}
            {planned.duration > 0 && (
              <span className="session-dim t-num"> · {fmtDur(planned.duration)}</span>
            )}
            {!planned.steps && planned.intensity && (
              <span className="intensity-chip">{planned.intensity}</span>
            )}
            {planned.note && <div className="session-note">{planned.note}</div>}
            {planned.steps && planned.steps.length > 0 && <StepList steps={planned.steps} />}
            {!planned.steps && planned.exercises && planned.exercises.length > 0 && (
              <div className="session-note">{planned.exercises.join(' · ')}</div>
            )}
          </div>
        )}

        {actual && (
          <div className="session-actual">
            {!planned && <span className="session-sport">{sport.label} </span>}
            {actual.distance !== undefined && (
              <span className="t-num">
                {planned && <span className="up-arrow">↑ </span>}
                {fmtKm(actual.distance)} km
              </span>
            )}
            {actual.duration > 0 && (
              <span className="session-dim t-num">
                {actual.distance !== undefined || !planned ? ' · ' : ''}
                {fmtDur(actual.duration)}
              </span>
            )}
            {actual.sport === 'run' && actual.distance && actual.duration && (
              <span className="session-dim t-num"> · {fmtPace(actual.duration / actual.distance)}/km</span>
            )}
            {actual.heartRate && (
              <span className="hr-read t-num">
                <IconHeart /> {actual.heartRate}
              </span>
            )}
            {actual.source === 'strava' && <span className="source-tag">STRAVA</span>}
            {actual.exercises && actual.exercises.length > 0 && (
              <div className="session-note">{actual.exercises.join(' · ')}</div>
            )}
            {actual.notes && <div className="session-note">{actual.notes}</div>}
          </div>
        )}
      </div>

      {deletable && (
        <button
          className={confirm ? 'icon-btn row-del is-confirm' : 'icon-btn row-del'}
          onClick={handleDelete}
          aria-label={confirm ? 'Confirm delete' : 'Delete session'}
        >
          {confirm ? 'Delete?' : <IconTrash width={16} height={16} />}
        </button>
      )}
    </div>
  );
}
