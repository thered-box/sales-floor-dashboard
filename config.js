/* =========================================================================
   Sales Floor Dashboard — configuration
   Edit the values below to brand the board and point it at your data.
   Everything here is optional; anything you omit falls back to a default.
   ========================================================================= */
window.DASHBOARD_CONFIG = {

  /* ---- branding ---- */
  brandName: "SALES FLOOR",     // shown top-left
  brandTag:  "",                // small muted text after the brand, e.g. "Acme Co." (optional)
  accent:    "#FFC20E",         // one accent color used throughout (hex)
  currency:  "$",               // money prefix, e.g. "$", "£", "€", "A$"

  /* ---- the team ----
     One entry per rep. `color` is used for that rep across every chart.
     (If your data feed includes its own `reps` array, that overrides this.) */
  reps: [
    { name: "Rep One", color: "#4FC3F7" },
    { name: "Rep Two", color: "#C084FC" }
    // { name: "Rep Three", color: "#FF8A3D" },
  ],

  /* ---- data source ----
     dataUrl: a URL that returns the dashboard JSON (see README.md → Data schema).
              Leave "" to run blank; add ?demo=1 to the page URL to preview sample data.
     demoByDefault: if true AND dataUrl is empty, the board shows sample data
              instead of a blank board. */
  dataUrl: "",
  demoByDefault: false,

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
