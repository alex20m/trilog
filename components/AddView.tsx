'use client';

import { useRef, useState } from 'react';
import { SPORTS } from '@/lib/constants';
import { fmtDur, todayStr } from '@/lib/helpers';
import type { FormState, Sport } from '@/lib/types';
import { SPORT_ICONS } from './icons';
import { Field, Stepper } from './ui';

interface Props {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onAdd: () => void;
}

type FieldKey = 'distance' | 'duration' | 'heartRate' | 'date';

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export default function AddView({ form, setForm, onAdd }: Props) {
  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setE = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k)(e.target.value);

  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const distRef = useRef<HTMLInputElement>(null);
  const durRef = useRef<HTMLDivElement>(null);
  const hrRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const isGym = form.sport === 'gym';
  const totalMin = (parseInt(form.hours) || 0) * 60 + (parseInt(form.minutes) || 0);
  const hr = form.heartRate === '' ? null : parseFloat(form.heartRate);

  const errors: Record<FieldKey, string | null> = {
    distance: !isGym && !(parseFloat(form.distance) > 0)
      ? 'Enter a distance greater than 0' : null,
    duration: totalMin <= 0 ? "Duration can't be zero" : null,
    heartRate: hr !== null && !(hr >= 30 && hr <= 250)
      ? 'Heart rate looks off (30–250 bpm)' : null,
    date: form.date > todayStr() ? "You can't log a future session" : null,
  };
  const show = (k: FieldKey) => ((touched[k] || submitted) ? errors[k] : null);
  const blur = (k: FieldKey) => () => setTouched((t) => ({ ...t, [k]: true }));

  const setDuration = (min: number) =>
    setForm((f) => ({ ...f, hours: String(Math.floor(min / 60)), minutes: String(min % 60) }));

  const submit = () => {
    setSubmitted(true);
    const order: [FieldKey, React.RefObject<HTMLElement>][] = [
      ['distance', distRef],
      ['duration', durRef],
      ['heartRate', hrRef],
      ['date', dateRef],
    ];
    const firstInvalid = order.find(([k]) => errors[k]);
    if (firstInvalid) {
      const el = firstInvalid[1].current;
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (el instanceof HTMLInputElement) el.focus({ preventScroll: true });
      return;
    }
    setSubmitted(false);
    setTouched({});
    onAdd();
  };

  const invalidProps = (k: FieldKey, id: string) =>
    show(k)
      ? { className: 'input is-invalid', 'aria-invalid': true as const, 'aria-describedby': id }
      : { className: 'input' };

  return (
    <div>
      <h1 className="screen-title t-h1">Log a session</h1>

      <div className="seg-picker">
        {(Object.keys(SPORTS) as Sport[]).map((key) => {
          const Icon = SPORT_ICONS[key];
          return (
            <button
              key={key}
              type="button"
              className={`seg-item sport-${key}`}
              aria-pressed={form.sport === key}
              onClick={() => set('sport')(key)}
            >
              <Icon />
              {SPORTS[key].label}
            </button>
          );
        })}
      </div>

      {!isGym && (
        <Field label="Distance (km)" error={show('distance')} errorId="err-distance" htmlFor="f-dist">
          <input
            id="f-dist"
            ref={distRef}
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            placeholder="e.g. 12.5"
            value={form.distance}
            onChange={setE('distance')}
            onBlur={blur('distance')}
            {...invalidProps('distance', 'err-distance')}
          />
        </Field>
      )}

      <Field label="Duration" error={show('duration')} errorId="err-duration">
        <div ref={durRef}>
          <Stepper
            value={totalMin}
            display={fmtDur(totalMin)}
            step={5}
            min={5}
            max={775}
            onChange={setDuration}
            decLabel="Decrease duration"
            incLabel="Increase duration"
          />
        </div>
      </Field>

      <Field label="Avg heart rate (bpm)" optional error={show('heartRate')} errorId="err-hr" htmlFor="f-hr">
        <input
          id="f-hr"
          ref={hrRef}
          type="number"
          inputMode="numeric"
          min="30"
          max="250"
          placeholder="e.g. 148"
          value={form.heartRate}
          onChange={setE('heartRate')}
          onBlur={blur('heartRate')}
          {...invalidProps('heartRate', 'err-hr')}
        />
      </Field>

      <Field label="Date" error={show('date')} errorId="err-date" htmlFor="f-date">
        <div className="chip-row">
          <button
            type="button"
            className={form.date === todayStr() ? 'chip-btn is-active' : 'chip-btn'}
            onClick={() => set('date')(todayStr())}
          >
            Today
          </button>
          <button
            type="button"
            className={form.date === yesterdayStr() ? 'chip-btn is-active' : 'chip-btn'}
            onClick={() => set('date')(yesterdayStr())}
          >
            Yesterday
          </button>
        </div>
        <input
          id="f-date"
          ref={dateRef}
          type="date"
          value={form.date}
          onChange={setE('date')}
          onBlur={blur('date')}
          {...invalidProps('date', 'err-date')}
        />
      </Field>

      {isGym && (
        <Field label="Exercises" optional htmlFor="f-ex">
          <textarea
            id="f-ex"
            className="input"
            placeholder={'Squat 4×8\nDeadlift 3×5\nPull-ups 4×8'}
            value={form.exercises}
            onChange={setE('exercises')}
            rows={4}
          />
        </Field>
      )}

      <Field label="Notes" optional htmlFor="f-notes">
        <input
          id="f-notes"
          className="input"
          type="text"
          placeholder="How did it feel?"
          value={form.notes}
          onChange={setE('notes')}
        />
      </Field>

      <button className="btn btn-primary" onClick={submit}>
        Save session
      </button>
    </div>
  );
}
