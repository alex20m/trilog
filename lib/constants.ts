import type { CSSProperties } from 'react';
import type { Sport, WeekTargets } from './types';

export const C = {
  bg: '#EEF1F5', surface: '#FFFFFF', navy: '#1A2F3D',
  text: '#0F1923', muted: '#7A8A96', border: '#DDE3E8',
  white: '#FFFFFF', strava: '#FC4C02', green: '#16A34A',
};

export const SPORTS: Record<Sport, { label: string; icon: string; color: string }> = {
  run:  { label: 'Run',  icon: '🏃', color: '#C4622B' },
  bike: { label: 'Bike', icon: '🚴', color: '#2D7D4F' },
  swim: { label: 'Swim', icon: '🏊', color: '#3A80C8' },
  gym:  { label: 'Gym',  icon: '🏋️', color: '#7C3AED' },
};

export const DEFAULT_TARGETS: WeekTargets = { run: 40, bike: 150, swim: 8, gym: 3 };

export const STEP_COLORS: Record<string, string> = {
  warmup: '#7A8A96', cooldown: '#7A8A96',
  easy: '#16A34A', recovery: '#16A34A',
  tempo: '#D97706', threshold: '#C4622B',
  interval: '#DC2626', 'vo2max': '#9B1C1C', 'race-pace': '#DC2626',
};

export const inputStyle: CSSProperties = {
  width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`,
  borderRadius: '10px', fontSize: '14px', outline: 'none',
  fontFamily: 'inherit', background: C.surface, color: C.text,
};
