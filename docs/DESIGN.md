# TriLog Design Specification v1.0

Implementation-ready redesign spec for TriLog (Next.js 15 + React 18, plain CSS).
The developer implements this **verbatim**: all tokens go in `app/globals.css`, components
switch from inline `style` props to the class names defined here. No new dependencies,
no Tailwind, no runtime font fetches, **no emoji anywhere in the UI** (inline SVG only).

---

## 1. Design direction

**"Race-day premium."** Modern, athletic, confident. Deep ink neutrals instead of the
current flat gray-blue; one saturated accent per sport used sparingly (left rails, dots,
progress fills, active states) on calm surfaces. Generous whitespace, soft 12–16px radii,
subtle layered shadows in light mode / borders + elevation-by-lightness in dark mode.
Numbers are the hero: stats are large, bold, `tabular-nums`. Motion is quick and physical
(120–320ms), never decorative.

### Sport color assignments

| Sport | Meaning | Light base | Dark base |
|---|---|---|---|
| Swim | open-water blue | `#0284C7` | `#38BDF8` |
| Bike | road-amber | `#D97706` | `#FBBF24` |
| Run | trail green | `#16A34A` | `#4ADE80` |
| Gym | iron violet | `#7C3AED` | `#A78BFA` |

Run is **green** (not red): green doubles as the "completed/target-hit" semantic already
used across the app, keeping the total color count low. Red is reserved exclusively for
danger (delete) and high-intensity workout steps (interval/vo2max).

Note: sport colors move from `lib/constants.ts` values to CSS variables. The `SPORTS`
object in constants may keep color strings for SVG-in-JS use, but they must be updated to
read `var(--c-run)` etc. or be replaced by the class hooks below.

---

## 2. Design tokens (`app/globals.css`)

Paste as the top of `globals.css`. Light is the `:root` default; dark applies via
`prefers-color-scheme` when no explicit choice exists, and via `[data-theme]` when it does.

```css
:root {
  /* ── Neutrals (light) ─────────────────────────────── */
  --c-bg:            #F2F4F7;  /* app background */
  --c-surface:       #FFFFFF;  /* cards, sheets, tab bar */
  --c-surface-2:     #F7F9FB;  /* nested wells: progress tracks, input bg */
  --c-border:        #E3E8EE;  /* hairlines */
  --c-border-strong: #C9D2DC;  /* input borders, dividers that must read */
  --c-text:          #101820;  /* primary text  (16.5:1 on surface) */
  --c-text-2:        #45525E;  /* secondary text (7.6:1) */
  --c-muted:         #5D6B78;  /* labels, captions (5.6:1 — replaces #7A8A96) */

  /* ── Brand / accent ──────────────────────────────── */
  --c-accent:        #16283A;  /* ink navy: primary buttons, active tab, today */
  --c-on-accent:     #FFFFFF;
  --c-accent-soft:   #E7EDF3;  /* tinted wash behind accent elements */

  /* ── Sport colors: base / text / tint ────────────── */
  /* base = fills, bars, dots, rails.  text = colored text on surface (≥4.5:1). */
  /* tint = background wash behind base-colored content. */
  --c-swim:       #0284C7;  --c-swim-text: #075985;  --c-swim-tint: #E0F2FE;
  --c-bike:       #D97706;  --c-bike-text: #92400E;  --c-bike-tint: #FEF3C7;
  --c-run:        #16A34A;  --c-run-text:  #166534;  --c-run-tint:  #DCFCE7;
  --c-gym:        #7C3AED;  --c-gym-text:  #5B21B6;  --c-gym-tint:  #EDE9FE;

  /* ── Semantic ────────────────────────────────────── */
  --c-success:       #16A34A;  /* intentionally = run green */
  --c-success-tint:  #DCFCE7;
  --c-warning:       #B45309;  /* missed-planned marker text */
  --c-warning-tint:  #FEF3C7;
  --c-danger:        #DC2626;
  --c-danger-tint:   #FEE2E2;
  --c-strava:        #FC4C02;  /* brand-locked, same in both themes */

  /* ── Workout step intensity ──────────────────────── */
  --c-step-warmup:    #5D6B78;
  --c-step-easy:      #16A34A;
  --c-step-tempo:     #B45309;
  --c-step-threshold: #C2410C;
  --c-step-interval:  #DC2626;
  --c-step-vo2max:    #991B1B;

  /* ── Shadows ─────────────────────────────────────── */
  --shadow-sm: 0 1px 2px rgba(16, 24, 32, 0.06);
  --shadow-md: 0 2px 8px rgba(16, 24, 32, 0.08), 0 1px 2px rgba(16, 24, 32, 0.05);
  --shadow-lg: 0 12px 32px rgba(16, 24, 32, 0.16), 0 2px 8px rgba(16, 24, 32, 0.08);
  --backdrop:  rgba(10, 15, 20, 0.45);

  /* ── Spacing (4px base) ──────────────────────────── */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
  --sp-5: 20px; --sp-6: 24px; --sp-7: 32px; --sp-8: 40px; --sp-9: 48px;

  /* ── Radii ───────────────────────────────────────── */
  --r-sm: 6px;  --r-md: 10px; --r-lg: 14px; --r-xl: 20px; --r-full: 999px;

  /* ── Typography ──────────────────────────────────── */
  --font-sans: var(--font-dm-sans, 'DM Sans'), -apple-system, BlinkMacSystemFont,
               'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace;

  --fs-display: 1.75rem;   /* 28px — login title, big stats */
  --fs-h1:      1.375rem;  /* 22px — screen titles */
  --fs-h2:      1.0625rem; /* 17px — card titles, header wordmark */
  --fs-h3:      0.9375rem; /* 15px — row titles, buttons */
  --fs-body:    0.875rem;  /* 14px — default */
  --fs-small:   0.8125rem; /* 13px — secondary rows */
  --fs-caption: 0.75rem;   /* 12px — meta, chips */
  --fs-overline:0.6875rem; /* 11px — uppercase section labels */

  --lh-tight: 1.2;
  --lh-body:  1.5;

  /* ── Motion ──────────────────────────────────────── */
  --dur-fast: 120ms;   /* presses, hovers */
  --dur-base: 200ms;   /* fades, view transitions */
  --dur-slow: 320ms;   /* sheets, toasts */
  --dur-fill: 600ms;   /* progress bar/ring fills */
  --ease-out:        cubic-bezier(0.2, 0, 0, 1);
  --ease-in-out:     cubic-bezier(0.4, 0, 0.2, 1);
  --ease-emphasized: cubic-bezier(0.22, 1, 0.36, 1); /* slight overshoot feel */

  /* ── Layout ──────────────────────────────────────── */
  --content-max: 560px;
  --header-h: 56px;
  --tabbar-h: 64px;
  --touch-min: 44px;

  color-scheme: light;
}

/* Dark values, applied two ways (system default + explicit toggle) */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --c-bg:            #0B1015;
    --c-surface:       #151C24;
    --c-surface-2:     #1D2630;
    --c-border:        #26313D;
    --c-border-strong: #364453;
    --c-text:          #EDF2F7;  /* 15.4:1 on surface */
    --c-text-2:        #AAB8C5;
    --c-muted:         #8B9AA8;  /* 5.2:1 */

    --c-accent:        #E8EDF2;  /* primary buttons invert to light in dark mode */
    --c-on-accent:     #101820;
    --c-accent-soft:   #1E2A36;

    --c-swim: #38BDF8; --c-swim-text: #7DD3FC; --c-swim-tint: rgba(56,189,248,0.14);
    --c-bike: #FBBF24; --c-bike-text: #FCD34D; --c-bike-tint: rgba(251,191,36,0.13);
    --c-run:  #4ADE80; --c-run-text:  #86EFAC; --c-run-tint:  rgba(74,222,128,0.13);
    --c-gym:  #A78BFA; --c-gym-text:  #C4B5FD; --c-gym-tint:  rgba(167,139,250,0.15);

    --c-success:      #4ADE80;
    --c-success-tint: rgba(74,222,128,0.13);
    --c-warning:      #FBBF24;
    --c-warning-tint: rgba(251,191,36,0.13);
    --c-danger:       #F87171;
    --c-danger-tint:  rgba(248,113,113,0.14);

    --c-step-warmup:    #8B9AA8;
    --c-step-easy:      #4ADE80;
    --c-step-tempo:     #FBBF24;
    --c-step-threshold: #FB923C;
    --c-step-interval:  #F87171;
    --c-step-vo2max:    #FCA5A5;

    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
    --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.5);
    --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.6);
    --backdrop:  rgba(0, 0, 0, 0.6);

    color-scheme: dark;
  }
}

/* Explicit user choice always wins over system */
:root[data-theme="dark"] {
  /* duplicate the entire dark block above, verbatim */
}
```

> **Implementation note:** yes, the dark variable block is written twice (inside the media
> query with `:not([data-theme="light"])`, and under `[data-theme="dark"]`). This is the
> dependency-free way to get: system default + explicit override in both directions.

### Base styles

```css
* , *::before, *::after { box-sizing: border-box; }

html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
  -webkit-font-smoothing: antialiased;
  transition: background-color var(--dur-base) var(--ease-in-out),
              color var(--dur-base) var(--ease-in-out);
}

button { font-family: inherit; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 3. Typography

Keep DM Sans via `next/font/google` in `layout.tsx` (bundled at build time — no runtime
fetch). Change the loader to expose a CSS variable so tokens can reference it:

```tsx
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans',
                         weight: ['400', '500', '600', '700', '800'] });
// <html lang="en" className={dmSans.variable}> ... <body> (no font class on body)
```

| Class | Size | Weight | Line-height | Extras | Use |
|---|---|---|---|---|---|
| `.t-display` | `--fs-display` | 800 | 1.1 | `letter-spacing:-0.02em` | Login title, hero numbers |
| `.t-h1` | `--fs-h1` | 700 | `--lh-tight` | `letter-spacing:-0.01em` | Month title, plan name |
| `.t-h2` | `--fs-h2` | 700 | `--lh-tight` | `letter-spacing:-0.01em` | Card titles, wordmark |
| `.t-h3` | `--fs-h3` | 600 | `--lh-tight` | — | Row titles, buttons |
| `.t-body` | `--fs-body` | 400 | `--lh-body` | — | Default copy |
| `.t-small` | `--fs-small` | 400 | 1.45 | color `--c-text-2` | Secondary lines |
| `.t-caption` | `--fs-caption` | 500 | 1.4 | color `--c-muted` | Meta, timestamps |
| `.t-overline` | `--fs-overline` | 700 | 1.3 | `text-transform:uppercase; letter-spacing:0.07em;` color `--c-muted` | Section labels ("This week", "Upcoming") |
| `.t-stat` | 1.5rem (24px) | 700 | 1.1 | `font-variant-numeric: tabular-nums; letter-spacing:-0.02em` | Stat card values |
| `.t-stat-sm` | 1.125rem (18px) | 700 | 1.1 | `tabular-nums` | Plan chips, progress numbers |
| `.t-num` | inherit | inherit | inherit | `font-variant-numeric: tabular-nums` | Any inline number (km, pace, HR, countdown) |

Every numeric value in the app (distances, durations, paces, HR, countdowns, calendar
day numbers) gets `tabular-nums` — apply `.t-num` or set it on the component class.

---

## 4. Iconography — inline SVG, 24×24

All icons are hand-written inline SVGs. One shared React helper is recommended
(`components/icons.tsx`) exporting each icon as a component. Default rendering:

```
viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
```

Rendered size: 20×20 in the header/rows, 22×22 in the tab bar, 16×16 inline in text.
Icons inherit color via `currentColor`. Exact paths:

| Name | Use | SVG content (inside `<svg>`) |
|---|---|---|
| `IconChart` | Week tab | `<path d="M6 20v-6"/><path d="M12 20V4"/><path d="M18 20v-10"/>` |
| `IconCalendar` | Calendar tab | `<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 9h18"/>` |
| `IconPlusCircle` | Log tab | `<circle cx="12" cy="12" r="9"/><path d="M12 8v8"/><path d="M8 12h8"/>` |
| `IconTarget` | Plan tab | `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>` |
| `IconSun` | Theme toggle (shown in dark mode) | `<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.9 4.9l1.4 1.4"/><path d="M17.7 17.7l1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.3 17.7l-1.4 1.4"/><path d="M19.1 4.9l-1.4 1.4"/>` |
| `IconMoon` | Theme toggle (shown in light mode) | `<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>` |
| `IconRefresh` | Sync button | `<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>` |
| `IconSliders` | Targets button | `<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>` |
| `IconSwim` | Swim (waves) | `<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"/>` |
| `IconBike` | Bike | `<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1" fill="currentColor"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>` |
| `IconRun` | Run (speed bolt) | `<path d="M13 2 3 14h7l-1 8 12-14h-7l-1-6z" fill="currentColor" stroke="none"/>` |
| `IconGym` | Gym (dumbbell) | `<path d="M8.5 12h7"/><rect x="4.5" y="8" width="3" height="8" rx="1"/><rect x="16.5" y="8" width="3" height="8" rx="1"/><path d="M2.5 10.5v3"/><path d="M21.5 10.5v3"/>` |
| `IconCheck` | Done marks | `<path d="M20 6 9 17l-5-5"/>` |
| `IconX` | Close buttons | `<path d="M18 6 6 18"/><path d="M6 6l12 12"/>` |
| `IconTrash` | Delete session | `<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>` |
| `IconChevronL` | Prev month | `<path d="M15 18l-6-6 6-6"/>` |
| `IconChevronR` | Next month | `<path d="M9 18l6-6-6-6"/>` |
| `IconFlag` | Race day | `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>` |
| `IconHeart` | HR readout | `<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/>` |
| `IconClipboard` | Copy AI prompt | `<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>` |
| `IconZzz` | Rest day | `<path d="M4 9h5l-5 6h5"/><path d="M13 5h5l-5 6h5"/>` |

Sport → icon mapping helper: `swim → IconSwim`, `bike → IconBike`, `run → IconRun`,
`gym → IconGym`. Sport icon color = `var(--c-swim|bike|run|gym)` via the parent's
sport class (see §5.4).

### Logo mark (header + login)

`LogoTri`: three overlapping stroked circles evoking the Olympic/tri-ring and the three
disciplines:

```html
<svg viewBox="0 0 32 24" fill="none" stroke-width="2.5">
  <circle cx="8"  cy="12" r="6" stroke="var(--c-swim)"/>
  <circle cx="16" cy="12" r="6" stroke="var(--c-bike)"/>
  <circle cx="24" cy="12" r="6" stroke="var(--c-run)"/>
</svg>
```

Rendered 28×21 in the header, 64×48 on the login screen.

---

## 5. Component specs

General card base used by several components:

```css
.card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--sp-4);
}
```

### 5.1 App header (`.app-header`)

Replaces the navy bar with a surface-colored, blurred sticky header.

- `position: sticky; top: 0; z-index: 20; height: var(--header-h);`
- `background: color-mix(in srgb, var(--c-surface) 85%, transparent);`
  `backdrop-filter: blur(12px) saturate(1.4); -webkit-backdrop-filter: (same);`
- `border-bottom: 1px solid var(--c-border);`
- Inner `.app-header-inner`: `max-width: var(--content-max); margin: 0 auto; height: 100%; display:flex; align-items:center; justify-content:space-between; padding: 0 var(--sp-4); gap: var(--sp-2);`
- Left group: `LogoTri` + wordmark `TriLog` (`.t-h2`, color `--c-text`) + `.chip` elements:
  - `.chip` (phase): `font-size: var(--fs-caption); font-weight:600; padding: 3px 10px; border-radius: var(--r-full); background: var(--c-accent-soft); color: var(--c-text-2);`
  - `.chip-race` (countdown): same shape, `background: var(--c-warning-tint); color: var(--c-warning);` contains `IconFlag` at 12×12 + text `{n}d` with `.t-num`. Full text moves into `aria-label="{n} days to race"`.
- Right group, three `.icon-btn`s in order: **sync**, **theme toggle**, **targets**.

```css
.icon-btn {
  width: 40px; height: 40px;            /* visual */
  display: grid; place-items: center;
  border: none; border-radius: var(--r-md);
  background: transparent; color: var(--c-text-2);
  cursor: pointer; position: relative;
  transition: background-color var(--dur-fast) var(--ease-out),
              color var(--dur-fast) var(--ease-out),
              transform var(--dur-fast) var(--ease-out);
}
.icon-btn::after {                       /* extend hit area to 44px */
  content: ''; position: absolute; inset: -2px;
}
.icon-btn:hover  { background: var(--c-surface-2); color: var(--c-text); }
.icon-btn:active { transform: scale(0.92); }
```

**Sync button** (`.icon-btn.sync-btn`): `IconRefresh`. While `syncing`, add
`.is-syncing` → the SVG gets `animation: spin 900ms linear infinite;`. Next to it (left
side, hidden below 400px viewport width) a `.sync-time` caption: `Synced 14:02`
(`.t-caption .t-num`). `aria-label="Sync Strava activities"`, add `aria-busy="true"`
while syncing.

```css
@keyframes spin { to { transform: rotate(360deg); } }
```

### 5.2 Bottom tab bar (`.tab-bar`)

- `position: fixed; bottom: 0; left: 0; right: 0; z-index: 20; height: calc(var(--tabbar-h) + env(safe-area-inset-bottom));`
- `padding-bottom: env(safe-area-inset-bottom);`
- `background: color-mix(in srgb, var(--c-surface) 92%, transparent); backdrop-filter: blur(12px);`
- `border-top: 1px solid var(--c-border); display: flex;`
- Content column padding-bottom must be `calc(var(--tabbar-h) + env(safe-area-inset-bottom) + var(--sp-4))`.

Each tab is `.tab-item` (a `<button>`):

```css
.tab-item {
  flex: 1; min-height: var(--touch-min);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; border: none; background: none; cursor: pointer;
  color: var(--c-muted); position: relative;
  transition: color var(--dur-fast) var(--ease-out);
}
.tab-item svg { width: 22px; height: 22px; transition: transform var(--dur-fast) var(--ease-out); }
.tab-item span { font-size: var(--fs-overline); font-weight: 500; }
.tab-item:active svg { transform: scale(0.88); }
.tab-item[aria-selected="true"] { color: var(--c-accent); }
.tab-item[aria-selected="true"] span { font-weight: 700; }
.tab-item[aria-selected="true"]::before {   /* active indicator pill */
  content: ''; position: absolute; top: 6px; width: 20px; height: 3px;
  border-radius: var(--r-full); background: var(--c-accent);
}
```

Tabs: `IconChart` Week · `IconCalendar` Calendar · `IconPlusCircle` Log ·
`IconTarget` Plan. Use `role="tablist"` on the nav, `role="tab"` +
`aria-selected` on buttons.

### 5.3 Stat cards (`.stat-card`)

Replaces `StatPill`. Row container `.stat-row { display:flex; gap: var(--sp-3); margin-bottom: var(--sp-4); }`

```css
.stat-card {
  flex: 1; background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-lg); padding: var(--sp-3) var(--sp-4);
  box-shadow: var(--shadow-sm);
}
.stat-card .value { /* .t-stat */ font-size: 1.5rem; font-weight: 700;
  font-variant-numeric: tabular-nums; letter-spacing: -0.02em; line-height: 1.1; }
.stat-card .label { /* .t-caption */ margin-top: 2px; color: var(--c-muted); }
```

Week view stat row: **Sessions** (count), **Total km**, **Synced** (time, or "—" with
label "Not synced"). Value color `--c-text`.

### 5.4 Sport color hooks

One modifier class per sport, applied to any component that is sport-scoped. All child
rules key off these variables:

```css
.sport-swim { --sport: var(--c-swim); --sport-text: var(--c-swim-text); --sport-tint: var(--c-swim-tint); }
.sport-bike { --sport: var(--c-bike); --sport-text: var(--c-bike-text); --sport-tint: var(--c-bike-tint); }
.sport-run  { --sport: var(--c-run);  --sport-text: var(--c-run-text);  --sport-tint: var(--c-run-tint);  }
.sport-gym  { --sport: var(--c-gym);  --sport-text: var(--c-gym-text);  --sport-tint: var(--c-gym-tint);  }
```

### 5.5 Weekly progress card (`.progress-card`)

`.card` containing an overline title (`Plan completion` / `This week`), an overall
**progress ring**, and four labeled **progress bars**.

**Layout:** `display: grid; grid-template-columns: 84px 1fr; gap: var(--sp-4); align-items: center;`
Ring on the left, the four bars stacked on the right (`display:flex; flex-direction:column; gap: var(--sp-3);`).

**Progress ring** (`.progress-ring`) — overall week completion = mean of the four
per-sport completion percentages (each clamped to 100):

```html
<svg class="progress-ring" width="84" height="84" viewBox="0 0 84 84"
     role="img" aria-label="Week 62% complete">
  <circle class="ring-track" cx="42" cy="42" r="36" fill="none"
          stroke="var(--c-surface-2)" stroke-width="8"/>
  <circle class="ring-fill" cx="42" cy="42" r="36" fill="none"
          stroke="var(--c-accent)" stroke-width="8" stroke-linecap="round"
          transform="rotate(-90 42 42)"
          stroke-dasharray="226.2"                     /* 2πr */
          style="stroke-dashoffset: calc(226.2 * (1 - var(--pct)))"/>
  <text x="42" y="47" text-anchor="middle"
        style="font: 700 1.125rem var(--font-sans); fill: var(--c-text);
               font-variant-numeric: tabular-nums">62%</text>
</svg>
```

`--pct` is set inline (`style={{ '--pct': 0.62 }}`). Fill animates:
`.ring-fill { transition: stroke-dashoffset var(--dur-fill) var(--ease-emphasized); }`
Ring stroke turns `var(--c-success)` at 100%.

**Progress bars** (`.progress-item`, add `.sport-*`):

```html
<div class="progress-item sport-run">
  <div class="progress-head">
    <span class="progress-name"><IconRun/> Run</span>
    <span class="progress-nums t-num">
      <strong>32.5</strong> / 40 km <IconCheck class="hit-check"/>
    </span>
  </div>
  <div class="progress-track" role="progressbar" aria-valuenow="81"
       aria-valuemin="0" aria-valuemax="100" aria-label="Run: 32.5 of 40 km">
    <div class="progress-fill" style="width: 81%"></div>
  </div>
</div>
```

```css
.progress-name { display:flex; align-items:center; gap: 6px;
  font-size: var(--fs-body); font-weight: 600; }
.progress-name svg { width:16px; height:16px; color: var(--sport); }
.progress-nums { font-size: var(--fs-small); color: var(--c-muted); }
.progress-nums strong { color: var(--c-text); font-weight: 700; }
.progress-item.is-hit .progress-nums strong { color: var(--sport-text); }
.hit-check { width: 14px; height: 14px; color: var(--sport); display: none; }
.progress-item.is-hit .hit-check { display: inline; }

.progress-track { height: 8px; margin-top: 6px; border-radius: var(--r-full);
  background: var(--c-surface-2); overflow: hidden; }
.progress-fill { height: 100%; border-radius: var(--r-full);
  background: var(--sport);
  transition: width var(--dur-fill) var(--ease-emphasized); }
```

Gym bar reads `2 / 3 sessions`. When a bar exceeds 100% keep width at 100% and show the
real number (e.g. `44 / 40 km`).

### 5.6 Today card (`.today-card`) — new, top of Week view

The first element under the stat row. Surfaces today's planned workout(s):

- `.card` with `border-left: 4px solid var(--c-accent);` and title row: overline
  `TODAY · WED 8 JUL` + a `.btn-quick-add` on the right.
- Body: today's `SessionRow`s (planned+actual pairs, same component as day cards).
- If nothing planned and nothing logged:
  text `Rest day — recover well.` (`.t-small`) with `IconZzz` at 16px, `--c-muted`.
- `.btn-quick-add`: pill button, `padding: 6px 12px; border-radius: var(--r-full);
  background: var(--c-accent); color: var(--c-on-accent); font-size: var(--fs-caption);
  font-weight: 600;` label `+ Log` — switches to the Log tab with the form's sport
  pre-set to today's first uncompleted planned sport and date = today.

The regular day-card list below then starts from **tomorrow** for future days plus all
past days of the week (today is no longer duplicated in the list).

### 5.7 Day cards (`.day-card`) and session rows (`.session-row`)

**Day card:**

```css
.day-card { background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-lg); padding: var(--sp-3) var(--sp-4);
  box-shadow: var(--shadow-sm); }
.day-card.is-today { border-color: color-mix(in srgb, var(--c-accent) 40%, var(--c-border)); }
.day-card.is-dim   { background: transparent; border: none; box-shadow: none;
  opacity: 0.45; padding: var(--sp-1) var(--sp-4); }
.day-card .day-label { /* .t-overline */ margin-bottom: var(--sp-2); }
.day-card.is-today .day-label { color: var(--c-accent); }
```

Drop the old colored left rail on day cards (rails move to session rows).

**Session row** — `div.session-row.sport-{sport}`:

```
[status] [sport icon] [content ................................] [delete]
```

```css
.session-row { display: flex; gap: var(--sp-2); align-items: flex-start;
  padding: var(--sp-2); margin: 0 calc(-1 * var(--sp-2));
  border-radius: var(--r-md); position: relative; }
.session-row + .session-row { margin-top: 2px; }

.session-status { width: 20px; height: 20px; flex-shrink: 0; margin-top: 1px;
  display: grid; place-items: center; border-radius: var(--r-full); }
.session-status.is-done    { background: var(--c-success-tint); color: var(--c-success); } /* IconCheck 12px */
.session-status.is-future  { border: 1.5px dashed var(--c-border-strong); color: transparent; }
.session-status.is-missed  { background: var(--c-warning-tint); color: var(--c-warning);
  font-size: 12px; font-weight: 800; } /* renders "!" as text */

.session-icon { width: 18px; height: 18px; flex-shrink: 0; margin-top: 2px;
  color: var(--sport); }
```

Content lines (all `.t-num` where numeric):
- **Planned line** (`.t-small`; when done, `color: var(--c-muted)` + the sport label
  keeps weight 600): `Run · 12 km · 1h 05min` + intensity chip
  `.intensity-chip { font-size: var(--fs-overline); font-weight: 600; padding: 1px 6px;
  border-radius: var(--r-sm); background: var(--sport-tint); color: var(--sport-text); }`
- **Steps block** (`.step-list`): each `.step-row { display:flex; gap: var(--sp-2);
  font-size: var(--fs-caption); }` with `.step-type { min-width: 72px; font-weight: 600;
  text-transform: capitalize; color: var(--c-step-{type}); }` and detail in `--c-muted`.
- **Actual line** (`.t-small`, `color: var(--c-text)`): `12.2 km · 1h 02min · 5:05/km`,
  optional `IconHeart` 12px + bpm in `--c-muted`, optional `.source-tag`
  (`font-size: var(--fs-overline); color: var(--c-strava); font-weight: 600;` text
  "STRAVA"). When there is a matching planned row, prefix distance with `↑` colored
  `--c-success`.

**Delete affordance (no swipe):** manual sessions render a trailing `.icon-btn.row-del`
(36px visual, 44px hit via `::after`) with `IconTrash` at 16px, `color: var(--c-muted)`.
It is always visible at `opacity: 0.55` (mobile has no hover); on `:hover` opacity 1 and
color `--c-danger`. **Two-tap confirm:** first tap sets row state
`.session-row.is-confirm` — the button becomes
`background: var(--c-danger); color: #fff; border-radius: var(--r-md);` and shows the
text label `Delete?` (`font-size: var(--fs-caption); font-weight: 700; padding: 0 10px;`)
instead of the icon; second tap within 3s deletes (row animates out:
`transition: opacity var(--dur-base), transform var(--dur-base); opacity:0; transform: translateX(8px);`
then unmount); after 3s with no tap, revert. `aria-label="Delete session"`, then
`aria-label="Confirm delete"`.

### 5.8 Calendar (`.cal-*`)

**Month header** `.cal-nav`: `display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--sp-4);`
- Prev/next: `.icon-btn` with `IconChevronL/R`, plus `border: 1px solid var(--c-border); background: var(--c-surface);`
  `aria-label="Previous month" / "Next month"`.
- Center: month title `.t-h1` (e.g. `July 2026`). Below it (or beside, caption) a
  `.btn-ghost-sm` "Today" that jumps back to the current month — visible only when the
  displayed month ≠ current month.

**Weekday header row** `.cal-dow`: 7-col grid, `.t-overline`, centered, letters
`M T W T F S S`.

**Grid** `.cal-grid { display:grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }`

**Day cell** — `<button class="cal-cell">` (button, not div — keyboard operable):

```css
.cal-cell { min-height: 52px; padding: 6px 2px; border-radius: var(--r-md);
  border: 1px solid transparent; background: var(--c-surface);
  display:flex; flex-direction:column; align-items:center; gap: 4px;
  cursor: pointer; font: inherit; position: relative;
  transition: background-color var(--dur-fast) var(--ease-out),
              border-color var(--dur-fast) var(--ease-out),
              transform var(--dur-fast) var(--ease-out); }
.cal-cell:active { transform: scale(0.95); }
.cal-cell .num { font-size: var(--fs-small); font-variant-numeric: tabular-nums; }

.cal-cell.is-today { border-color: var(--c-accent);
  box-shadow: inset 0 0 0 1px var(--c-accent); }          /* 2px ring effect */
.cal-cell.is-today .num { color: var(--c-accent); font-weight: 700; }

.cal-cell.is-selected { background: var(--c-accent); border-color: var(--c-accent); }
.cal-cell.is-selected .num { color: var(--c-on-accent); font-weight: 700; }

.cal-cell.is-race::after { /* race day corner flag */
  content: ''; position: absolute; top: 4px; right: 4px;
  width: 6px; height: 6px; border-radius: 1px; background: var(--c-danger);
  clip-path: polygon(0 0, 100% 0, 100% 100%); }
```

Race-day cell also gets `border-color: var(--c-danger)` when not selected, and the
day-detail sheet for that date shows a `.chip-race` with `IconFlag` + "RACE DAY".

**Activity dots** `.cal-dots { display:flex; gap: 3px; }`, dot:

```css
.cal-dot { width: 6px; height: 6px; border-radius: var(--r-full);
  background: var(--sport); }
.cal-dot.is-planned { background: transparent;
  box-shadow: inset 0 0 0 1.5px var(--sport); }   /* hollow = planned, not done */
```

Max 3 dots + a `--c-muted` overflow dot. On `.is-selected` cells, dots switch to
white/`--c-on-accent` fills (`.is-selected .cal-dot { background: var(--c-on-accent); }`,
planned ones hollow with on-accent ring) so they stay visible.

**Day detail (`.cal-detail`):** keep the inline card below the grid (not a modal): `.card`
with `animation: view-in var(--dur-base) var(--ease-out);` title `.t-h3` = long date,
close `.icon-btn` with `IconX` (`aria-label="Close day details"`). Rows are standard
`.session-row`s; deletion works here too (pass the real `onDelete`, fixing the current
no-op).

**Legend** `.cal-legend`: caption-sized, one dot + label per sport (dot uses `.cal-dot`),
plus a hollow dot labeled `Planned` and the red corner triangle labeled `Race`.

### 5.9 Log form (Add view)

Section title: `.t-h1` "Log a session" (replaces the overline — this is a screen title).

**Segmented sport picker** `.seg-picker`:

```css
.seg-picker { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-2);
  margin-bottom: var(--sp-5); }
.seg-item { min-height: 64px; display:flex; flex-direction:column; align-items:center;
  justify-content:center; gap: 4px; border-radius: var(--r-lg); cursor: pointer;
  border: 1.5px solid var(--c-border); background: var(--c-surface);
  color: var(--c-muted); font-size: var(--fs-caption); font-weight: 600;
  transition: border-color var(--dur-fast) var(--ease-out),
              background-color var(--dur-fast) var(--ease-out),
              color var(--dur-fast) var(--ease-out),
              transform var(--dur-fast) var(--ease-out); }
.seg-item svg { width: 22px; height: 22px; }
.seg-item:active { transform: scale(0.96); }
.seg-item[aria-pressed="true"] { border-color: var(--sport);
  background: var(--sport-tint); color: var(--sport-text); }
.seg-item[aria-pressed="true"] svg { color: var(--sport); }
```

Each `.seg-item` carries its `.sport-*` class and `aria-pressed`.

**Fields** — `.field` wrapper, `.field-label`, `.input`:

```css
.field { margin-bottom: var(--sp-4); }
.field-label { display:block; margin-bottom: 6px;
  font-size: var(--fs-caption); font-weight: 600; color: var(--c-text-2); }
.field-label .opt { font-weight: 400; color: var(--c-muted); } /* "(optional)" */

.input {
  width: 100%; min-height: var(--touch-min); padding: 10px 12px;
  border: 1.5px solid var(--c-border-strong); border-radius: var(--r-md);
  background: var(--c-surface); color: var(--c-text);
  font: inherit; font-size: var(--fs-h3); outline: none;
  transition: border-color var(--dur-fast) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-out); }
.input::placeholder { color: var(--c-muted); }
.input:focus { border-color: var(--c-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-accent) 18%, transparent); }
.input.is-invalid { border-color: var(--c-danger);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-danger) 15%, transparent); }
.field-error { margin-top: 4px; font-size: var(--fs-caption); color: var(--c-danger); }
```

Labels drop the uppercase treatment (sentence case, e.g. "Distance (km)"); mark optional
fields with `<span class="opt">(optional)</span>` instead of putting "optional" in caps.

**Duration steppers** `.stepper` replace the two `<select>`s:

```
[ − ]   1h 30min   [ + ]
```

```css
.stepper { display:flex; align-items:center; gap: var(--sp-2); }
.stepper-btn { width: 44px; height: 44px; border-radius: var(--r-md);
  border: 1.5px solid var(--c-border-strong); background: var(--c-surface);
  color: var(--c-text); font-size: 20px; font-weight: 600; cursor: pointer;
  display:grid; place-items:center;
  transition: background-color var(--dur-fast), transform var(--dur-fast); }
.stepper-btn:active { transform: scale(0.92); background: var(--c-surface-2); }
.stepper-btn:disabled { opacity: 0.35; cursor: default; }
.stepper-value { flex: 1; text-align: center; font-size: var(--fs-h3);
  font-weight: 700; font-variant-numeric: tabular-nums; }
```

− / + adjust in 5-minute increments (long-press optional, not required); range
0:05–12:55. Buttons get `aria-label="Decrease duration" / "Increase duration"`; the
value element gets `role="status"`. Holding state in `hours`/`minutes` strings is fine.

**Date field:** keep `<input type="date" class="input">` but add a quick-chip row above
it: `.chip-row { display:flex; gap: var(--sp-2); margin-bottom: 6px; }` with
`.chip-btn` pills **Today** / **Yesterday** (`border:1px solid var(--c-border-strong);
border-radius: var(--r-full); padding: 5px 12px; font-size: var(--fs-caption);
font-weight:600; background:var(--c-surface); color: var(--c-text-2);` — active chip:
`background: var(--c-accent); color: var(--c-on-accent); border-color: var(--c-accent);`).
Chips set the date input's value; picking any other date deactivates both.

**Validation:**
- Distance required for swim/bike/run: must parse to a number > 0. Invalid + touched →
  `.is-invalid` + `.field-error` "Enter a distance greater than 0".
- Duration must be > 0 min → error under the stepper: "Duration can't be zero".
- HR optional; if present must be 30–250 → "Heart rate looks off (30–250 bpm)".
- Date must not be > today → "You can't log a future session".
- Errors show on submit attempt or on blur after edit — never while first typing.
- Primary button is **not** disabled; pressing it with invalid fields scrolls to and
  focuses the first invalid field. Each error element gets `id`, input gets
  `aria-invalid="true"` + `aria-describedby`.

**Primary button** `.btn-primary`:

```css
.btn { min-height: 48px; padding: 0 var(--sp-5); border-radius: var(--r-lg);
  border: none; font-size: var(--fs-h3); font-weight: 700; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: var(--sp-2);
  transition: transform var(--dur-fast) var(--ease-out),
              background-color var(--dur-fast) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-out); }
.btn:active { transform: scale(0.98); }
.btn-primary { width: 100%; background: var(--c-accent); color: var(--c-on-accent);
  box-shadow: var(--shadow-md); }
.btn-primary:hover { box-shadow: var(--shadow-lg); }
.btn-secondary { background: var(--c-surface); color: var(--c-text);
  border: 1.5px solid var(--c-border-strong); }
.btn-ghost { background: none; color: var(--c-muted);
  border: 1px solid var(--c-border); }
```

Label: **Save session**. On success, do **not** morph the button — fire the toast (§5.14),
reset the form, and switch to the Week tab after 400ms (the toast persists across the
tab switch because it is rendered at the shell level).

### 5.10 Plan view

**Active-plan summary card:** `.card`. Overline `ACTIVE PLAN`, plan name `.t-h1`, then
`.plan-chips { display:flex; gap: var(--sp-5); flex-wrap: wrap; margin-top: var(--sp-3); }`
with `.plan-chip` = `.t-stat-sm` value over `.t-caption` label. Countdown value turns
`--c-warning` under 14 days. Value color default `--c-text` (not navy).

**Phase timeline** (`.phase-track`) — replaces the wrap of chips with a proportional
segmented bar:

```html
<div class="phase-track" role="img" aria-label="Phase 2 of 4: Build, weeks 5–10">
  <div class="phase-seg is-past"    style="flex: 4">Base</div>
  <div class="phase-seg is-current" style="flex: 6">Build</div>
  <div class="phase-seg"            style="flex: 4">Peak</div>
  <div class="phase-seg"            style="flex: 2">Taper</div>
</div>
```

```css
.phase-track { display: flex; gap: 3px; height: 34px; }
.phase-seg { display:grid; place-items:center; border-radius: var(--r-sm);
  background: var(--c-surface-2); color: var(--c-muted);
  font-size: var(--fs-caption); font-weight: 600; min-width: 0;
  overflow: hidden; white-space: nowrap; }
.phase-seg:first-child { border-top-left-radius: var(--r-md); border-bottom-left-radius: var(--r-md); }
.phase-seg:last-child  { border-top-right-radius: var(--r-md); border-bottom-right-radius: var(--r-md); }
.phase-seg.is-past    { background: var(--c-accent-soft); color: var(--c-text-2); }
.phase-seg.is-current { background: var(--c-accent); color: var(--c-on-accent); font-weight: 700; }
```

`flex` = number of weeks in the phase. Below the track a caption row:
`Week 6 of 16 · Build` (`.t-caption .t-num`).

**Upcoming workout cards** (`.workout-card.sport-*`):

```css
.workout-card { background: var(--c-surface); border: 1px solid var(--c-border);
  border-left: 4px solid var(--sport); border-radius: var(--r-md);
  padding: var(--sp-3) var(--sp-4); margin-bottom: var(--sp-2);
  box-shadow: var(--shadow-sm); }
```

Header row: sport icon (18px, `--sport`) + `.t-h3` title `Run · 12 km`, right-aligned
date `.t-caption .t-num`. Second line `.t-caption`: duration + intensity chip + note.
Steps use the same `.step-list` as session rows. The first upcoming card (next workout)
gets a `.chip` reading `NEXT` (accent-soft background) after its title.

**Empty plan state:** see §5.13. The JSON textarea keeps `--font-mono` at
`font-size: var(--fs-small)`; the JSON error message becomes a `.field-error`. "Copy AI
prompt" button = `.btn-secondary` with `IconClipboard`; when copied, swap icon to
`IconCheck` and text "Copied" for 2s (color `--c-success`, border-color `--c-success`).
"Replace plan" button at the bottom = `.btn-ghost`.

### 5.11 Targets bottom sheet (`.sheet`)

```css
.sheet-backdrop { position: fixed; inset: 0; z-index: 50; background: var(--backdrop);
  animation: fade-in var(--dur-base) var(--ease-out);
  display:flex; align-items:flex-end; justify-content:center; }
.sheet { width: 100%; max-width: var(--content-max);
  background: var(--c-surface); border-radius: var(--r-xl) var(--r-xl) 0 0;
  padding: var(--sp-3) var(--sp-5) calc(var(--sp-7) + env(safe-area-inset-bottom));
  box-shadow: var(--shadow-lg);
  animation: sheet-up var(--dur-slow) var(--ease-emphasized); }
.sheet-grab { width: 36px; height: 4px; border-radius: var(--r-full);
  background: var(--c-border-strong); margin: 0 auto var(--sp-4); }

@keyframes fade-in  { from { opacity: 0; } }
@keyframes sheet-up { from { transform: translateY(100%); } }
```

- Title `.t-h2` "Weekly targets", subtitle `.t-caption` "Used when no plan is loaded".
- One row per sport: `.target-row { display:flex; align-items:center;
  justify-content:space-between; min-height: 52px; border-bottom: 1px solid var(--c-border); }`
  Left: sport icon (18px, sport color) + `.t-h3` label. Right: a compact `.stepper`
  (36px buttons, step = 5 km for run/bike, 1 for swim km and gym sessions) + unit caption.
- Footer: `.btn-ghost` Cancel + `.btn-primary` Save targets, `flex: 1` each,
  gap `--sp-3`, margin-top `--sp-5`.
- Behavior: backdrop click and Escape close; focus moves into the sheet on open and
  returns to the targets button on close; `role="dialog" aria-modal="true"
  aria-label="Weekly targets"`. Body scroll locked while open (`overflow: hidden` on body).

### 5.12 Login screen (`.login`)

Full-viewport hero:

```css
.login { min-height: 100vh; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap: var(--sp-4);
  padding: var(--sp-7); text-align:center; position: relative; overflow: hidden;
  background: var(--c-bg); }
.login::before {   /* ambient sport-color glow */
  content: ''; position: absolute; inset: -40% -20% auto;  height: 80%;
  background:
    radial-gradient(40% 50% at 25% 40%, color-mix(in srgb, var(--c-swim) 22%, transparent), transparent 70%),
    radial-gradient(40% 50% at 50% 30%, color-mix(in srgb, var(--c-bike) 18%, transparent), transparent 70%),
    radial-gradient(40% 50% at 75% 40%, color-mix(in srgb, var(--c-run) 20%, transparent), transparent 70%);
  filter: blur(40px); pointer-events: none; }
```

Stack (all `animation: view-in var(--dur-slow) var(--ease-out)` with 60ms stagger via
`animation-delay`): `LogoTri` at 64×48 → title `TriLog` `.t-display` → tagline
`.t-body` `color: var(--c-text-2)` max-width 300px: *"Swim, bike, run — one log.
Plan your season and track every session."* → Strava CTA:

```css
.btn-strava { /* extends .btn */ background: var(--c-strava); color: #fff;
  padding: 0 var(--sp-6); box-shadow: 0 8px 24px color-mix(in srgb, var(--c-strava) 35%, transparent); }
```

Label: **Connect with Strava**. Below it a `.t-caption` footnote:
"Your activities sync automatically. Manual logging works too."

### 5.13 Empty states (`.empty-state`)

```css
.empty-state { text-align:center; padding: var(--sp-8) var(--sp-5);
  display:flex; flex-direction:column; align-items:center; gap: var(--sp-2); }
.empty-state svg { width: 40px; height: 40px; color: var(--c-muted); opacity: 0.7;
  stroke-width: 1.5; }
.empty-state h3 { /* .t-h3 */ margin: var(--sp-1) 0 0; }
.empty-state p  { /* .t-small */ margin: 0; color: var(--c-muted); max-width: 280px; }
```

| Where | Icon | Title | Body | Action |
|---|---|---|---|---|
| Week view, no sessions & no plan | `IconChart` | No sessions yet | Log your first workout or sync Strava to see your week fill up. | `.btn-secondary` "Log a session" → Log tab |
| Calendar day sheet, rest day | `IconZzz` | Rest day | Nothing planned or logged. | — |
| Plan tab, no plan | `IconTarget` | No plan loaded | Paste a JSON plan below, or copy the AI prompt to generate one from your history. | (existing cards follow) |

### 5.14 Toast (`.toast`)

Rendered by the shell (`TriLog.tsx`), replaces the button-morph flash:

```css
.toast { position: fixed; left: 50%; transform: translateX(-50%);
  bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom) + var(--sp-4));
  z-index: 60; display:flex; align-items:center; gap: var(--sp-2);
  background: var(--c-accent); color: var(--c-on-accent);
  border-radius: var(--r-full); padding: 10px 18px;
  font-size: var(--fs-body); font-weight: 600; box-shadow: var(--shadow-lg);
  animation: toast-in var(--dur-slow) var(--ease-emphasized); }
.toast svg { width: 16px; height: 16px; color: var(--c-run); }
.toast.is-leaving { transition: opacity var(--dur-base), transform var(--dur-base);
  opacity: 0; transform: translateX(-50%) translateY(8px); }

@keyframes toast-in {
  from { opacity: 0; transform: translateX(-50%) translateY(12px); } }
```

Content: `IconCheck` + "Session logged". Auto-dismiss after 2.4s. Container has
`role="status" aria-live="polite"`. Also reuse for "Targets saved", "Plan loaded",
"Session deleted", and errors (error variant: `background: var(--c-danger); color:#fff;`
icon `IconX`) e.g. "Sync failed — check connection".

### 5.15 Loading skeletons (`.skeleton`)

Replace the "Loading…" text at boot with a skeleton of the Week view inside the normal
shell chrome (header + tab bar may render immediately in a neutral state):

```css
.skeleton { position: relative; overflow: hidden;
  background: var(--c-surface-2); border-radius: var(--r-md); }
.skeleton::after { content: ''; position: absolute; inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent,
    color-mix(in srgb, var(--c-text) 5%, transparent), transparent);
  animation: shimmer 1.4s var(--ease-in-out) infinite; }
@keyframes shimmer { to { transform: translateX(100%); } }
```

Boot skeleton layout: 3 stat-card blocks (height 62px) in a row → one 180px card →
three 84px cards, all with `--sp-3` gaps. Give the container
`aria-busy="true" aria-label="Loading your training"`.

While Strava sync is in flight after boot, do **not** skeleton existing content — only
the sync icon spins and the "Synced" stat shows `…`.

---

## 6. Motion summary

| Event | Effect | Duration / easing |
|---|---|---|
| Tab switch | new view: `animation: view-in` — fade from 0 + `translateY(6px)` → 0 | `--dur-base` / `--ease-out` |
| Sheet open | backdrop `fade-in`; panel `sheet-up` from `translateY(100%)` | 200ms / 320ms, `--ease-emphasized` |
| Sheet close | reverse via `.is-leaving` transition (opacity + translateY(24px)), unmount after 200ms | `--dur-base` / `--ease-in-out` |
| Progress bar fill | `width` transition | `--dur-fill` / `--ease-emphasized` |
| Progress ring fill | `stroke-dashoffset` transition | `--dur-fill` / `--ease-emphasized` |
| Button / cell press | `transform: scale(0.92–0.98)` | `--dur-fast` / `--ease-out` |
| Toast in/out | `toast-in` keyframe / `.is-leaving` | `--dur-slow` in, `--dur-base` out |
| Sync spinner | `spin` 900ms linear infinite | — |
| Row delete | opacity 0 + `translateX(8px)` then unmount | `--dur-base` |
| Theme switch | body background/color transition | `--dur-base` / `--ease-in-out` |

```css
@keyframes view-in { from { opacity: 0; transform: translateY(6px); } }
```

Apply `view-in` by keying the tab content wrapper: `<div key={tab} className="view">`
with `.view { animation: view-in var(--dur-base) var(--ease-out); }`.
All animation respects the global `prefers-reduced-motion` rule in §2.

---

## 7. Dark mode toggle

- **Control:** third `.icon-btn` in the header. Shows `IconMoon` when the resolved theme
  is light ("switch to dark"), `IconSun` when dark. `aria-label="Switch to dark theme"` /
  `"Switch to light theme"` (update per state).
- **State model:** `localStorage` key **`trilog-theme`** with values `"light" | "dark"`;
  absent = follow system. Toggling always writes an explicit value (resolved opposite of
  the current effective theme). No third "system" position in the UI.
- **Mechanism:** toggle sets `document.documentElement.dataset.theme = value` and writes
  localStorage. CSS in §2 handles the rest.
- **No-flash boot:** add a tiny inline script in `layout.tsx` `<head>` (rendered via
  `<script dangerouslySetInnerHTML>`), before any paint:

```js
(function(){try{var t=localStorage.getItem('trilog-theme');
if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}})();
```

- Add `suppressHydrationWarning` on `<html>`. Also set
  `<meta name="theme-color" content="#F2F4F7">` and
  `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0B1015">`.

---

## 8. UX improvements (functional changes to implement)

1. **Today card first** (§5.6): today's planned workout + quick-add pinned above the day
   list; day list no longer duplicates today.
2. **Overall week ring** (§5.5): single at-a-glance completion % beside per-sport bars.
3. **Quick-add prefill:** `+ Log` on the Today card jumps to the Log tab with sport and
   date preselected from the first uncompleted planned session.
4. **Clear sync status:** spinning icon while syncing; "Synced HH:MM" caption in header
   (≥400px) and in the third stat card; failed sync raises the error toast instead of
   silently emptying Strava data.
5. **Two-tap delete with visible affordance** (§5.7) — replaces the tiny borderless `×`;
   also enabled inside the calendar day detail (currently a no-op there).
6. **Date quick-chips** Today / Yesterday on the log form (§5.9) — most sessions are
   logged same-day or next-morning.
7. **Steppers replace duration selects** (§5.9): one tap per 5 min beats scrolling a
   13-item + 12-item select pair.
8. **Form validation states** (§5.9): inline errors, focus-first-invalid, no silent
   `return` on invalid submit (current behavior gives zero feedback).
9. **Calendar "Today" jump button** (§5.8) when browsing other months.
10. **Race-day visibility:** corner flag marker on the calendar cell, `RACE DAY` chip in
    day details, warning-colored countdown chip in the header and Plan view under 14 days.
11. **Proportional phase timeline** (§5.10) with "Week n of N" — replaces unanchored
    chips.
12. **"NEXT" tag on the first upcoming workout** in Plan view.
13. **Toast system** (§5.14) for save/delete/sync feedback — consistent, non-blocking,
    screen-reader announced.
14. **Boot skeleton** (§5.15) instead of a bare "Loading…" line.
15. **Empty states with a next step** (§5.13) — every empty view tells the user what to
    do and offers the action where sensible.

---

## 9. Accessibility

- **Focus visibility:** global rule —

```css
:focus-visible { outline: 2px solid var(--c-swim); outline-offset: 2px;
  border-radius: var(--r-sm); }
```

  (Swim blue is the most visible accent on both themes; inputs additionally keep their
  focus box-shadow.) Never `outline: none` without a `:focus-visible` replacement.
- **Contrast:** body text ≥ 4.5:1 (tokens above satisfy this: `--c-text` 16.5:1,
  `--c-muted` 5.6:1 light / 5.2:1 dark); large stats ≥ 3:1; UI borders/icons that convey
  meaning ≥ 3:1 against adjacent surface. Sport **text** always uses `--sport-text`
  (≥ 4.5:1 on `--c-surface`), never the base fill color. Meaning is never color-only:
  done = check icon, planned = hollow dot, missed = "!" badge, race = flag.
- **Touch targets:** every interactive element ≥ 44×44px hit area (`--touch-min`; use the
  `::after` inset trick for visually smaller icons). Calendar cells ≥ 44px tall.
- **ARIA labels for every icon-only button:**
  sync "Sync Strava activities" (+`aria-busy`), theme toggle per §7, targets
  "Edit weekly targets", month nav "Previous/Next month", close buttons
  "Close day details", delete "Delete session" → "Confirm delete", steppers
  "Increase/Decrease duration". Tab bar: `role="tablist"` / `role="tab"` /
  `aria-selected`; labels are visible text so no extra aria needed there.
- **Live regions:** toast `role="status" aria-live="polite"`; sync time change is not
  announced (avoid noise).
- **Dialogs:** targets sheet per §5.11 (focus trap, Escape, focus return).
- **Reduced motion:** honored globally (§2).
- **Language:** dates rendered as text (not icons); countdown chip carries a full
  `aria-label`.

---

## 10. Responsive behavior

Mobile-first; the current 560px column remains the base. One breakpoint: **768px**.

```css
@media (min-width: 768px) {
  :root { --content-max: 880px; }

  /* Floating pill tab bar instead of full-width edge bar */
  .tab-bar { left: 50%; right: auto; transform: translateX(-50%);
    bottom: var(--sp-5); width: 420px; height: 60px;
    border: 1px solid var(--c-border); border-radius: var(--r-full);
    box-shadow: var(--shadow-lg); padding-bottom: 0; }

  /* Week view: summary column + day list */
  .week-grid { display: grid; grid-template-columns: 320px 1fr;
    gap: var(--sp-5); align-items: start; }
  .week-aside { position: sticky; top: calc(var(--header-h) + var(--sp-4)); }

  .cal-cell { min-height: 72px; }
  .cal-grid { gap: 6px; }

  .sheet { border-radius: var(--r-xl); margin-bottom: var(--sp-6);
    max-width: 480px; }          /* centered floating card, not edge-to-edge */
  .sheet-backdrop { align-items: center; }

  .login .t-display { font-size: 2.25rem; }
}
```

Week view markup: wrap stat row + progress card + Today card in `.week-aside`, day list
in `.week-main`, both inside `.week-grid` (on mobile the grid collapses to one column —
`.week-grid { display:block; }` default). Hover states (`.icon-btn:hover`, `.cal-cell:hover
{ background: var(--c-surface-2); }`, `.day-card` shadow-md on hover) activate naturally
on pointer devices; they're specified above and are no-ops on touch.

---

## 11. Implementation checklist (suggested order)

1. `globals.css`: tokens (§2), base styles, typography utilities (§3), keyframes (§6).
2. `layout.tsx`: font variable, theme boot script, meta theme-color (§7).
3. `components/icons.tsx`: all SVGs from §4.
4. Shell (`TriLog.tsx`): header, tab bar, theme toggle, toast host, boot skeleton.
5. Week view: stat cards, progress card + ring, Today card, day cards, session rows,
   delete confirm.
6. Log form: segmented picker, inputs, steppers, chips, validation.
7. Calendar: nav, grid, cells, dots, race marker, detail card, legend.
8. Plan view: summary, phase track, workout cards, empty state.
9. Targets sheet, login screen, empty states.
10. Pass: aria labels, focus order, reduced-motion check, both themes on every screen.
