// ═══════════════════════════════════════════════════════════════════════════
// pages/AnalyticsDashboard.js — Event ROI + analytics charts.
//
// Props: events, isUR, P (palette), noteState, onSelectEvent
// Depends on: constants.js (C, UR), helpers defined in EventsPage helpers section
// ═══════════════════════════════════════════════════════════════════════════

// ─── Conference scoring helpers (used here + EventsPage) ─────────────────────
function scoreConference(c) {
  var a = c.audience || [];
  if (!a.length) return 1;
  return Math.max.apply(null, a.map(function(x) { return AUDIENCE_SCORES[x] || 1; }));
}
function scoreLabel(s) {
  if (s >= 5) return { label: "Tier 1 – Best Fit",      color: C.ocean   };
  if (s >= 4) return { label: "Tier 2 – Strong Fit",    color: "#35657b" };
  if (s >= 3) return { label: "Tier 3 – Good Fit",      color: C.cyan    };
  if (s >= 2) return { label: "Tier 4 – Moderate Fit",  color: C.orange  };
  return       { label: "Tier 5 – Low Priority",  color: C.gray    };
}
function totalCost(c)  { return (c.cost || 0) + (c.sponsorshipCost || 0); }
function calcRoi(c)    { var s = totalCost(c); if (c.attended !== true || s <= 0) return null; return (((c.revenue || 0) - s) / s * 100).toFixed(0); }
function statusColor(s){ if (s === "Attending" || s === "Completed") return C.cyan; if (s === "Considering" || s === "Submitted") return C.orange; return C.gray; }
function urStatusColor(s){ if (s === "Attending" || s === "Completed") return UR.teal; if (s === "Considering" || s === "Submitted") return UR.orange; return UR.gray; }

// ─── Dashboard component ──────────────────────────────────────────────────────
function AnalyticsDashboard(props) {
  var events        = props.events;
  var isUR          = props.isUR;
  var P             = props.P;
  var noteState     = props.noteState;
  var onSelectEvent = props.onSelectEvent;

  var goalSs      = useState({ budget:0, leads:0, mqls:0, deals:0, revenue:0 });
  var goals       = goalSs[0]; var setGoals = goalSs[1];
  var tableFilterS= useState("all");
  var tableFilter = tableFilterS[0]; var setTableFilter = tableFilterS[1];

  // ── Aggregates ─────────────────────────────────────────────────────────────
  var attended       = events.filter(function(c) { return c.attended === true; });
  var confirmed      = events.filter(function(c) { return c.status === "Attending"; });
  var considering    = events.filter(function(c) { return c.status === "Considering"; });
  var notAttending   = events.filter(function(c) { return c.status === "Not Attending"; });
  var totalBudget    = events.reduce(function(s,c)  { return s + totalCost(c); }, 0);
  var confirmedBudget= confirmed.reduce(function(s,c){ return s + totalCost(c); }, 0);
  var attendedSpend  = attended.reduce(function(s,c) { return s + totalCost(c); }, 0);
  var totalLeads     = attended.reduce(function(s,c) { return s + (c.leadsGenerated || 0); }, 0);
  var totalMQLs      = attended.reduce(function(s,c) { return s + (c.mqls || 0); }, 0);
  var totalDeals     = attended.reduce(function(s,c) { return s + (c.dealsWon || 0); }, 0);
  var totalRevenue   = attended.reduce(function(s,c) { return s + (c.revenue || 0); }, 0);
  var netProfit      = totalRevenue - attendedSpend;
  var overallROI     = attendedSpend > 0 ? ((netProfit / attendedSpend) * 100).toFixed(1) : null;
  var costPerLead    = totalLeads > 0    ? (attendedSpend / totalLeads).toFixed(0)  : null;
  var costPerMQL     = totalMQLs > 0     ? (attendedSpend / totalMQLs).toFixed(0)   : null;
  var leadToMQLRate  = totalLeads > 0    ? ((totalMQLs / totalLeads) * 100).toFixed(1)   : null;
  var mqlToDealRate  = totalMQLs > 0     ? ((totalDeals / totalMQLs) * 100).toFixed(1)   : null;
  var avgRevPerEvent = attended.length > 0 ? (totalRevenue / attended.length).toFixed(0) : null;

  // ── Status breakdown ────────────────────────────────────────────────────────
  var statusBreakdown = [
    { label:"Attending",    count:confirmed.length,   color:"#4ACDC4", budget:confirmedBudget },
    { label:"Considering",  count:considering.length, color:"#f79824", budget:considering.reduce(function(s,c){return s+totalCost(c);},0)  },
    { label:"Not Attending",count:notAttending.length, color:"#8ba7b3", budget:notAttending.reduce(function(s,c){return s+totalCost(c);},0) },
    { label:"Attended ✓",   count:attended.length,    color:"#35928b", budget:attendedSpend }
  ];

  // ── Tier breakdown ──────────────────────────────────────────────────────────
  var tierMap = {};
  events.forEach(function(c) {
    var s   = scoreConference(c);
    var lbl = scoreLabel(s).label.split(" – ")[0];
    if (!tierMap[lbl]) tierMap[lbl] = { count:0, budget:0, leads:0, revenue:0 };
    tierMap[lbl].count++;
    tierMap[lbl].budget += totalCost(c);
    if (c.attended) { tierMap[lbl].leads += (c.leadsGenerated || 0); tierMap[lbl].revenue += (c.revenue || 0); }
  });

  // ── Top ROI events ──────────────────────────────────────────────────────────
  var roiEvents = attended
    .filter(function(c) { return totalCost(c) > 0 && c.revenue != null; })
    .map(function(c) {
      var spend = totalCost(c), rev = c.revenue || 0;
      return Object.assign({}, c, { _roi: +((rev - spend) / spend * 100).toFixed(1), _spend: spend, _revenue: rev });
    })
    .sort(function(a, b) { return b._roi - a._roi; });

  // ── Per-event table ─────────────────────────────────────────────────────────
  var tableEvents = events
    .filter(function(c) {
      if (tableFilter === "attended")   return c.attended === true;
      if (tableFilter === "attending")  return c.status === "Attending";
      if (tableFilter === "considering")return c.status === "Considering";
      return true;
    })
    .map(function(c) {
      var spend = totalCost(c), rev = c.revenue || 0;
      var roi   = spend > 0 && c.attended === true ? ((rev - spend) / spend * 100).toFixed(1) : null;
      return Object.assign({}, c, { _spend: spend, _roi: roi });
    });

  // ── Goal progress bar ───────────────────────────────────────────────────────
  function GoalBar(p) {
    var pct = p.goal > 0 ? Math.min((p.actual / p.goal) * 100, 100) : 0;
    var clr = pct >= 100 ? "#35928b" : pct >= 60 ? "#4ACDC4" : pct >= 30 ? "#f79824" : "#f59dc3";
    return e("div", { style: { marginBottom: 12 } },
      e("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 4 } },
        e("span", { style: { fontSize: 12, fontWeight: 600, color: "#023F5A" } }, p.label),
        e("span", { style: { fontSize: 12, fontWeight: 700, color: clr } },
          p.actual.toLocaleString() + (p.goal > 0 ? " / " + p.goal.toLocaleString() + " (" + pct.toFixed(0) + "%)" : "")
        )
      ),
      p.goal > 0 && e("div", { style: { background: "#e6ecef", borderRadius: 99, height: 8, overflow: "hidden" } },
        e("div", { style: { height: "100%", width: pct + "%", background: "linear-gradient(90deg," + clr + "," + clr + "cc)", borderRadius: 99, transition: "width 0.6s ease" } })
      )
    );
  }

  // ── Shared card styles ──────────────────────────────────────────────────────
  var cardStyle    = { background: "#ffffff", borderRadius: 14, border: "1.5px solid #e6ecef", padding: "18px 22px", boxShadow: "0 2px 12px rgba(2,63,90,0.06)" };
  var headStyle    = { fontFamily: "'Onest',sans-serif", fontWeight: 700, fontSize: 13, color: "#023F5A", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14, display: "block" };
  var bigNumStyle  = function(clr) { return { fontSize: 28, fontWeight: 800, color: clr || "#023F5A", fontFamily: "'Onest',sans-serif", lineHeight: 1 }; };
  var subLblStyle  = { fontSize: 11, color: "#8ba7b3", fontWeight: 600, marginTop: 3, display: "block" };

  // ── UR-only simple status view ─────────────────────────────────────────────
  if (isUR) {
    var urStatuses = [
      { label: "Attending",     count: confirmed.length,    color: UR.teal   },
      { label: "Considering",   count: considering.length,  color: UR.orange },
      { label: "Not Attending", count: notAttending.length, color: UR.gray   },
      { label: "Attended ✓",    count: attended.length,     color: "#35928b" }
    ];
    return e("div", { style: { fontFamily: "'IBM Plex Sans',system-ui,sans-serif", color: "#011a26" } },
      e("div", { style: { marginBottom: 24 } },
        e("h2", { style: { fontFamily: "'Onest',sans-serif", fontSize: 26, fontWeight: 800, color: UR.primaryDark, margin: 0 } }, "Event Status Overview"),
        e("p",  { style: { fontSize: 13, color: "#8ba7b3", marginTop: 4, margin: 0 } }, "Status breakdown across all User-Rev events")
      ),
      // ── KPI cards ──────────────────────────────────────────────────────────
      e("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 24 } },
        [
          { val: events.length,    label: "Total Tracked",       icon: "📋", color: UR.primaryDark },
          { val: confirmed.length, label: "Confirmed Attending", icon: "✅", color: "#35928b"      },
          { val: attended.length,  label: "Attended",            icon: "🎯", color: "#35928b"      }
        ].map(function(k) {
          return e("div", { key: k.label, style: { background: "#fff", borderRadius: 14, border: "1.5px solid #e6ecef", padding: "16px 18px", boxShadow: "0 2px 12px rgba(174,111,138,0.06)" } },
            e("div", { style: { fontSize: 18, marginBottom: 6 } }, k.icon),
            e("div", { style: { fontSize: 28, fontWeight: 800, color: k.color, fontFamily: "'Onest',sans-serif", lineHeight: 1 } }, k.val),
            e("span", { style: { fontSize: 11, color: "#8ba7b3", fontWeight: 600, marginTop: 3, display: "block" } }, k.label)
          );
        })
      ),
      // ── Status breakdown ───────────────────────────────────────────────────
      e("div", { style: { background: "#fff", borderRadius: 14, border: "1.5px solid #e6ecef", padding: "18px 22px", boxShadow: "0 2px 12px rgba(174,111,138,0.06)", marginBottom: 14 } },
        e("span", { style: { fontFamily: "'Onest',sans-serif", fontWeight: 700, fontSize: 13, color: UR.primaryDark, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14, display: "block" } }, "📊 Status Breakdown"),
        e("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
          urStatuses.map(function(s) {
            var pct = events.length > 0 ? ((s.count / events.length) * 100).toFixed(0) : 0;
            return e("div", { key: s.label },
              e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 } },
                e("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                  e("div", { style: { width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 } }),
                  e("span", { style: { fontSize: 13, fontWeight: 600, color: UR.primaryDark } }, s.label)
                ),
                e("div", { style: { display: "flex", gap: 14, alignItems: "center" } },
                  e("span", { style: { fontSize: 12, color: "#8ba7b3" } }, s.count + " event" + (s.count !== 1 ? "s" : "")),
                  e("span", { style: { fontSize: 12, fontWeight: 700, color: s.color } }, pct + "%")
                )
              ),
              e("div", { style: { background: "#f0e8ed", borderRadius: 99, height: 7, overflow: "hidden" } },
                e("div", { style: { height: "100%", width: pct + "%", background: s.color, borderRadius: 99, transition: "width 0.5s ease" } })
              )
            );
          })
        )
      ),
      // ── Strategy notes ─────────────────────────────────────────────────────
      e("div", { style: { background: "#fff", borderRadius: 14, border: "1.5px solid #e6ecef", padding: "18px 22px", boxShadow: "0 2px 12px rgba(174,111,138,0.06)" } },
        e("span", { style: { fontFamily: "'Onest',sans-serif", fontWeight: 700, fontSize: 13, color: UR.primaryDark, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14, display: "block" } }, "📝 Strategy Notes & Takeaways"),
        e("textarea", {
          value: noteState.note,
          onChange: function(ev) { noteState.saveNote(ev.target.value); },
          rows: 4,
          placeholder: "Add key takeaways, lessons learned, recommendations…",
          style: { width: "100%", border: "1.5px solid #e6ecef", borderRadius: 10, padding: "12px 14px", fontSize: 13, fontFamily: "inherit", color: "#011a26", background: "#fafcfd", resize: "vertical", boxSizing: "border-box", outline: "none", lineHeight: 1.6 }
        })
      )
    );
  }

  return e("div", { style: { fontFamily: "'IBM Plex Sans',system-ui,sans-serif", color: "#011a26" } },

    // ── Page header ────────────────────────────────────────────────────────
    e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 } },
      e("div", null,
        e("h2", { style: { fontFamily: "'Onest',sans-serif", fontSize: 26, fontWeight: 800, color: "#023F5A", margin: 0 } }, "Event Analytics & ROI"),
        e("p",  { style: { fontSize: 13, color: "#8ba7b3", marginTop: 4, margin: 0 } }, "Live metrics across all tracked events")
      )
    ),

    // ── KPI row ────────────────────────────────────────────────────────────
    e("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 20 } },
      [
        { val: events.length,    label: "Total Tracked",         color: "#023F5A", icon: "📋" },
        { val: confirmed.length, label: "Confirmed Attending",   color: "#35928b", icon: "✅" },
        { val: attended.length,  label: "Confirmed Attended",    color: "#35928b", icon: "🎯" },
        { val: "$" + totalBudget.toLocaleString(),    label: "Total Tracked Budget",  color: "#023F5A", icon: "💰" },
        { val: "$" + attendedSpend.toLocaleString(),  label: "Actual Attended Spend", color: "#023F5A", icon: "💸" },
        { val: overallROI !== null ? (overallROI >= 0 ? "+" : "") + overallROI + "%" : "—", label: "Overall ROI", color: overallROI !== null ? (+overallROI >= 0 ? "#35928b" : "#ae6f8a") : "#8ba7b3", icon: "📈" }
      ].map(function(k) {
        return e("div", { key: k.label, style: Object.assign({}, cardStyle, { padding: "16px 18px" }) },
          e("div", { style: { fontSize: 18, marginBottom: 6 } }, k.icon),
          e("div", { style: bigNumStyle(k.color) }, k.val),
          e("span", { style: subLblStyle }, k.label)
        );
      })
    ),

    // ── Pipeline + Cost Efficiency ─────────────────────────────────────────
    e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 } },
      e("div", { style: cardStyle },
        e("span", { style: headStyle }, "📈 Pipeline Performance"),
        e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
          [
            { val: totalLeads, label: "SQLs Generated", color: "#4ACDC4" },
            { val: totalMQLs,  label: "MQLs",            color: "#023F5A" },
            { val: totalDeals, label: "Deals Won",       color: "#35928b" },
            { val: "$" + totalRevenue.toLocaleString(), label: "Revenue Attributed", color: totalRevenue > 0 ? "#35928b" : "#8ba7b3" }
          ].map(function(k) {
            return e("div", { key: k.label, style: { background: "#f5f9fc", borderRadius: 10, padding: "12px 14px" } },
              e("div", { style: { fontSize: 22, fontWeight: 800, color: k.color, fontFamily: "'Onest',sans-serif" } }, k.val),
              e("div", { style: { fontSize: 11, color: "#8ba7b3", fontWeight: 600, marginTop: 2 } }, k.label)
            );
          })
        )
      ),
      e("div", { style: cardStyle },
        e("span", { style: headStyle }, "🧠 Cost Efficiency"),
        e("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
          [
            { label: "Cost per SQL",       val: costPerLead    ? "$" + parseInt(costPerLead).toLocaleString()  : "—", sub: "Attended spend ÷ SQLs generated" },
            { label: "Cost per MQL",       val: costPerMQL     ? "$" + parseInt(costPerMQL).toLocaleString()   : "—", sub: "Attended spend ÷ MQLs" },
            { label: "MQL → SQL Rate",     val: leadToMQLRate  ? leadToMQLRate + "%"                           : "—", sub: "Of MQLs that converted to SQLs" },
            { label: "MQL → Closed Won",   val: mqlToDealRate  ? mqlToDealRate + "%"                           : "—", sub: "Of MQLs that closed as won deals" },
            { label: "Avg Revenue / Event",val: avgRevPerEvent ? "$" + parseInt(avgRevPerEvent).toLocaleString(): "—", sub: "Across attended events with revenue" }
          ].map(function(row) {
            return e("div", { key: row.label, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f5f9fc", borderRadius: 8 } },
              e("div", null,
                e("div", { style: { fontSize: 13, fontWeight: 600, color: "#023F5A" } }, row.label),
                e("div", { style: { fontSize: 11, color: "#b0c4cc", marginTop: 1 } }, row.sub)
              ),
              e("div", { style: { fontSize: 18, fontWeight: 800, color: "#023F5A", fontFamily: "'Onest',sans-serif" } }, row.val)
            );
          })
        )
      )
    ),

    // ── Status breakdown + P&L ─────────────────────────────────────────────
    e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 } },
      e("div", { style: cardStyle },
        e("span", { style: headStyle }, "📊 Status Breakdown"),
        e("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
          statusBreakdown.map(function(s) {
            var pct = events.length > 0 ? ((s.count / events.length) * 100).toFixed(0) : 0;
            return e("div", { key: s.label },
              e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } },
                e("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                  e("div", { style: { width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 } }),
                  e("span", { style: { fontSize: 13, fontWeight: 600, color: "#023F5A" } }, s.label)
                ),
                e("div", { style: { display: "flex", gap: 14, alignItems: "center" } },
                  e("span", { style: { fontSize: 12, color: "#8ba7b3" } }, s.count + " events"),
                  e("span", { style: { fontSize: 12, fontWeight: 700, color: "#023F5A" } }, "$" + s.budget.toLocaleString())
                )
              ),
              e("div", { style: { background: "#e6ecef", borderRadius: 99, height: 6, overflow: "hidden" } },
                e("div", { style: { height: "100%", width: pct + "%", background: s.color, borderRadius: 99 } })
              )
            );
          })
        )
      ),
      e("div", { style: cardStyle },
        e("span", { style: headStyle }, "💰 P&L Summary (Attended Events)"),
        attended.length === 0
          ? e("div", { style: { textAlign: "center", padding: "24px 0", color: "#b0c4cc" } },
              e("div", { style: { fontSize: 28, marginBottom: 8 } }, "📊"),
              e("p", { style: { fontSize: 13, margin: 0 } }, "Mark events as 'Attended' and enter revenue to see P&L")
            )
          : e("div", { style: { display: "flex", flexDirection: "column", gap: 0 } },
              [
                { label: "Total Revenue",       val: "$" + totalRevenue.toLocaleString(),      color: totalRevenue > 0 ? "#35928b" : "#8ba7b3", border: false },
                { label: "− Total Spend",       val: "−$" + attendedSpend.toLocaleString(),    color: "#ae6f8a", border: false },
                { label: "= Net Profit / Loss", val: (netProfit >= 0 ? "+$" : "−$") + Math.abs(netProfit).toLocaleString(), color: netProfit >= 0 ? "#35928b" : "#ae6f8a", border: true, big: true },
                { label: "ROI",                 val: overallROI !== null ? (overallROI >= 0 ? "+" : "") + overallROI + "%" : "—", color: overallROI !== null && +overallROI >= 0 ? "#35928b" : "#ae6f8a", border: false, big: true }
              ].map(function(row) {
                return e("div", { key: row.label, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderTop: row.border ? "2px solid #e6ecef" : "none", marginTop: row.border ? 6 : 0, background: row.border ? "#f5f9fc" : "transparent", borderRadius: row.border ? 8 : 0 } },
                  e("span", { style: { fontSize: row.big ? 15 : 13, fontWeight: row.big ? 700 : 500, color: "#8ba7b3" } }, row.label),
                  e("span", { style: { fontSize: row.big ? 22 : 15, fontWeight: 800, color: row.color, fontFamily: "'Onest',sans-serif" } }, row.val)
                );
              })
            )
      )
    ),

    // ── Top ROI events + Tier Analysis ─────────────────────────────────────
    e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 } },
      e("div", { style: cardStyle },
        e("span", { style: headStyle }, "🏆 Top Performing Events (by ROI)"),
        roiEvents.length === 0
          ? e("div", { style: { textAlign: "center", padding: "20px 0", color: "#b0c4cc", fontSize: 13 } }, "No attended events with revenue data yet.")
          : e("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
              roiEvents.slice(0, 6).map(function(c, i) {
                var roi = +c._roi;
                var clr = roi >= 100 ? "#35928b" : roi >= 0 ? "#4ACDC4" : roi > -50 ? "#f79824" : "#ae6f8a";
                // Parse closed-won contacts
                var contacts = [];
                try { var p = typeof c.contacts === "string" ? JSON.parse(c.contacts) : (c.contacts || []); contacts = Array.isArray(p) ? p.filter(function(x) { return x.closedWon; }) : []; } catch(_) {}
                function calcRev(n) { n = parseInt(n,10)||0; if(n<=0) return 0; return n*(n>=20000?5:n>=10000?10:20); }
                return e("div", { key: c.id, style: { borderRadius: 10, background: "#f5f9fc", marginBottom: 4, overflow: "hidden" } },
                  // Main row
                  e("div", { onClick: function() { onSelectEvent(c); }, style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", cursor: "pointer" } },
                    e("span", { style: { fontSize: 13, fontWeight: 700, color: "#8ba7b3", width: 18, textAlign: "right", flexShrink: 0 } }, i + 1),
                    e("div", { style: { flex: 1, minWidth: 0 } },
                      e("div", { style: { fontSize: 13, fontWeight: 600, color: "#023F5A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, c.name),
                      e("div", { style: { fontSize: 11, color: "#b0c4cc" } }, "$" + c._spend.toLocaleString() + " spent · $" + c._revenue.toLocaleString() + " revenue" + (contacts.length > 0 ? " · " + contacts.length + " closed" : ""))
                    ),
                    e("span", { style: { fontSize: 14, fontWeight: 800, color: clr, whiteSpace: "nowrap", fontFamily: "'Onest',sans-serif" } }, (roi >= 0 ? "+" : "") + roi + "%")
                  ),
                  // LEA contact rows
                  contacts.length > 0 && e("div", { style: { borderTop: "1px solid #e6ecef", padding: "6px 12px 8px 40px" } },
                    contacts.map(function(ct, ci) {
                      var ctRev = calcRev(ct.studentCount);
                      return e("div", { key: ci, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: ci < contacts.length - 1 ? "1px dashed #eef2f4" : "none" } },
                        e("div", { style: { minWidth: 0, flex: 1 } },
                          e("div", { style: { fontSize: 12, fontWeight: 600, color: "#35928b" } }, ct.district || ct.name || "Unknown District"),
                          e("div", { style: { fontSize: 10, color: "#b0c4cc" } },
                            (ct.name ? ct.name + (ct.title ? " · " + ct.title : "") : "") +
                            (ct.studentCount ? (ct.name ? " · " : "") + parseInt(ct.studentCount).toLocaleString() + " students" : "")
                          )
                        ),
                        ctRev > 0 && e("span", { style: { fontSize: 12, fontWeight: 700, color: "#35928b", flexShrink: 0, marginLeft: 8 } }, "$" + ctRev.toLocaleString())
                      );
                    })
                  )
                );
              })
            )
      ),
      e("div", { style: cardStyle },
        e("span", { style: headStyle }, "🎯 Tier Analysis"),
        e("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
          ["Tier 1","Tier 2","Tier 3","Tier 4","Tier 5"].filter(function(t) { return tierMap[t]; }).map(function(t) {
            var d   = tierMap[t];
            var clr = t === "Tier 1" ? "#023F5A" : t === "Tier 2" ? "#35657b" : t === "Tier 3" ? "#4ACDC4" : t === "Tier 4" ? "#f79824" : "#8ba7b3";
            var lbl = { "Tier 1":"Best Fit","Tier 2":"Strong Fit","Tier 3":"Good Fit","Tier 4":"Moderate","Tier 5":"Low Priority" }[t] || t;
            return e("div", { key: t, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 8, background: "#f5f9fc", borderLeft: "3px solid " + clr } },
              e("div", null,
                e("div", { style: { fontSize: 13, fontWeight: 700, color: clr } }, t + " – " + lbl),
                e("div", { style: { fontSize: 11, color: "#b0c4cc", marginTop: 2 } }, d.count + " event" + (d.count !== 1 ? "s" : "") + " · $" + d.budget.toLocaleString() + " budget")
              ),
              d.revenue > 0 && e("div", { style: { textAlign: "right" } },
                e("div", { style: { fontSize: 13, fontWeight: 700, color: "#35928b" } }, "+$" + d.revenue.toLocaleString()),
                e("div", { style: { fontSize: 11, color: "#b0c4cc" } }, "revenue")
              )
            );
          })
        )
      )
    ),

    // ── Goals tracker ──────────────────────────────────────────────────────
    e("div", { style: Object.assign({}, cardStyle, { marginBottom: 14 }) },
      e("span", { style: headStyle }, "🎯 Goals vs. Actuals"),
      e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 } },
        e("div", null,
          e("div", { style: { fontSize: 12, fontWeight: 700, color: "#8ba7b3", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 } }, "Set Annual Goals"),
          [
            { key:"budget",  label:"Annual Event Budget ($)", placeholder:"e.g. 100000" },
            { key:"leads",   label:"SQLs Target",             placeholder:"e.g. 200"    },
            { key:"mqls",    label:"MQLs Target",             placeholder:"e.g. 50"     },
            { key:"deals",   label:"Deals Target",            placeholder:"e.g. 10"     },
            { key:"revenue", label:"Revenue Target ($)",      placeholder:"e.g. 500000" }
          ].map(function(f) {
            return e("div", { key: f.key, style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 } },
              e("label", { style: { fontSize: 12, fontWeight: 600, color: "#023F5A", width: 160, flexShrink: 0 } }, f.label),
              e("input", { type: "number", min: 0, placeholder: f.placeholder, value: goals[f.key] || "", onChange: function(ev) { setGoals(function(g) { return Object.assign({}, g, { [f.key]: +ev.target.value || 0 }); }); }, style: Object.assign({}, inp, { flex: 1, padding: "7px 10px", fontSize: 13 }) })
            );
          })
        ),
        e("div", null,
          e("div", { style: { fontSize: 12, fontWeight: 700, color: "#8ba7b3", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 } }, "Progress Tracking"),
          e(GoalBar, { label:"Budget Used",        actual:attendedSpend, goal:goals.budget  }),
          e(GoalBar, { label:"SQLs Generated",     actual:totalLeads,    goal:goals.leads   }),
          e(GoalBar, { label:"MQLs",               actual:totalMQLs,     goal:goals.mqls    }),
          e(GoalBar, { label:"Deals Won",          actual:totalDeals,    goal:goals.deals   }),
          e(GoalBar, { label:"Revenue Attributed", actual:totalRevenue,  goal:goals.revenue })
        )
      )
    ),

    // ── Per-event table ────────────────────────────────────────────────────
    e("div", { style: cardStyle },
      e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 } },
        e("span", { style: headStyle }, "📋 Event-by-Event Breakdown"),
        e("div", { style: { display: "flex", gap: 4, background: "#f0f4f6", borderRadius: 8, padding: 3 } },
          [["all","All"],["attending","Attending"],["attended","Attended ✓"],["considering","Considering"]].map(function(pair) {
            return e("button", { key: pair[0], onClick: function() { setTableFilter(pair[0]); }, style: { padding: "5px 12px", borderRadius: 6, border: "none", background: tableFilter === pair[0] ? "#023F5A" : "transparent", color: tableFilter === pair[0] ? "#fff" : "#8ba7b3", fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: "inherit" } }, pair[1]);
          })
        )
      ),
      e("div", { style: { overflowX: "auto" } },
        e("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 } },
          e("thead", null,
            e("tr", { style: { borderBottom: "2px solid #e6ecef" } },
              ["Event","Status","Type","Dates","Cost","Spons.","Total","SQLs","MQLs","Deals","Revenue","ROI"].map(function(h) {
                return e("th", { key: h, style: { padding: "8px 10px", textAlign: h === "Event" ? "left" : "right", fontWeight: 700, fontSize: 11, color: "#8ba7b3", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" } }, h);
              })
            )
          ),
          e("tbody", null,
            tableEvents.map(function(c, i) {
              var roi    = c._roi;
              var roiClr = roi === null ? "#b0c4cc" : +roi >= 0 ? "#35928b" : "#ae6f8a";
              return e("tr", { key: c.id, onClick: function() { onSelectEvent(c); }, style: { borderBottom: "1px solid #f0f4f6", cursor: "pointer", background: i % 2 === 0 ? "#fff" : "#fafcfd" } },
                e("td", { style: { padding: "9px 10px", maxWidth: 220 } },
                  e("div", { style: { fontWeight: 600, color: "#023F5A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, c.name),
                  c.audience && c.audience.length > 0 && e("div", { style: { fontSize: 10, color: "#b0c4cc", marginTop: 1 } }, c.audience.slice(0,2).join(", "))
                ),
                e("td", { style: { padding: "9px 10px", textAlign: "right" } },
                  e("span", { style: { background: statusColor(c.status), color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" } }, c.status || "—")
                ),
                e("td", { style: { padding: "9px 10px", textAlign: "right", color: "#8ba7b3", whiteSpace: "nowrap" } }, c.type === "at-large" ? "At-Large" : c.region || "—"),
                e("td", { style: { padding: "9px 10px", textAlign: "right", color: "#8ba7b3", whiteSpace: "nowrap" } }, c.dates || "—"),
                e("td", { style: { padding: "9px 10px", textAlign: "right", color: "#023F5A", fontWeight: 500 } }, c.cost > 0 ? "$" + c.cost.toLocaleString() : "—"),
                e("td", { style: { padding: "9px 10px", textAlign: "right", color: "#023F5A", fontWeight: 500 } }, c.sponsorshipCost > 0 ? "$" + c.sponsorshipCost.toLocaleString() : "—"),
                e("td", { style: { padding: "9px 10px", textAlign: "right", fontWeight: 700, color: "#023F5A" } }, c._spend > 0 ? "$" + c._spend.toLocaleString() : "—"),
                e("td", { style: { padding: "9px 10px", textAlign: "right", color: "#4ACDC4", fontWeight: 700 } }, c.leadsGenerated > 0 ? c.leadsGenerated : "—"),
                e("td", { style: { padding: "9px 10px", textAlign: "right", color: "#023F5A", fontWeight: 700 } }, c.mqls > 0 ? c.mqls : "—"),
                e("td", { style: { padding: "9px 10px", textAlign: "right", color: "#35928b", fontWeight: 700 } }, c.dealsWon > 0 ? c.dealsWon : "—"),
                e("td", { style: { padding: "9px 10px", textAlign: "right", color: "#35928b", fontWeight: 700 } }, c.revenue > 0 ? "$" + c.revenue.toLocaleString() : "—"),
                e("td", { style: { padding: "9px 10px", textAlign: "right", fontWeight: 800, color: roiClr, fontFamily: "'Onest',sans-serif" } }, roi !== null ? (roi >= 0 ? "+" : "") + roi + "%" : "—")
              );
            })
          )
        )
      ),
      tableEvents.length === 0 && e("div", { style: { textAlign: "center", padding: "32px 0", color: "#b0c4cc", fontSize: 13 } }, "No events match this filter.")
    ),

    // ── Strategy notes ─────────────────────────────────────────────────────
    e("div", { style: Object.assign({}, cardStyle, { marginTop: 14 }) },
      e("span", { style: headStyle }, "📝 Strategy Notes & Takeaways"),
      e("textarea", {
        value: noteState.note,
        onChange: function(ev) { noteState.saveNote(ev.target.value); },
        rows: 4,
        placeholder: "Add key takeaways, lessons learned, recommendations for next quarter…",
        style: {
          width: "100%", border: "1.5px solid #e6ecef", borderRadius: 10,
          padding: "12px 14px", fontSize: 13, fontFamily: "inherit",
          color: "#011a26", background: "#fafcfd",
          resize: "vertical", boxSizing: "border-box", outline: "none", lineHeight: 1.6
        }
      })
    )
  );
}
