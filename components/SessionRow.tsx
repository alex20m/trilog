'use client';

import { C, SPORTS, STEP_COLORS } from '@/lib/constants';
import { fmtKm, fmtDur, fmtPace, fmtStep, todayStr } from '@/lib/helpers';
import type { Session } from '@/lib/types';

interface Props {
  planned: Session | null;
  actual: Session | null;
  onDelete: (id: string | number) => void;
}

export default function SessionRow({ planned, actual, onDelete }: Props) {
  const sport = SPORTS[(planned ?? actual!).sport];
  const isDone = !!actual;
  const isFuture = !actual && (planned?.date ?? '') > todayStr();

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <div style={{ marginTop: '2px', width: '16px', flexShrink: 0, textAlign: 'center', fontSize: '13px' }}>
        {isDone
          ? <span style={{ color: C.green }}>✓</span>
          : isFuture
            ? <span style={{ color: C.muted }}>○</span>
            : <span style={{ color: '#E8A030' }}>!</span>}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {planned && (
          <div style={{ fontSize: '13px', color: isDone ? C.muted : C.text, marginBottom: actual ? '3px' : 0 }}>
            <span style={{ fontWeight: '500' }}>{sport.icon} {sport.label}</span>
            {planned.distance && <span> · {fmtKm(planned.distance)} km</span>}
            {planned.duration && <span style={{ color: C.muted }}> · {fmtDur(planned.duration)}</span>}
            {!planned.steps && planned.intensity && (
              <span style={{ fontSize: '11px', color: sport.color, marginLeft: '5px', background: sport.color + '15', padding: '1px 5px', borderRadius: '4px' }}>
                {planned.intensity}
              </span>
            )}
            {planned.note && (
              <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px', fontStyle: 'italic' }}>{planned.note}</div>
            )}
            {planned.steps && planned.steps.length > 0 && (
              <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {planned.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '11px' }}>
                    <span style={{ color: STEP_COLORS[step.type] ?? C.muted, fontWeight: '600', textTransform: 'capitalize', minWidth: '72px', flexShrink: 0 }}>
                      {step.type}
                    </span>
                    <span style={{ color: isDone ? C.muted : C.text + '99' }}>{fmtStep(step)}</span>
                  </div>
                ))}
              </div>
            )}
            {!planned.steps && planned.exercises && planned.exercises.length > 0 && (
              <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>{planned.exercises.join(' · ')}</div>
            )}
          </div>
        )}

        {actual && (
          <div style={{ fontSize: '13px', color: C.text }}>
            {!planned && <span style={{ fontWeight: '500' }}>{sport.icon} {sport.label} </span>}
            {actual.distance && <span style={{ color: planned ? C.green : C.text }}>↑ {fmtKm(actual.distance)} km</span>}
            {actual.duration && <span style={{ color: C.muted }}> · {fmtDur(actual.duration)}</span>}
            {actual.sport === 'run' && actual.distance && actual.duration && (
              <span style={{ color: C.muted }}> · {fmtPace(actual.duration / actual.distance)}/km</span>
            )}
            {actual.heartRate && (
              <span style={{ color: C.muted, fontSize: '11px', marginLeft: '4px' }}>♥ {actual.heartRate}</span>
            )}
            {actual.source === 'strava' && (
              <span style={{ color: C.strava, fontSize: '11px', marginLeft: '4px' }}>Strava</span>
            )}
            {actual.source === 'manual' && actual.id !== undefined && (
              <button onClick={() => onDelete(actual.id!)} style={{ background: 'none', border: 'none', color: C.border, cursor: 'pointer', fontSize: '14px', padding: '0 0 0 4px' }}>×</button>
            )}
            {actual.exercises && actual.exercises.length > 0 && (
              <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>{actual.exercises.join(' · ')}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
