'use client';

import { useEffect, useRef, useState } from 'react';
import { SPORTS, STEP_CLASS } from '@/lib/constants';
import { fmtStep } from '@/lib/helpers';
import type { Sport, WeekTargets, WorkoutStep } from '@/lib/types';
import { SPORT_ICONS } from './icons';

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-card">
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}

export function Field({
  label,
  optional,
  error,
  errorId,
  htmlFor,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string | null;
  errorId?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={htmlFor}>
        {label}
        {optional && <span className="opt"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}

export function Stepper({
  value,
  display,
  step,
  min,
  max,
  onChange,
  small,
  decLabel,
  incLabel,
}: {
  value: number;
  display: string;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  small?: boolean;
  decLabel: string;
  incLabel: string;
}) {
  return (
    <div className={small ? 'stepper stepper-sm' : 'stepper'}>
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label={decLabel}
      >
        −
      </button>
      <span className="stepper-value" role="status">
        {display}
      </span>
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        aria-label={incLabel}
      >
        +
      </button>
    </div>
  );
}

export function StepList({ steps, className }: { steps: WorkoutStep[]; className?: string }) {
  return (
    <div className={className ? `step-list ${className}` : 'step-list'}>
      {steps.map((step, i) => (
        <div key={i} className="step-row">
          <span className={`step-type ${STEP_CLASS[step.type] ?? 'st-warmup'}`}>{step.type}</span>
          <span className="step-detail">{fmtStep(step)}</span>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      {icon}
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

export function BootSkeleton() {
  return (
    <div className="boot-skel" aria-busy="true" aria-label="Loading your training">
      <div className="boot-skel-stats">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
      <div className="skeleton skel-lg" />
      <div className="skeleton skel-md" />
      <div className="skeleton skel-md" />
      <div className="skeleton skel-md" />
    </div>
  );
}

const TARGET_STEP: Record<Sport, number> = { run: 5, bike: 5, swim: 1, gym: 1 };

export function TargetsSheet({
  targets,
  onSave,
  onClose,
}: {
  targets: WeekTargets;
  onSave: (t: WeekTargets) => void;
  onClose: () => void;
}) {
  const [t, setT] = useState<WeekTargets>({ ...targets });
  const [leaving, setLeaving] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Focus management + body scroll lock while open.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sheetRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, []);

  const close = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onClose, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    // Minimal focus trap: keep Tab cycling inside the sheet.
    if (e.key === 'Tab' && sheetRef.current) {
      const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div
      className={leaving ? 'sheet-backdrop is-leaving' : 'sheet-backdrop'}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Weekly targets"
        ref={sheetRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <div className="sheet-grab" aria-hidden="true" />
        <p className="sheet-title t-h2">Weekly targets</p>
        <p className="sheet-sub t-caption">Used when no plan is loaded</p>
        {(Object.keys(SPORTS) as Sport[]).map((key) => {
          const Icon = SPORT_ICONS[key];
          const unit = key === 'gym' ? 'sessions' : 'km';
          return (
            <div key={key} className={`target-row sport-${key}`}>
              <span className="target-label">
                <Icon />
                <span className="t-h3">{SPORTS[key].label}</span>
              </span>
              <span className="target-ctrl">
                <Stepper
                  small
                  value={t[key]}
                  display={String(t[key])}
                  step={TARGET_STEP[key]}
                  min={0}
                  max={999}
                  onChange={(v) => setT((p) => ({ ...p, [key]: v }))}
                  decLabel={`Decrease ${SPORTS[key].label} target`}
                  incLabel={`Increase ${SPORTS[key].label} target`}
                />
                <span className="target-unit t-caption">{unit}</span>
              </span>
            </div>
          );
        })}
        <div className="sheet-actions">
          <button className="btn btn-ghost" onClick={close}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(t)}>Save targets</button>
        </div>
      </div>
    </div>
  );
}
