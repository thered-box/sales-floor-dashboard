/* =========================================================================
   Sales Floor Dashboard — Winner Roofing configuration
   Winner Roofing is a fictitious demo brand. Edit the values below to change
   the branding or point the board at a real data feed.
   Everything here is optional; anything you omit falls back to a default.
   ========================================================================= */
window.DASHBOARD_CONFIG = {

  /* ---- branding ---- */
  brandName: "WINNER ROOFING",  // shown top-left
  brandTag:  "SALES FLOOR",     // small muted text after the brand (optional)
  accent:    "#DBB568",         // trophy gold from the Winner Roofing logo (brand red #E21E25 is set in index.html)
  logo:      "assets/winner-roofing-badge.png",  // top bar + cover slide; "" to hide
  currency:  "$",               // money prefix, e.g. "$", "£", "€", "A$"

  /* ---- the team ----
     One entry per rep. `color` is used for that rep across every chart.
     (If your data feed includes its own `reps` array, that overrides this.)
     These match the fictitious reps in sample-data.js. */
  reps: [
    { name: "Marcus Hale",  color: "#4FC3F7" },
    { name: "Tina Alvarez", color: "#C084FC" },
    { name: "Derek Osei",   color: "#39D98A" },
    { name: "Kayla Brooks", color: "#FF8A3D" }
  ],

  /* ---- data source ----
     dataUrl: a URL that returns the dashboard JSON (see README.md → Data schema).
     demoByDefault: true = with no dataUrl, the board opens on the sample data.
              The footer link switches between sample data and a blank board,
              and ?demo=1 / ?demo=0 on the URL does the same. */
  dataUrl: "",
  demoByDefault: true,

  /* ---- timing ---- */
  slideMs:       12000,   // time each slide is shown (ms)
  refreshMs:     180000,  // how often live data is re-fetched (ms) — 3 min
  newLeadPollMs: 20000,   // how often new leads are polled for the countdown/ding (ms)
  slaSeconds:    300,     // New Lead SLA — timer turns red past this many seconds (300 = 5 min)

  /* ---- sound alerts ----
     enabled:   master on/off. When on, a "🔔 Enable alerts" button appears
                (browsers require one click before any audio can play).
     A gentle chime plays when a new lead arrives; an escalating klaxon plays
     while a lead sits past the SLA (every minute for the first 5, then every 5).
     startHour/endHour: restrict alerts to business hours (24h clock). Leave both
                null for always-on. Example: 10 and 20 = 10:00am–8:00pm only.
     timeZone:  IANA name (e.g. "America/New_York") to anchor the hours to a
                specific zone; null = the viewing device's local time. */
  sound: { enabled: true, startHour: null, endHour: null, timeZone: null }

};
