import type { Sport, WeekTargets } from './types';

// Sport colors live in CSS custom properties (app/globals.css) and are applied
// via the .sport-{key} class hooks; components only need labels here.
export const SPORTS: Record<Sport, { label: string }> = {
  run:  { label: 'Run' },
  bike: { label: 'Bike' },
  swim: { label: 'Swim' },
  gym:  { label: 'Gym' },
};

export const DEFAULT_TARGETS: WeekTargets = { run: 40, bike: 150, swim: 8, gym: 3 };

// Workout step type → CSS class carrying the intensity color.
export const STEP_CLASS: Record<string, string> = {
  warmup: 'st-warmup', cooldown: 'st-warmup',
  easy: 'st-easy', recovery: 'st-easy',
  tempo: 'st-tempo', threshold: 'st-threshold',
  interval: 'st-interval', 'race-pace': 'st-interval',
  vo2max: 'st-vo2max',
};
