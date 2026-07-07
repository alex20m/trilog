'use client';

import { useState } from 'react';
import { SPORTS } from '@/lib/constants';
import {
  buildAIPrompt, fmtDate, fmtDur, fmtKm, getCurrentPhase, getPlanWeekInfo,
  getRaceDays, todayStr,
} from '@/lib/helpers';
import type { Plan, Session } from '@/lib/types';
import { IconCheck, IconClipboard, IconTarget, SPORT_ICONS } from './icons';
import { EmptyState, StepList } from './ui';

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
    const weekInfo = getPlanWeekInfo(plan);
    const upcoming = (plan.sessions ?? []).filter((s) => s.date >= todayStr()).slice(0, 5);

    return (
      <div>
        <section className="card plan-card">
          <span className="t-overline">Active plan</span>
          <h1 className="plan-name t-h1">{plan.name ?? 'Training Plan'}</h1>
          <div className="plan-chips">
            {phase && <PlanChip value={phase} label="Current phase" />}
            {raceDays !== null && raceDays >= 0 && (
              <PlanChip value={`${raceDays} days`} label="To race" warning={raceDays < 14} />
            )}
            {plan.raceDate && <PlanChip value={fmtDate(plan.raceDate)} label="Race date" />}
            {plan.sessions && <PlanChip value={String(plan.sessions.length)} label="Total sessions" />}
          </div>
        </section>

        {plan.phases && plan.phases.length > 0 && weekInfo && (
          <section className="card phase-card">
            <span className="t-overline section-label">Phases</span>
            <PhaseTrack plan={plan} week={weekInfo.week} />
            <span className="phase-caption t-caption t-num">
              Week {Math.min(Math.max(weekInfo.week, 1), weekInfo.total)} of {weekInfo.total}
              {phase ? ` · ${phase}` : ''}
            </span>
          </section>
        )}

        {upcoming.length > 0 && (
          <div>
            <span className="t-overline section-label">Upcoming</span>
            {upcoming.map((s, i) => {
              const Icon = SPORT_ICONS[s.sport];
              return (
                <div key={i} className={`workout-card sport-${s.sport}`}>
                  <div className="workout-head">
                    <Icon />
                    <span className="workout-title">
                      <span className="t-h3">
                        {SPORTS[s.sport].label}
                        {s.distance ? ` · ${fmtKm(s.distance)} km` : ''}
                      </span>
                      {i === 0 && <span className="chip">NEXT</span>}
                    </span>
                    <span className="workout-date t-caption t-num">{fmtDate(s.date)}</span>
                  </div>
                  <div className="workout-meta">
                    {s.duration ? <span className="t-num">{fmtDur(s.duration)}</span> : null}
                    {!s.steps && s.intensity && <span className="intensity-chip">{s.intensity}</span>}
                    {s.note && <span>{s.duration || (!s.steps && s.intensity) ? ' · ' : ''}{s.note}</span>}
                  </div>
                  {s.steps && s.steps.length > 0 && <StepList steps={s.steps} />}
                </div>
              );
            })}
          </div>
        )}

        <button className="btn btn-ghost" style={{ width: '100%', marginTop: 'var(--sp-2)' }} onClick={onClear}>
          Replace plan
        </button>
      </div>
    );
  }

  return (
    <div>
      <EmptyState
        icon={<IconTarget />}
        title="No plan loaded"
        body="Paste a JSON plan below, or copy the AI prompt to generate one from your history."
      />

      <section className="card plan-card">
        <span className="t-overline section-label">Load training plan</span>
        <label className="field-label" htmlFor="plan-json">Plan JSON</label>
        <textarea
          id="plan-json"
          className={error ? 'input input-mono is-invalid' : 'input input-mono'}
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder={'{\n  "name": "Half IM 16-Week Plan",\n  "startDate": "2026-06-29",\n  "raceDate": "2026-10-18",\n  "sessions": [...]\n}'}
          rows={8}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'err-plan-json' : undefined}
        />
        {error && <p className="field-error" id="err-plan-json">{error}</p>}
        <button className="btn btn-primary" style={{ marginTop: 'var(--sp-3)' }} onClick={handleLoad}>
          Load plan
        </button>
      </section>

      <section className="card plan-card">
        <span className="t-overline section-label">Generate a plan with AI</span>
        <p className="t-small" style={{ margin: '0 0 var(--sp-3)' }}>
          Copy a prompt pre-filled with your training history, paste it into Claude or any AI,
          then paste the returned JSON above.
        </p>
        <button
          className={copied ? 'btn btn-secondary is-copied' : 'btn btn-secondary'}
          style={{ width: '100%' }}
          onClick={copyPrompt}
        >
          {copied ? <IconCheck /> : <IconClipboard />}
          {copied ? 'Copied' : 'Copy AI prompt (with your history)'}
        </button>
        {allSessions.length === 0 && (
          <p className="t-caption" style={{ margin: 'var(--sp-2) 0 0' }}>
            Connect Strava or log a few sessions first to personalise paces.
          </p>
        )}
      </section>
    </div>
  );
}

function PlanChip({ value, label, warning }: { value: string; label: string; warning?: boolean }) {
  return (
    <div className={warning ? 'plan-chip is-warning' : 'plan-chip'}>
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}

function PhaseTrack({ plan, week }: { plan: Plan; week: number }) {
  const phases = plan.phases!;
  const currentIdx = phases.findIndex((p) => p.weeks.includes(week));
  const current = currentIdx >= 0 ? phases[currentIdx] : null;
  const ariaLabel = current
    ? `Phase ${currentIdx + 1} of ${phases.length}: ${current.name}, weeks ${Math.min(...current.weeks)}–${Math.max(...current.weeks)}`
    : `${phases.length} training phases`;

  return (
    <div className="phase-track" role="img" aria-label={ariaLabel}>
      {phases.map((p) => {
        const past = Math.max(...p.weeks) < week;
        const isCurrent = p.weeks.includes(week);
        const cls = ['phase-seg', past && 'is-past', isCurrent && 'is-current']
          .filter(Boolean).join(' ');
        return (
          <div key={p.name} className={cls} style={{ flex: p.weeks.length }}>
            {p.name}
          </div>
        );
      })}
    </div>
  );
}
