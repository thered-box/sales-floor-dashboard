/* =========================================================================
   Sample data for the demo (loaded only when the page runs in demo mode:
   add ?demo=1 to the URL, or set demoByDefault:true in config.js).
   This file is NOT needed in production — delete it once you wire up dataUrl.
   It builds window.SALES_SAMPLE_DATA in exactly the shape a live feed must
   return (see README.md → Data schema). The numbers are generated so the
   board looks full; New Lead timestamps are relative to now so the countdown
   ticks live.
   ========================================================================= */
window.SALES_SAMPLE_DATA = (function () {
  var seed = 20260627;                                  // fixed seed = same demo every load
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
  function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function pick(a) { return a[ri(0, a.length - 1)]; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  var reps = [
    { name: "Alex Rivera", color: "#4FC3F7" },
    { name: "Sam Chen",    color: "#C084FC" },
    { name: "Jordan Lee",  color: "#FF8A3D" }
  ];
  var MONTH = "2026-06", DAYS = 27;                      // a full month so charts look rich
  var companies = ["Summit Builders", "Harbor & Co.", "Redwood Homes", "Beacon Facilities",
    "Ironwood Group", "Crestline LLC", "Meridian Retail", "Oakridge Partners", "Blue Delta",
    "Vantage Foods", "Northgate Auto", "Silverpeak", "Copper Canyon", "Lakeshore Dental",
    "Pioneer Fitness", "Maple & Vine", "Granite Works", "Cedar Point Co."];
  var people = ["Chris Patel", "Dana Wolfe", "Miguel Santos", "Priya Nair", "Tom Becker",
    "Ava Long", "Ken Ihara", "Rosa Marin", "Leah Dubois", "Marcus Webb"];
  var stages = ["Deal Won", "Paid in Full", "Contract Signed"];
  var amts = [99, 199, 299, 499, 1000, 2000, 3000, 4000, 5000];

  var payments = [], deals = [], meetings = [];
  for (var day = 1; day <= DAYS; day++) {
    var dstr = MONTH + "-" + pad(day);
    reps.forEach(function (rep) {
      var np = ri(0, 2);
      for (var i = 0; i < np; i++)
        payments.push({ name: pick(companies), amount: pick(amts), date: dstr, rep: rep.name, newDeal: rnd() < 0.4 });
      var nm = ri(0, 2);
      for (var j = 0; j < nm; j++) {
        var h = ri(8, 17), hh = ((h + 11) % 12) + 1, ap = h < 12 ? "AM" : "PM";
        meetings.push({ contact: pick(people), setter: rep.name, forRep: pick(reps).name,
          date: dstr + "T" + pad(h) + ":" + pick(["00", "15", "30", "45"]) + ":00",
          _label: hh + ":00 " + ap });
      }
    });
  }
  reps.forEach(function (rep) {
    var nd = ri(2, 4);
    for (var i = 0; i < nd; i++)
      deals.push({ name: pick(companies) + " — " + pick(["Website", "Install", "Retainer", "Package", "Service Plan"]),
        amount: pick([3500, 5000, 6500, 8000, 12000, 15000]), rep: rep.name, stage: pick(stages),
        closeDate: MONTH + "-" + pad(ri(1, DAYS)) });
  });

  var callDays = ["Mon 22", "Tue 23", "Wed 24", "Thu 25", "Fri 26"], callsByRep = {};
  reps.forEach(function (rep) {
    callsByRep[rep.name] = callDays.map(function () {
      var placed = ri(24, 78);
      var conn30 = Math.round(placed * (0.30 + rnd() * 0.20));
      var conn60 = Math.round(conn30 * (0.40 + rnd() * 0.30));
      var details = [];
      for (var i = 0; i < Math.min(4, placed); i++) {
        var h = ri(8, 17), hh = ((h + 11) % 12) + 1, ap = h < 12 ? "AM" : "PM";
        details.push({ name: pick(companies),
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
    { id: "L-2041", name: "Summit Builders",   owner: "Alex Rivera", enteredAt: mago(2) },
    { id: "L-2042", name: "Harbor & Co.",      owner: "Sam Chen",    enteredAt: mago(4) },
    { id: "L-2043", name: "Redwood Homes",     owner: "Jordan Lee",  enteredAt: mago(9) },
    { id: "L-2044", name: "Beacon Facilities", owner: "Alex Rivera", enteredAt: mago(16) }
  ];

  return { asOf: MONTH + "-" + pad(DAYS), reps: reps,
    payments: payments, deals: deals, meetings: meetings,
    calls: { days: callDays, byRep: callsByRep }, newLeads: newLeads };
})();
