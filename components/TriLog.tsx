'use client';

import { useState, useEffect, useCallback } from 'react';
import { C, SPORTS, DEFAULT_TARGETS } from '@/lib/constants';
import { todayStr, getWeekDates, getWeekTargets, getCurrentPhase, getRaceDays } from '@/lib/helpers';
import type { FormState, Plan, Session, Sport, WeekTargets } from '@/lib/types';
import WeekView from './WeekView';
import CalendarView from './CalendarView';
import AddView from './AddView';
import PlanView from './PlanView';
import { TargetsSheet } from './ui';

type AuthState = 'loading' | 'loggedOut' | 'loggedIn';

export default function TriLog() {
  const [auth, setAuth]                   = useState<AuthState>('loading');
  const [tab, setTab]                     = useState<'week' | 'calendar' | 'log' | 'plan'>('week');
  const [manual, setManual]               = useState<Session[]>([]);
  const [strava, setStrava]               = useState<Session[]>([]);
  const [plan, setPlan]                   = useState<Plan | null>(null);
  const [customTargets, setCustomTargets] = useState<WeekTargets>(DEFAULT_TARGETS);
  const [syncing, setSyncing]             = useState(false);
  const [lastSync, setLastSync]           = useState<string | null>(null);
  const [showTargets, setShowTargets]     = useState(false);
  const [form, setForm]                   = useState<FormState>({
    sport: 'run', distance: '', hours: '0', minutes: '30',
    date: todayStr(), notes: '', exercises: '', heartRate: '',
  });
  const [flash, setFlash] = useState(false);

  const syncStrava = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/activities', { credentials: 'include' });
      if (res.ok) {
        const { sessions } = await res.json() as { sessions: Session[] };
        setStrava(sessions);
        setLastSync(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
      } else {
        setStrava([]);
      }
    } catch (_) { setStrava([]); }
    finally { setSyncing(false); }
  }, []);

  // Load all state from server on mount
  useEffect(() => {
    fetch('/api/state', { credentials: 'include' })
      .then(async (res) => {
        if (res.status === 401) { setAuth('loggedOut'); return; }
        if (!res.ok) throw new Error('state fetch failed');
        const data = await res.json() as {
          sessions: Session[];
          plan: Plan | null;
          targets: WeekTargets;
        };
        setManual(data.sessions);
        setPlan(data.plan);
        setCustomTargets(data.targets ?? DEFAULT_TARGETS);
        setAuth('loggedIn');
        syncStrava();
      })
      .catch(() => setAuth('loggedOut'));

    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') || params.get('error'))
      window.history.replaceState({}, '', '/');
  }, [syncStrava]);

  // ── Persistence: server API, optimistic local state ──────────────────────

  const addManual = async (s: Session) => {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
      credentials: 'include',
    });
    if (res.ok) {
      const { id } = await res.json() as { id: number };
      setManual((prev) => [{ ...s, id }, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    }
  };

  const delManual = (id: string | number) => {
    setManual((prev) => prev.filter((s) => s.id !== id));
    fetch(`/api/sessions?id=${id}`, { method: 'DELETE', credentials: 'include' }).catch(() => {});
  };

  const savePlan = (p: Plan) => {
    setPlan(p);
    fetch('/api/plan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
      credentials: 'include',
    }).catch(() => {});
  };

  const clearPlan = () => {
    setPlan(null);
    fetch('/api/plan', { method: 'DELETE', credentials: 'include' }).catch(() => {});
  };

  const saveTargets = (t: WeekTargets) => {
    setCustomTargets(t);
    setShowTargets(false);
    fetch('/api/targets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t),
      credentials: 'include',
    }).catch(() => {});
  };

  const addSession = async () => {
    const dist = parseFloat(form.distance);
    const dur  = parseInt(form.hours) * 60 + parseInt(form.minutes);
    if ((form.sport !== 'gym' && (!dist || isNaN(dist))) || dur <= 0) return;
    const hr = parseInt(form.heartRate);
    const s: Session = {
      date: form.date, sport: form.sport, duration: dur,
      notes: form.notes, source: 'manual',
      ...(form.sport !== 'gym' && { distance: dist }),
      ...(form.sport === 'gym' && form.exercises && {
        exercises: form.exercises.split('\n').map((e) => e.trim()).filter(Boolean),
      }),
      ...(!isNaN(hr) && hr > 0 && { heartRate: hr }),
    };
    await addManual(s);
    setForm((f) => ({ ...f, distance: '', hours: '0', minutes: '30', notes: '', exercises: '', heartRate: '', date: todayStr() }));
    setFlash(true);
    setTimeout(() => { setFlash(false); setTab('week'); }, 1200);
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const all        = [...strava, ...manual].sort((a, b) => b.date.localeCompare(a.date));
  const weekDates  = getWeekDates();
  const targets    = getWeekTargets(plan, weekDates, customTargets);
  const weekActual = all.filter((s) => weekDates.includes(s.date));

  const weekTotals = Object.fromEntries(Object.keys(SPORTS).map((k) => [k, 0])) as Record<Sport, number>;
  weekActual.forEach((s) => { if (s.distance) weekTotals[s.sport] = (weekTotals[s.sport] || 0) + s.distance; });
  const gymDone = weekActual.filter((s) => s.sport === 'gym').length;

  const phase    = getCurrentPhase(plan);
  const raceDays = getRaceDays(plan);

  const navTabs = [
    { id: 'week'     as const, icon: '📊', label: 'Week' },
    { id: 'calendar' as const, icon: '🗓️', label: 'Calendar' },
    { id: 'log'      as const, icon: '➕', label: 'Log' },
    { id: 'plan'     as const, icon: '🎯', label: 'Plan' },
  ];

  // ── Loading / logged-out screens ──────────────────────────────────────────

  if (auth === 'loading') {
    return (
      <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: C.muted, fontSize: '15px' }}>Loading…</span>
      </div>
    );
  }

  if (auth === 'loggedOut') {
    return (
      <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", background: C.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '32px' }}>
        <span style={{ fontSize: '48px' }}>🏅</span>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: C.navy, letterSpacing: '-0.5px' }}>TriLog</h1>
        <p style={{ margin: 0, color: C.muted, fontSize: '15px', textAlign: 'center', maxWidth: '280px', lineHeight: '1.5' }}>
          Track your triathlon training across devices. Connect Strava to get started.
        </p>
        <a href="/api/auth/strava" style={{
          background: C.strava, color: C.white, borderRadius: '12px',
          padding: '14px 28px', fontSize: '15px', fontWeight: '700',
          textDecoration: 'none', marginTop: '8px',
        }}>
          Connect with Strava
        </a>
      </div>
    );
  }

  // ── Main app ──────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", background: C.bg, minHeight: '100vh', color: C.text }}>
      <header style={{ background: C.navy, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🏅</span>
          <span style={{ color: C.white, fontWeight: '700', fontSize: '17px', letterSpacing: '-0.3px' }}>TriLog</span>
          {phase && (
            <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', borderRadius: '5px', padding: '2px 8px' }}>
              {phase}
            </span>
          )}
          {raceDays !== null && raceDays >= 0 && (
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>{raceDays}d to race</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={syncStrava} disabled={syncing} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '13px', cursor: 'pointer', borderRadius: '7px', padding: '5px 10px', fontFamily: 'inherit' }}>
            {syncing ? 'Syncing…' : '↻ Sync'}
          </button>
          <button onClick={() => setShowTargets(true)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '13px', cursor: 'pointer', borderRadius: '7px', padding: '5px 10px', fontFamily: 'inherit' }}>⚙</button>
        </div>
      </header>

      {showTargets && <TargetsSheet targets={customTargets} onSave={saveTargets} onClose={() => setShowTargets(false)} />}

      <div style={{ padding: '16px', maxWidth: '560px', margin: '0 auto', paddingBottom: '80px' }}>
        {tab === 'week'     && <WeekView plan={plan} allSessions={all} weekDates={weekDates} weekTotals={weekTotals} targets={targets} gymDone={gymDone} lastSync={lastSync} onDelete={delManual} />}
        {tab === 'calendar' && <CalendarView plan={plan} allSessions={all} />}
        {tab === 'log'      && <AddView form={form} setForm={setForm} onAdd={addSession} flash={flash} />}
        {tab === 'plan'     && <PlanView plan={plan} allSessions={all} onSave={savePlan} onClear={clearPlan} />}
      </div>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.surface, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 20 }}>
        {navTabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '10px 0 14px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: tab === t.id ? C.navy : C.muted }}>
            <span style={{ fontSize: '20px' }}>{t.icon}</span>
            <span style={{ fontSize: '11px', fontWeight: tab === t.id ? '600' : '400' }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
