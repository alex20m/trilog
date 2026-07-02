'use client';

import { useState } from 'react';
import { C, SPORTS, STEP_COLORS } from '@/lib/constants';
import { getRaceDays, getCurrentPhase, fmtDate, fmtDur, fmtKm, fmtStep, todayStr, buildAIPrompt } from '@/lib/helpers';
import type { Plan, Session } from '@/lib/types';
import { PlanChip } from './ui';

interface Props {
  plan: Plan | null;
  allSessions: Session[];
  onSave: (p: Plan) => void;
  onClear: () => void;
}

export default function PlanView({ plan, allSessions, onSave, onClear }: Props) {
  const [json, setJson] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(buildAIPrompt(allSessions)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLoad = () => {
    try {
      const parsed = JSON.parse(json) as Plan;
      if (!parsed.sessions || !Array.isArray(parsed.sessions)) throw new Error("Missing 'sessions' array");
      onSave(parsed);
      setJson('');
      setError(null);
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message);
    }
  };

  if (plan) {
    const raceDays = getRaceDays(plan);
    const phase = getCurrentPhase(plan);
    const upcoming = (plan.sessions ?? []).filter((s) => s.date >= todayStr()).slice(0, 5);

    return (
      <div>
        <div style={{ background: C.surface, borderRadius: '14px', border: `1px solid ${C.border}`, padding: '16px', marginBottom: '14px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Active plan</p>
          <p style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '700', color: C.navy, letterSpacing: '-0.3px' }}>{plan.name ?? 'Training Plan'}</p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '10px' }}>
            {phase && <PlanChip label={phase} sub="Current phase" />}
            {raceDays !== null && raceDays >= 0 && <PlanChip label={`${raceDays} days`} sub="To race" color={raceDays < 14 ? '#C4622B' : undefined} />}
            {plan.raceDate && <PlanChip label={fmtDate(plan.raceDate)} sub="Race date" />}
            {plan.sessions && <PlanChip label={String(plan.sessions.length)} sub="Total sessions" />}
          </div>
        </div>

        {plan.phases && (
          <div style={{ background: C.surface, borderRadius: '14px', border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: '14px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Phases</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {plan.phases.map((p) => (
                <div key={p.name} style={{ background: p.name === phase ? C.navy : C.bg, color: p.name === phase ? C.white : C.text, borderRadius: '8px', padding: '5px 10px', fontSize: '13px', fontWeight: '500' }}>
                  {p.name} <span style={{ opacity: 0.65 }}>wk {Math.min(...p.weeks)}–{Math.max(...p.weeks)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Upcoming</p>
            {upcoming.map((s, i) => {
              const sport = SPORTS[s.sport];
              return (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderLeft: `4px solid ${sport.color}`, borderRadius: '10px', padding: '10px 14px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{sport.icon} {sport.label}{s.distance ? ` · ${fmtKm(s.distance)} km` : ''}</span>
                    <span style={{ fontSize: '12px', color: C.muted }}>{fmtDate(s.date)}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: C.muted, marginTop: '3px' }}>
                    {s.duration && fmtDur(s.duration)}
                    {!s.steps && s.intensity && <span style={{ marginLeft: '6px', color: sport.color }}>{s.intensity}</span>}
                    {s.note && <span style={{ fontStyle: 'italic' }}>{s.duration ? ' · ' : ''}{s.note}</span>}
                  </div>
                  {s.steps && s.steps.length > 0 && (
                    <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {s.steps.map((step, j) => (
                        <div key={j} style={{ display: 'flex', gap: '6px', fontSize: '11px' }}>
                          <span style={{ color: STEP_COLORS[step.type] ?? C.muted, fontWeight: '600', textTransform: 'capitalize', minWidth: '72px', flexShrink: 0 }}>{step.type}</span>
                          <span style={{ color: C.muted }}>{fmtStep(step)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button onClick={onClear} style={{ width: '100%', marginTop: '8px', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '12px', background: 'none', color: C.muted, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
          Replace plan
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: C.surface, borderRadius: '14px', border: `1px solid ${C.border}`, padding: '16px', marginBottom: '14px' }}>
        <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Load training plan</p>
        <p style={{ margin: '0 0 12px', fontSize: '14px', color: C.muted, lineHeight: '1.5' }}>
          Paste a JSON training plan generated by an AI. The app will use it to populate the calendar, week view, and goals automatically.
        </p>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder={'{\n  "name": "Half IM 16-Week Plan",\n  "startDate": "2026-06-29",\n  "raceDate": "2026-10-18",\n  "sessions": [...]\n}'}
          rows={8}
          style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '13px', outline: 'none', fontFamily: 'monospace', background: C.surface, color: C.text, resize: 'vertical', lineHeight: '1.5' }}
        />
        {error && <p style={{ color: '#E53E3E', fontSize: '13px', margin: '8px 0 0' }}>{error}</p>}
        <button onClick={handleLoad} style={{ width: '100%', marginTop: '10px', padding: '13px', border: 'none', borderRadius: '12px', background: C.navy, color: C.white, fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
          Load plan
        </button>
      </div>

      <div style={{ background: C.surface, borderRadius: '14px', border: `1px solid ${C.border}`, padding: '14px 16px' }}>
        <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Generate a plan with AI</p>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: C.muted, lineHeight: '1.5' }}>
          Copy a prompt pre-filled with your training history, paste it into Claude or any AI, then paste the returned JSON above.
        </p>
        <button onClick={copyPrompt} style={{
          width: '100%', padding: '12px', border: 'none', borderRadius: '10px',
          background: copied ? C.green : C.navy, color: C.white,
          fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background 0.2s',
        }}>
          {copied ? '✓ Copied to clipboard!' : 'Copy AI prompt (with your history)'}
        </button>
        {allSessions.length === 0 && (
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: C.muted }}>Connect Strava or log a few sessions first to personalise paces.</p>
        )}
      </div>
    </div>
  );
}
