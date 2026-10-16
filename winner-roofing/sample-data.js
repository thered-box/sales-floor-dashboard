/* =========================================================================
   Winner Roofing — sample data for the demo.
   Winner Roofing, its reps and every customer below are fictitious.
   Loaded in demo mode (the default for this edition — see demoByDefault in
   config.js; ?demo=0 shows the blank board). Delete this file once a real
   dataUrl is wired up.
   It builds window.SALES_SAMPLE_DATA in exactly the shape a live feed must
   return (see README.md → Data schema). The numbers are generated so the
   board looks full, and they follow the calendar: the board always shows the
   current month to date (or last month in full during the first week).
   New Lead timestamps are relative to now so the countdown ticks live.
   ========================================================================= */
window.SALES_SAMPLE_DATA = (function () {
  var seed = 20261016;                                  // fixed seed = same demo shape every load
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
  function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function pick(a) { return a[ri(0, a.length - 1)]; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

  var reps = [
    { name: "Marcus Hale",  color: "#4FC3F7" },
    { name: "Tina Alvarez", color: "#C084FC" },
    { name: "Derek Osei",   color: "#39D98A" },
    { name: "Kayla Brooks", color: "#FF8A3D" }
  ];

  /* month-to-date through today; in the first week, show last month in full so the charts look rich */
  var today = new Date(), asOf = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (asOf.getDate() < 7) asOf = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
  var Y = asOf.getFullYear(), M = asOf.getMonth(), DAYS = asOf.getDate();

  var customers = ["Hernandez Residence", "Whitaker Residence", "Oak Ridge HOA", "Maple Court Apartments",
    "Nguyen Residence", "Brookside Townhomes", "Garcia Residence", "Cedar Hills Plaza", "Thompson Residence",
    "Kowalski Residence", "Lakeview Community Church", "Ellis Residence", "Riverside Self Storage",
    "Baker Residence", "Sunset Ridge Duplexes", "Patel Residence", "Miller Residence", "Pine Hollow Office Park"];
  var homeowners = ["Laura Hernandez", "Greg Whitaker", "Anh Nguyen", "Carlos Garcia", "Beth Thompson",
    "Pete Kowalski", "Monica Ellis", "Ray Baker", "Sonia Patel", "Dave Miller", "Janet Cole", "Omar Haddad"];
  var jobs = ["Full Roof Replacement", "Storm Damage Repair", "Insurance Claim Restoration", "Metal Roof Install",
    "Gutters & Fascia", "Leak Repair", "Commercial TPO Re-roof", "Skylight Install"];
  var stages = ["Contract Signed", "Job Complete", "Paid in Full"];
  var payAmts = [450, 850, 1200, 2500, 2500, 4800, 6900, 9400, 12600, 15800];   // inspections & repairs → deposits → final draws

  var payments = [], deals = [], meetings = [];
  for (var day = 1; day <= DAYS; day++) {
    var date = new Date(Y, M, day), dstr = ymd(date);
    if (date.getDay() === 0) continue;                 // crews and office are off on Sundays
    reps.forEach(function (rep) {
      var np = ri(0, 2);
      for (var i = 0; i < np; i++)
        payments.push({ name: pick(customers), amount: pick(payAmts), date: dstr, rep: rep.name, newDeal: rnd() < 0.35 });
      var nm = ri(0, 2);
      for (var j = 0; j < nm; j++) {
        var h = ri(8, 17), hh = ((h + 11) % 12) + 1, ap = h < 12 ? "AM" : "PM";
        meetings.push({ contact: pick(homeowners), setter: rep.name, forRep: pick(reps).name,
          date: dstr + "T" + pad(h) + ":" + pick(["00", "15", "30", "45"]) + ":00",
          _label: hh + ":00 " + ap });
      }
    });
  }
  reps.forEach(function (rep) {
    var nd = ri(2, 4);
    for (var i = 0; i < nd; i++)
      deals.push({ name: pick(customers) + " — " + pick(jobs),
        amount: pick([8500, 12400, 14800, 18900, 22500, 27500, 34000, 48000]), rep: rep.name, stage: pick(stages),
        closeDate: ymd(new Date(Y, M, ri(1, DAYS))) });
  });

  /* calls: the Mon–Fri week containing asOf, week-to-date (days after asOf stay empty) */
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var dow = asOf.getDay(), mon = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate() - ((dow + 6) % 7));
  var week = [0, 1, 2, 3, 4].map(function (k) { return new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + k); });
  var callDays = week.map(function (d) { return DOW[d.getDay()] + " " + pad(d.getDate()); }), callsByRep = {};
  reps.forEach(function (rep) {
    callsByRep[rep.name] = week.map(function (d) {
      if (d > asOf) return { placed: 0, conn30: 0, conn60: 0, details: [] };
      var placed = ri(24, 78);
      var conn30 = Math.round(placed * (0.30 + rnd() * 0.20));
      var conn60 = Math.round(conn30 * (0.40 + rnd() * 0.30));
      var details = [];
      for (var i = 0; i < Math.min(4, placed); i++) {
        var h = ri(8, 17), hh = ((h + 11) % 12) + 1, ap = h < 12 ? "AM" : "PM";
        details.push({ name: pick(customers),
          number: "+1 (555) " + ri(200, 999) + "-" + ri(1000, 9999),
          durationSec: pick([9, 22, 41, 58, 74, 120, 180, 240]),
          time: hh + ":" + pick(["05", "17", "29", "44"]) + " " + ap });
      }
      return { placed: placed, conn30: conn30, conn60: conn60, details: details };
    });
  });

  var now = Date.now();
  function mago(m) { return new Date(now - m * 60000).toISOString(); }   // m minutes ago
  var newLeads = [
    { id: "WR-3101", name: "Whitaker Residence — hail damage",   owner: "Marcus Hale",  enteredAt: mago(1) },
    { id: "WR-3102", name: "Brookside Townhomes — re-roof bid",  owner: "Tina Alvarez", enteredAt: mago(3) },
    { id: "WR-3103", name: "Nguyen Residence — leak inspection", owner: "Derek Osei",   enteredAt: mago(8) },
    { id: "WR-3104", name: "Ellis Residence — insurance claim",  owner: "Kayla Brooks", enteredAt: mago(14) }
  ];

  return { asOf: ymd(asOf), reps: reps,
    payments: payments, deals: deals, meetings: meetings,
    calls: { days: callDays, byRep: callsByRep }, newLeads: newLeads };
})();
