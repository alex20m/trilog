'use client';

import { C, SPORTS, inputStyle } from '@/lib/constants';
import { todayStr } from '@/lib/helpers';
import type { FormState, Sport } from '@/lib/types';
import { Fld } from './ui';

interface Props {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onAdd: () => void;
  flash: boolean;
}

export default function AddView({ form, setForm, onAdd, flash }: Props) {
  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setE = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(k)(e.target.value);
  const isGym = form.sport === 'gym';

  return (
    <div>
      <p style={{ margin: '0 0 14px', fontSize: '11px', fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Log a session</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px', marginBottom: '14px' }}>
        {(Object.entries(SPORTS) as [Sport, typeof SPORTS[Sport]][]).map(([key, sport]) => {
          const active = form.sport === key;
          return (
            <button key={key} onClick={() => set('sport')(key)} style={{
              padding: '10px 4px', borderRadius: '12px',
              border: `2px solid ${active ? sport.color : C.border}`,
              background: active ? sport.color + '18' : C.surface,
              color: active ? sport.color : C.muted,
              fontFamily: 'inherit', fontSize: '12px', fontWeight: '600',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            }}>
              <span style={{ fontSize: '20px' }}>{sport.icon}</span>
              {sport.label}
            </button>
          );
        })}
      </div>

      {!isGym && (
        <Fld label="Distance (km)">
          <input type="number" step="0.1" min="0" placeholder="e.g. 12.5" value={form.distance} onChange={setE('distance')} style={inputStyle} />
        </Fld>
      )}

      <Fld label="Duration">
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={form.hours} onChange={setE('hours')} style={{ ...inputStyle, flex: 1 }}>
            {Array.from({ length: 13 }, (_, i) => <option key={i} value={i}>{i}h</option>)}
          </select>
          <select value={form.minutes} onChange={setE('minutes')} style={{ ...inputStyle, flex: 1 }}>
            {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => <option key={m} value={m}>{m}min</option>)}
          </select>
        </div>
      </Fld>

      <Fld label="Avg heart rate (bpm, optional)">
        <input type="number" min="0" max="250" placeholder="e.g. 148" value={form.heartRate} onChange={setE('heartRate')} style={inputStyle} />
      </Fld>

      <Fld label="Date">
        <input type="date" value={form.date} onChange={setE('date')} style={inputStyle} />
      </Fld>

      {isGym && (
        <Fld label="Exercises (one per line)">
          <textarea
            placeholder={'Squat 4×8\nDeadlift 3×5\nPull-ups 4×8'}
            value={form.exercises}
            onChange={setE('exercises')}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
          />
        </Fld>
      )}

      <Fld label="Notes (optional)">
        <input type="text" placeholder="How did it feel?" value={form.notes} onChange={setE('notes')} style={inputStyle} />
      </Fld>

      <button onClick={onAdd} style={{
        width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
        background: flash ? SPORTS[form.sport].color : C.navy,
        color: C.white, fontSize: '15px', fontWeight: '600', cursor: 'pointer',
        fontFamily: 'inherit', transition: 'background 0.25s ease', marginTop: '4px',
      }}>
        {flash ? '✓ Logged!' : 'Save session'}
      </button>
    </div>
  );
}

