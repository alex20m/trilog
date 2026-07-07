'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SPORTS, DEFAULT_TARGETS } from '@/lib/constants';
import { todayStr, getWeekDates, getWeekTargets, getCurrentPhase, getRaceDays } from '@/lib/helpers';
import type { FormState, Plan, Session, Sport, TabId, WeekTargets } from '@/lib/types';
import WeekView from './WeekView';
import CalendarView from './CalendarView';
import AddView from './AddView';
import PlanView from './PlanView';
import { BootSkeleton, TargetsSheet } from './ui';
import {
  IconCalendar, IconChart, IconCheck, IconFlag, IconMoon, IconPlusCircle,
  IconRefresh, IconSliders, IconSun, IconTarget, IconX, LogoTri,
} from './icons';

type AuthState = 'loading' | 'loggedOut' | 'loggedIn';
type Theme = 'light' | 'dark';
interface ToastState { msg: string; error?: boolean; leaving?: boolean }

const EMPTY_FORM: Omit<FormState, 'sport' | 'date'> = {
  distance: '', hours: '0', minutes: '30', notes: '', exercises: '', heartRate: '',
};

export default function TriLog() {
  const [auth, setAuth]                   = useState<AuthState>('loading');
  const [tab, setTab]                     = useState<TabId>('week');
  const [manual, setManual]               = useState<Session[]>([]);
  const [strava, setStrava]               = useState<Session[]>([]);
  const [plan, setPlan]                   = useState<Plan | null>(null);
  const [customTargets, setCustomTargets] = useState<WeekTargets>(DEFAULT_TARGETS);
  const [syncing, setSyncing]             = useState(false);
  const [lastSync, setLastSync]           = useState<string | null>(null);
  const [showTargets, setShowTargets]     = useState(false);
  const [theme, setTheme]                 = useState<Theme | null>(null);
  const [toast, setToast]                 = useState<ToastState | null>(null);
  const [form, setForm]                   = useState<FormState>({
    sport: 'run', date: todayStr(), ...EMPTY_FORM,
  });

  // ── Toast host ────────────────────────────────────────────────────────────

  const toastTimers = useRef<{ hide?: ReturnType<typeof setTimeout>; remove?: ReturnType<typeof setTimeout> }>({});
  const showToast = useCallback((msg: string, error = false) => {
    clearTimeout(toastTimers.current.hide);
    clearTimeout(toastTimers.current.remove);
    setToast({ msg, error });
    toastTimers.current.hide = setTimeout(() => {
      setToast((t) => (t ? { ...t, leaving: true } : t));
      toastTimers.current.remove = setTimeout(() => setToast(null), 250);
    }, 2400);
  }, []);
  useEffect(() => {
    const timers = toastTimers.current;
    return () => {
      clearTimeout(timers.hide);
      clearTimeout(timers.remove);
    };
  }, []);

  // ── Theme ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const explicit = document.documentElement.dataset.theme;
    if (explicit === 'light' || explicit === 'dark') setTheme(explicit);
    else setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('trilog-theme', next); } catch { /* private mode */ }
    setTheme(next);
  };

  // ── Strava sync ───────────────────────────────────────────────────────────

  const syncStrava = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/activities', { credentials: 'include' });
      if (res.ok) {
        const { sessions } = await res.json() as { sessions: Session[] };
        setStrava(sessions);
        setLastSync(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
      } else {
        showToast('Sync failed — check connection', true);
      }
    } catch {
      showToast('Sync failed — check connection', true);
    } finally {
      setSyncing(false);
    }
  }, [showToast]);

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
    showToast('Session deleted');
  };

  const savePlan = (p: Plan) => {
    setPlan(p);
    fetch('/api/plan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
      credentials: 'include',
    }).catch(() => {});
    showToast('Plan loaded');
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
    showToast('Targets saved');
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
    setForm((f) => ({ ...f, date: todayStr(), ...EMPTY_FORM }));
    showToast('Session logged');
    setTimeout(() => setTab('week'), 400);
  };

  // Quick-add from the Today card: pre-set sport (if any) and today's date.
  const quickAdd = (sport: Sport | null) => {
    setForm((f) => ({ ...f, date: todayStr(), ...(sport ? { sport } : {}) }));
    setTab('log');
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
  const loading  = auth === 'loading';

  const navTabs = [
    { id: 'week'     as const, icon: IconChart,      label: 'Week' },
    { id: 'calendar' as const, icon: IconCalendar,   label: 'Calendar' },
    { id: 'log'      as const, icon: IconPlusCircle, label: 'Log' },
    { id: 'plan'     as const, icon: IconTarget,     label: 'Plan' },
  ];

  // ── Logged-out hero ───────────────────────────────────────────────────────

  if (auth === 'loggedOut') {
    return (
      <div className="login">
        <LogoTri width={64} height={48} />
        <h1 className="t-display">TriLog</h1>
        <p className="login-tagline t-body">
          Swim, bike, run — one log. Plan your season and track every session.
        </p>
        <a href="/api/auth/strava" className="btn btn-strava">Connect with Strava</a>
        <p className="login-footnote t-caption">
          Your activities sync automatically. Manual logging works too.
        </p>
      </div>
    );
  }

  // ── Shell (loading skeleton or main app) ──────────────────────────────────

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-header-left">
            <LogoTri width={28} height={21} />
            <span className="wordmark t-h2">TriLog</span>
            {phase && <span className="chip">{phase}</span>}
            {raceDays !== null && raceDays >= 0 && (
              <span className="chip chip-race" aria-label={`${raceDays} days to race`}>
                <IconFlag width={12} height={12} />
                <span className="t-num" aria-hidden="true">{raceDays}d</span>
              </span>
            )}
          </div>
          <div className="app-header-right">
            {lastSync && !syncing && (
              <span className="sync-time t-caption t-num">Synced {lastSync}</span>
            )}
            <button
              className={syncing ? 'icon-btn sync-btn is-syncing' : 'icon-btn sync-btn'}
              onClick={syncStrava}
              disabled={syncing || loading}
              aria-label="Sync Strava activities"
              aria-busy={syncing}
            >
              <IconRefresh width={20} height={20} />
            </button>
            <button
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark'
                ? <IconSun width={20} height={20} />
                : <IconMoon width={20} height={20} />}
            </button>
            <button
              className="icon-btn"
              onClick={() => setShowTargets(true)}
              disabled={loading}
              aria-label="Edit weekly targets"
            >
              <IconSliders width={20} height={20} />
            </button>
          </div>
        </div>
      </header>

      {showTargets && (
        <TargetsSheet
          targets={customTargets}
          onSave={saveTargets}
          onClose={() => setShowTargets(false)}
        />
      )}

      <main className="app-main">
        {loading ? (
          <BootSkeleton />
        ) : (
          <div className="view" key={tab}>
            {tab === 'week' && (
              <WeekView
                plan={plan} allSessions={all} weekDates={weekDates}
                weekTotals={weekTotals} targets={targets} gymDone={gymDone}
                lastSync={lastSync} syncing={syncing} onDelete={delManual}
                onQuickAdd={quickAdd} onGoLog={() => setTab('log')}
              />
            )}
            {tab === 'calendar' && (
              <CalendarView plan={plan} allSessions={all} onDelete={delManual} />
            )}
            {tab === 'log' && <AddView form={form} setForm={setForm} onAdd={addSession} />}
            {tab === 'plan' && (
              <PlanView plan={plan} allSessions={all} onSave={savePlan} onClear={clearPlan} />
            )}
          </div>
        )}
      </main>

      <nav className="tab-bar" role="tablist" aria-label="Views">
        {navTabs.map((t) => {
          const TabIcon = t.icon;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className="tab-item"
              onClick={() => setTab(t.id)}
            >
              <TabIcon />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {toast && (
        <div
          className={[
            'toast',
            toast.error && 'is-error',
            toast.leaving && 'is-leaving',
          ].filter(Boolean).join(' ')}
          role="status"
          aria-live="polite"
        >
          {toast.error ? <IconX /> : <IconCheck />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
