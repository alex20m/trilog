# TriLog Plan Format

This document describes the JSON format that TriLog reads for training plans.

---

## Schema

```json
{
  "name": "string — plan name displayed in the header",
  "startDate": "YYYY-MM-DD — first day of training",
  "raceDate": "YYYY-MM-DD — race day (optional, shown as countdown)",
  "phases": [
    {
      "name": "string — phase name, e.g. Base, Build, Peak, Taper",
      "weeks": [1, 2, 3, 4]
    }
  ],
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "sport": "run|bike|swim|gym",
      "distance": 10,           // km, required for run/bike/swim, omit for gym
      "duration": 65,           // total minutes, required
      "note": "string",         // optional session title shown italicised
      "steps": [                // required for run/bike/swim — see step schema below
        { "type": "warmup",   "duration": 10, "pace": "6:30/km" },
        { "type": "interval", "reps": 6, "duration": 4, "pace": "4:10/km", "rest": "2min easy" },
        { "type": "cooldown", "duration": 10, "pace": "6:30/km" }
      ]
    },
    {
      "date": "YYYY-MM-DD",
      "sport": "gym",
      "duration": 60,
      "note": "Upper body"      // just a label: Upper body / Lower body / Full body
    }
  ]
}
```

---

## Step schema

| Field | Type | Notes |
|-------|------|-------|
| `type` | string | `warmup`, `easy`, `tempo`, `threshold`, `interval`, `vo2max`, `race-pace`, `cooldown`, `recovery` |
| `duration` | number | minutes for this step (or per rep for intervals) |
| `distance` | number | km alternative to duration (useful for swim intervals) |
| `pace` | string | Run: `"X:XX/km"` · Bike: `"XX km/h"` · Swim: `"X:XX/100m"` |
| `reps` | number | Number of repetitions (intervals only) |
| `rest` | string | Rest between reps, e.g. `"90s easy"`, `"2min easy"` (intervals only) |

---

## AI prompt

Use the **"Copy AI prompt"** button on the Plan tab. It automatically includes your recent Strava and manually-logged sessions so the AI can calibrate paces to your actual fitness.

Paste the copied prompt into Claude (or any AI), paste the returned JSON back into the app, and hit Load.

---

## Field reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `date` | YYYY-MM-DD | Yes | Explicit date |
| `sport` | enum | Yes | `run`, `bike`, `swim`, `gym` |
| `distance` | number | For run/bike/swim | kilometres |
| `duration` | number | Yes | total minutes |
| `note` | string | No | Session title shown italicised |
| `steps` | array | For run/bike/swim | Detailed workout breakdown |

## Tips

- **Multiple sessions per day** are fine — add two objects with the same date (e.g. brick workouts)
- **Gym sessions** only need a `note` ("Upper body", "Lower body", "Full body") — no `steps` or `exercises` needed
- **Backward compatible** — old plans with `intensity`/`exercises` fields still render correctly
- The **phase** shown in the header is determined by which week falls in which phase's `weeks` array
- **Race countdown** in the header is automatic from `raceDate`
- Strava activities are matched to planned sessions by sport + date
