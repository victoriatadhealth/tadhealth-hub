// ═══════════════════════════════════════════════════════════════════════════
// pages/EventsPage.js — Event Strategy page (BizDev + UserRev modes).
//
// Props: user, onLogout, onHub
// Depends on: hooks/useConferences.js, hooks/useAnalyticsNote.js,
//             components/ConferenceModal.js, pages/AnalyticsDashboard.js,
//             components/SharedUI.js, constants.js
// ═══════════════════════════════════════════════════════════════════════════

function EventsPage(props) {
  var conf = useConferences();

  var gs  = useState("bizdev");  var group        = gs[0];  var setGroup        = gs[1];
  var ts  = useState("all");     var tab          = ts[0];  var setTab          = ts[1];
  var ss  = useState("");        var search       = ss[0];  var setSearch       = ss[1];
  var sbs = useState("date");    var sortBy       = sbs[0]; var setSortBy       = sbs[1];
  var fs  = useState("All");     var filterStatus = fs[0];  var setFilterStatus = fs[1];
  var selS= useState(null);      var selected     = selS[0];var setSelected     = selS[1];

  var noteState = useAnalyticsNote(group);

  var isUR         = group === "userrev";
  var P            = isUR ? UR : C;
  var activeTabClr = isUR ? UR.accent : C.cyan;

  var currentTabs = isUR
    ? [
        { id: "case-study",  label: "Case Study Video Shoots" },
        { id: "cust-webinar",label: "Customer Webinars"       },
        { id: "community",   label: "Community Engagement"    },
        { id: "ur-analytics",label: "Event Analytics"         }
      ]
    : [
        { id: "all",        label: "All Events"          },
        { id: "at-large",   label: "At-Large"            },
        { id: "socal",      label: "SoCal"               },
        { id: "norcal",     label: "NorCal"              },
        { id: "centralcal", label: "CenCal"              },
        { id: "webinars",   label: "Webinars"            },
        { id: "analytics",  label: "Event Analytics & ROI" }
      ];

  var isAnalyticsTab = tab === "analytics" || tab === "ur-analytics";

  var activeEvents = useMemo(function() {
    return conf.conferences.filter(function(c) {
      return isUR ? c.group === "userrev" : c.group !== "userrev";
    });
  }, [conf.conferences, isUR]);

  var visible = useMemo(function() {
    var list = activeEvents.slice();

    // Tab filtering
    if (isUR) {
      if (tab === "case-study")  list = list.filter(function(c) { return c.urType === "case-study";  });
      else if (tab === "cust-webinar") list = list.filter(function(c) { return c.urType === "cust-webinar"; });
      else if (tab === "community")    list = list.filter(function(c) { return c.urType === "community";    });
    } else {
      if      (tab === "at-large")   list = list.filter(function(c) { return c.type === "at-large"; });
      else if (tab === "socal")      list = list.filter(function(c) { return c.type === "regional" && c.region === "SoCal";      });
      else if (tab === "norcal")     list = list.filter(function(c) { return c.type === "regional" && c.region === "NorCal";     });
      else if (tab === "centralcal") list = list.filter(function(c) { return c.type === "regional" && c.region === "CentralCal"; });
      else if (tab === "webinars")   list = list.filter(function(c) { return c.type === "webinar";  });
    }

    // Status filter
    if (filterStatus !== "All") list = list.filter(function(c) { return c.status === filterStatus; });

    // Search
    if (search) {
      var q = search.toLowerCase();
      list = list.filter(function(c) {
        return (c.name + c.location + (c.notes || "") + (c.teamMembers || "")).toLowerCase().includes(q);
      });
    }

    // Sort
    if (sortBy === "date")  list.sort(function(a, b) { return (a.dates || "zzz").localeCompare(b.dates || "zzz"); });
    if (sortBy === "score") list.sort(function(a, b) { return scoreConference(b) - scoreConference(a); });
    if (sortBy === "cost")  list.sort(function(a, b) { return totalCost(b) - totalCost(a); });

    return list;
  }, [activeEvents, tab, search, sortBy, filterStatus, isUR]);

  function handleAdd() {
    var n = isUR
      ? { id: "new-" + Date.now(), name: "New Event", type: "userrev", group: "userrev", urType: "case-study", region: null, dates: "", location: "", cost: 0, sponsorshipCost: 0, status: "Considering", teamMembers: "", notes: "", leadsGenerated: 0, revenue: 0 }
      : { id: "new-" + Date.now(), name: "New Event", type: "at-large", group: "bizdev", region: null, dates: "", location: "", cost: 0, sponsorshipCost: 0, status: "Considering", bdPriority: "", teamMembers: "", involvement: "General Attendance", audience: [], notes: "", deadline: "", leadsGenerated: 0, dealsWon: 0, revenue: 0 };
    conf.saveConf(n);
    setSelected(n);
  }

  // ── Summary KPIs (header strip) ──────────────────────────────────────────
  var confirmed  = activeEvents.filter(function(c) { return c.status === "Attending"; });
  var attended   = activeEvents.filter(function(c) { return c.attended === true; });
  var totalSpend = activeEvents.reduce(function(s, c) { return s + totalCost(c); }, 0);
  var attSpend   = attended.reduce(function(s, c) { return s + totalCost(c); }, 0);
  var attRevenue = attended.reduce(function(s, c) { return s + (c.revenue || 0); }, 0);
  var roi        = attSpend > 0 ? ((attRevenue - attSpend) / attSpend * 100).toFixed(0) : null;

  if (conf.loading) return e("div", {
    style: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.ocean, color: "#fff", fontSize: 18 }
  }, "Loading Event Strategy…");

  return e("div", { style: { fontFamily: "'IBM Plex Sans',system-ui,sans-serif", background: isUR ? UR.overcast : "#e6f2f7", minHeight: "100vh" } },

    // ── NavBar ──────────────────────────────────────────────────────────────
    e(NavBar, {
      user: props.user, onLogout: props.onLogout,
      title: "Event Strategy", onHub: props.onHub,
      rightSlot: e("div", { style: { display: "flex", gap: 10 } },
        // BizDev / UserRev toggle
        e("div", { style: { display: "flex", background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 3, gap: 2 } },
          [{ id: "bizdev", label: "Biz-Dev" }, { id: "userrev", label: "User-Rev" }].map(function(g) {
            var active = group === g.id;
            return e("button", {
              key: g.id,
              onClick: function() {
                setGroup(g.id);
                setTab(g.id === "bizdev" ? "all" : "case-study");
                setSearch("");
                setFilterStatus("All");
              },
              style: {
                padding: "5px 14px", borderRadius: 8, border: "none",
                background: active ? "#fff" : "transparent",
                color: active ? (g.id === "userrev" ? UR.primaryDark : C.ocean) : "rgba(255,255,255,0.75)",
                fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit"
              }
            }, g.label);
          })
        ),
        e("button", {
          onClick: handleAdd,
          style: {
            background: isUR ? UR.accent : "rgba(255,255,255,0.12)",
            border: "1.5px solid " + (isUR ? UR.accent : "rgba(255,255,255,0.25)"),
            borderRadius: 8, padding: "7px 16px",
            color: isUR ? "#fff" : C.white,
            fontWeight: 700, fontSize: 13, cursor: "pointer"
          }
        }, "+ Add Event")
      )
    },
      // ── Tab row ───────────────────────────────────────────────────────────
      e("div", { style: { display: "flex", gap: 2, maxWidth: 1400, margin: "0 auto", paddingTop: 4, overflowX: "auto" } },
        currentTabs.map(function(t) {
          return e("button", {
            key: t.id, onClick: function() { setTab(t.id); },
            style: {
              padding: "10px 16px", border: "none", background: "none",
              color: tab === t.id ? activeTabClr : "rgba(255,255,255,0.6)",
              fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: "pointer",
              borderBottom: tab === t.id ? "2.5px solid " + activeTabClr : "2.5px solid transparent",
              whiteSpace: "nowrap"
            }
          }, t.label);
        })
      )
    ),

    // ── Main content ────────────────────────────────────────────────────────
    e("div", { style: { maxWidth: 1400, margin: "0 auto", padding: "28px 24px" } },

      isAnalyticsTab

        // ── Analytics dashboard ──────────────────────────────────────────
        ? e(AnalyticsDashboard, {
            events: activeEvents, isUR: isUR, P: P,
            noteState: noteState,
            onSelectEvent: setSelected
          })

        // ── Events grid ──────────────────────────────────────────────────
        : e("div", null,
            // Toolbar
            e("div", { style: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" } },
              e("input", {
                value: search,
                onChange: function(ev) { setSearch(ev.target.value); },
                placeholder: "🔍 Search…",
                style: Object.assign({}, inp, {
                  width: 220, flex: "none",
                  background: isUR ? "#fff" : C.ocean,
                  color: isUR ? C.oceanDark : C.white,
                  border: "1.5px solid " + (isUR ? UR.grayLight : "#35657b")
                })
              }),
              e("select", {
                value: filterStatus,
                onChange: function(ev) { setFilterStatus(ev.target.value); },
                style: Object.assign({}, inp, {
                  width: 160, flex: "none",
                  background: isUR ? "#fff" : C.ocean,
                  color: isUR ? C.oceanDark : C.white,
                  border: "1.5px solid " + (isUR ? UR.grayLight : "#35657b")
                })
              },
                e("option", { value: "All" }, "All Statuses"),
                ["Attending","Considering","Not Attending","Submitted","Completed"].map(function(s) {
                  return e("option", { key: s }, s);
                })
              ),
              e("div", {
                style: {
                  display: "flex", gap: 2,
                  background: isUR ? UR.white : C.ocean,
                  borderRadius: 8,
                  border: "1.5px solid " + (isUR ? UR.grayLight : "#35657b"),
                  padding: 3
                }
              },
                [["date","Date"],["score","Score"],["cost","Cost"]].map(function(pair) {
                  return e("button", {
                    key: pair[0], onClick: function() { setSortBy(pair[0]); },
                    style: {
                      padding: "5px 12px", borderRadius: 6, border: "none",
                      background: sortBy === pair[0] ? (isUR ? UR.accent : C.cyan) : "transparent",
                      color: sortBy === pair[0] ? (isUR ? "#fff" : C.oceanDark) : (isUR ? UR.gray : "#8ba7b3"),
                      fontWeight: 600, fontSize: 12, cursor: "pointer"
                    }
                  }, pair[1]);
                })
              )
            ),

            // Cards grid
            e("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 14 } },
              visible.map(function(c) {
                var score     = scoreConference(c);
                var tier      = scoreLabel(score);
                var spend     = totalCost(c);
                var roiVal    = calcRoi(c);
                var urTypeLabel = { "case-study":"Case Study","cust-webinar":"Cust. Webinar","community":"Community" }[c.urType] || c.urType || "User-Rev";

                return e("div", {
                  key: c.id, onClick: function() { setSelected(c); },
                  style: {
                    background: isUR ? P.white : C.ocean,
                    borderRadius: 14,
                    border: "1.5px solid " + (isUR ? P.grayLight : "#35657b"),
                    padding: "18px 20px", cursor: "pointer",
                    boxShadow: isUR ? "0 2px 8px rgba(174,111,138,0.08)" : "0 2px 8px rgba(0,0,0,0.2)"
                  }
                },
                  // Name + badges
                  e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 } },
                    e("div", { style: { fontWeight: 700, fontSize: 15, color: isUR ? UR.primaryDark : C.white, lineHeight: 1.35, flex: 1 } }, c.name),
                    e("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 } },
                      e("span", {
                        style: {
                          background: isUR ? urStatusColor(c.status) : statusColor(c.status),
                          color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700
                        }
                      }, c.status || "TBD"),
                      isUR
                        ? e("span", { style: { background: "#4ACDC4", color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 } }, urTypeLabel)
                        : c.type === "at-large"
                          ? e("span", { style: { background: C.ocean, color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 } }, "At-Large")
                          : e("span", { style: { background: C.cyan, color: C.oceanDark, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 } }, c.region || "Regional")
                    )
                  ),

                  // Dates + location
                  e("div", { style: { fontSize: 12, color: isUR ? UR.gray : "#8ba7b3", marginBottom: 10 } },
                    "📅 " + (c.dates || "TBD") + "  ·  📍 " + (c.location || "TBD")
                  ),

                  // Tier + cost/ROI row
                  e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 } },
                    e("span", { style: { background: tier.color + "18", color: tier.color, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700 } }, tier.label),
                    e("div", { style: { fontSize: 12, color: "#8ba7b3", textAlign: "right" } },
                      spend > 0 ? "$" + spend.toLocaleString() + (c.attended === true ? " invested" : " cost") : "Cost TBD",
                      roiVal !== null && e("span", { style: { marginLeft: 6, fontWeight: 700, color: +roiVal >= 0 ? C.cyan : C.pink } }, " ROI: " + roiVal + "%")
                    )
                  ),

                  // Audience tags
                  e("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
                    (c.audience || []).map(function(a) {
                      return e("span", {
                        key: a,
                        style: {
                          background: isUR ? UR.accentLight : "rgba(74,205,196,0.18)",
                          color: isUR ? UR.primary : C.cyan,
                          borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 600
                        }
                      }, a);
                    })
                  )
                );
              })
            ),

            // Empty state
            visible.length === 0 && e("div", { style: { textAlign: "center", padding: "60px 0", color: isUR ? UR.gray : "#8ba7b3" } },
              e("div", { style: { fontSize: 40, marginBottom: 12 } }, "📫"),
              e("div", { style: { fontSize: 16, fontWeight: 600 } }, "No events match your filters")
            )
          )
    ),

    // ── Conference detail modal ─────────────────────────────────────────────
    selected && e(ConferenceModal, {
      conf:     selected,
      onClose:  function() { setSelected(null); },
      onSave:   conf.saveConf,
      onDelete: function(id) { conf.removeConf(id); setSelected(null); }
    })
  );
}
