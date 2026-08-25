# Sales Floor Dashboard

A full-screen, auto-advancing **sales scoreboard for a TV or wall display**. Dark
"scoreboard" look, one metric per slide, a live **New Lead countdown** with SLA
alerts, and click-through detail on every number.

It's a plain static website — **HTML, CSS, and one JavaScript file, no build step
and no backend required.** Point it at a JSON feed from *any* source (your CRM,
a spreadsheet export, a small script) and it renders. Ships with a **sample-data
demo** so you can see the whole thing before wiring up real numbers.

---

## Quick start

```bash
# clone, then serve the folder with any static server:
python3 -m http.server 8080
#  → open http://localhost:8080/            (blank board)
#  → open http://localhost:8080/?demo=1     (sample data)
```

You can also just double-click `index.html` to open it — the **sample demo works
from `file://`** because the sample data is a `.js` file. (Live data via `dataUrl`
needs the page served over http/https, which any host below gives you.)

### The three modes

| Mode | How to get it | What shows |
|------|---------------|------------|
| **Blank** | default (no `dataUrl` set) | the full board with empty states — your starting point |
| **Sample** | add `?demo=1` to the URL, or set `demoByDefault: true` | realistic fake data so you can see every slide |
| **Live** | set `dataUrl` in `config.js` | your real numbers, auto-refreshing |

A small footer link lets you jump into/out of the sample demo at any time.

---

## The slides

1. **Team Scoreboard** — month-to-date cash, revenue, payment count, new deals.
2. **Monthly Running Total** — per-rep + team boxes and a cumulative cash line.
3. **Daily Cash Collected** — a bar per day of the month.
4. **Rep Scoreboard** — the full per-rep table.
5. **Meetings Scheduled — Daily** — one stacked bar per day, by setter.
6. **Calls This Week — by Day** — dials placed per rep per weekday, shaded by connect length.
7. **New Lead Countdown** — every waiting lead with a live timer that turns
   **green → amber → red** against your SLA, with optional sound alerts.

**Every number is clickable** — clicking a tile, table cell, or chart bar opens a
detail list of the underlying records (and links out to your CRM if you include a
`url` on each record).

**Controls:** `Space` pause/play · `←/→` change slide · `Esc` close a detail
popup · bottom-right button pauses · bottom-left button arms sound.

---

## Configure it — `config.js`

Everything is optional; omit anything to keep the default.

```js
window.DASHBOARD_CONFIG = {
  brandName: "SALES FLOOR",      // top-left title
  brandTag:  "Acme Co.",         // small muted text after the brand (optional)
  accent:    "#FFC20E",          // one accent color used everywhere
  currency:  "$",                // "$", "£", "€", "A$", …

  reps: [                        // one entry per rep; color is used in every chart
    { name: "Alex Rivera", color: "#4FC3F7" },
    { name: "Sam Chen",    color: "#C084FC" }
  ],

  dataUrl: "",                   // URL returning the JSON below. "" = blank/demo.
  demoByDefault: false,          // true = show sample data when dataUrl is empty

  slideMs: 12000,                // ms per slide
  refreshMs: 180000,             // ms between live data refreshes
  newLeadPollMs: 20000,          // ms between new-lead polls
  slaSeconds: 300,               // New Lead SLA in seconds (300 = 5 min)

  sound: { enabled: true, startHour: null, endHour: null, timeZone: null }
};
```

**Sound alerts** — when `enabled`, a “🔔 Enable alerts” button appears (browsers
require one click before any audio plays). A gentle chime fires when a new lead
arrives; an escalating klaxon fires while a lead sits past the SLA (every minute
for the first 5, then every 5). Restrict to business hours with `startHour` /
`endHour` (24-hour clock, e.g. `10` and `20` = 10am–8pm); leave both `null` for
always-on. `timeZone` (an IANA name like `"America/New_York"`) anchors those
hours to a zone; `null` uses the viewing device's local time.

---

## Wire up your data — the JSON schema

Set `dataUrl` to any URL that returns this JSON (CORS must allow the dashboard's
origin). The board re-fetches it every `refreshMs`. A complete, valid example is
in [`data.example.json`](data.example.json).

```jsonc
{
  "asOf": "2026-06-12",           // YYYY-MM-DD — drives the month label & day count
  "reps": [                        // optional; overrides config.reps if present
    { "name": "Alex Rivera", "color": "#4FC3F7" }
  ],

  // Client payments received this month. Powers cash, payment count,
  // new-deal count, the daily bars, and the cumulative line.
  "payments": [
    { "name": "Summit Builders",   // shown in the detail list
      "amount": 4000,
      "date": "2026-06-02",        // YYYY-MM-DD
      "rep": "Alex Rivera",        // must match a rep name
      "newDeal": true,             // true = counts toward "New Deals"
      "url": "https://…" }         // optional: click-through link
  ],

  // Deals closed this month. Powers the Revenue numbers.
  "deals": [
    { "name": "Summit Builders — Website", "amount": 6500,
      "rep": "Alex Rivera", "stage": "Deal Won",
      "closeDate": "2026-06-03", "url": "https://…" }   // stage & url optional
  ],

  // Meetings booked. Powers the daily meetings chart (grouped by setter).
  "meetings": [
    { "contact": "Chris Patel",    // who the meeting is with
      "setter": "Alex Rivera",     // who booked it (must match a rep name)
      "forRep": "Sam Chen",        // who it's for (shown in detail)
      "date": "2026-06-03T10:00:00" }
  ],

  // Outbound calls for the current week. Pre-aggregated per rep, per weekday.
  "calls": {
    "days": ["Mon 08", "Tue 09", "Wed 10", "Thu 11", "Fri 12"],
    "byRep": {
      "Alex Rivera": [             // one entry per day, same order as "days"
        { "placed": 52,           // total dials  (bar height)
          "conn30": 24,           // dials connected ≥30s  (must be ≤ placed)
          "conn60": 11,           // dials connected ≥60s  (must be ≤ conn30)
          "details": [            // optional: rows shown when a bar is clicked
            { "name": "Summit Builders", "number": "+1 (555) 201-8890",
              "durationSec": 83, "time": "9:14 AM" }
          ] }
      ]
    }
  },

  // Leads currently waiting in your "new lead" stage. Powers the countdown.
  "newLeads": [
    { "id": "L-2041",             // stable id (used to de-dupe/ding new arrivals)
      "name": "Ironwood Group",
      "owner": "Alex Rivera",
      "enteredAt": "2026-06-12T14:25:00Z",   // ISO 8601 — the timer counts from here
      "url": "https://…" }        // optional: click the row to open it
  ]
}
```

**Notes**
- Any section may be an empty array — that slide just shows an empty state.
- `rep` / `setter` / `owner` strings must match a rep `name` exactly.
- The dashboard does all month/day/cumulative math itself; you only supply the
  records above. There is no Zoho/Salesforce/etc. coupling — produce this JSON
  however you like (CRM API, a nightly script writing `data.json`, a Google
  Sheet published as JSON, a serverless function…).

---

## Deploy

It's static, so anything that serves files works:

- **GitHub Pages** — Settings → Pages → deploy from the repo root. (For a private
  repo, Pages requires a paid GitHub plan; otherwise clone and host it yourself.)
- **Netlify / Vercel / Cloudflare Pages** — drop the folder in, no config.
- **Any web server / S3 bucket / office file share** — copy the files.
- **On a TV** — open the deployed URL full-screen (most smart-TV/kiosk browsers
  have a fullscreen or kiosk mode); the board auto-advances on its own.

To go live: host your JSON somewhere the page can fetch, set `dataUrl` to it,
and (optionally) delete `sample-data.js`.

---

## Files

| File | What it is |
|------|------------|
| `index.html` | the whole dashboard (HTML + CSS + JS) |
| `config.js` | your settings — branding, reps, data URL, timings, sound |
| `sample-data.js` | demo data for `?demo=1` (safe to delete in production) |
| `data.example.json` | a copy-me example of the live data schema |
| `README.md` | this file |

---

## License

MIT — see [`LICENSE`](LICENSE). Use it, rebrand it, hand it to clients.
