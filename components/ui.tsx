'use client';

import { useState } from 'react';
import { C, SPORTS } from '@/lib/constants';
import type { Sport, WeekTargets } from '@/lib/types';

export function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '11px 14px' }}>
      <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: C.muted, marginTop: '1px' }}>{label}</div>
    </div>
  );
}

export function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function PlanChip({ label, sub, color }: { label: string; sub: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: '18px', fontWeight: '700', color: color ?? C.navy, letterSpacing: '-0.3px' }}>{label}</div>
      <div style={{ fontSize: '11px', color: C.muted }}>{sub}</div>
    </div>
  );
}

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
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: C.surface, borderRadius: '20px 20px 0 0', padding: '20px 20px 36px', width: '100%', maxWidth: '560px' }}>
        <p style={{ fontWeight: '700', fontSize: '16px', margin: '0 0 4px' }}>Weekly targets</p>
        <p style={{ fontSize: '13px', color: C.muted, margin: '0 0 14px' }}>Overridden by plan when loaded</p>
        {(Object.entries(SPORTS) as [Sport, typeof SPORTS[Sport]][]).map(([key, sport]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{sport.icon} {sport.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="number" min="0" value={t[key]}
                onChange={(e) => setT((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                style={{ width: '70px', textAlign: 'right', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px 8px', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
              />
              <span style={{ fontSize: '13px', color: C.muted, minWidth: '52px' }}>{key === 'gym' ? 'sessions' : 'km'}</span>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '13px', border: `1px solid ${C.border}`, borderRadius: '12px', background: 'none', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={() => onSave(t)} style={{ flex: 1, padding: '13px', border: 'none', borderRadius: '12px', background: C.navy, color: C.white, cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit' }}>Save</button>
        </div>
      </div>
    </div>
  );
}
