export type Sport = 'run' | 'bike' | 'swim' | 'gym';
export type TabId = 'week' | 'calendar' | 'log' | 'plan';
export type StepType =
  | 'warmup' | 'easy' | 'tempo' | 'threshold'
  | 'interval' | 'vo2max' | 'race-pace' | 'cooldown' | 'recovery';

export interface WorkoutStep {
  type: StepType;
  duration?: number;
  distance?: number;
  pace?: string;
  reps?: number;
  rest?: string;
}

export interface Session {
  id?: string | number;
  date: string;
  sport: Sport;
  distance?: number;
  duration: number;
  heartRate?: number;
  notes?: string;
  note?: string;
  steps?: WorkoutStep[];
  intensity?: string;
  exercises?: string[];
  source?: 'strava' | 'manual';
}

export interface Phase {
  name: string;
  weeks: number[];
}

export interface Plan {
  name?: string;
  startDate?: string;
  raceDate?: string;
  phases?: Phase[];
  sessions: Session[];
}

export interface WeekTargets {
  run: number;
  bike: number;
  swim: number;
  gym: number;
}

export interface FormState {
  sport: Sport;
  distance: string;
  hours: string;
  minutes: string;
  date: string;
  notes: string;
  exercises: string;
  heartRate: string;
}
