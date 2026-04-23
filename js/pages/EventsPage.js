// ═══════════════════════════════════════════════════════════════════════════
// pages/EventsPage.js — Event Strategy page (BizDev + UserRev modes).
//
// Props: user, onLogout, onHub
// Depends on: hooks/useConferences.js, hooks/useAnalyticsNote.js,
//             components/ConferenceModal.js, pages/AnalyticsDashboard.js,
//             components/SharedUI.js, constants.js
// ═══════════════════════════════════════════════════════════════════════════

// ── Default category sets ────────────────────────────────────────────────────
var DEFAULT_BD_CATS = [
  { id: "at-large",   label: "At-Large",  match: function(c) { return c.type === "at-large"; } },
  { id: "socal",      label: "SoCal",     match: function(c) { return c.type === "regional" && c.region === "SoCal";      } },
  { id: "norcal",     label: "NorCal",    match: function(c) { return c.type === "regional" && c.region === "NorCal";     } },
  { id: "centralcal", label: "CenCal",    match: function(c) { return c.type === "regional" && c.region === "CentralCal"; } },
  { id: "webinars",   label: "Webinars",  match: function(c) { return c.type === "webinar"; } },
];
var DEFAULT_UR_CATS = [
  { id: "case-study",   label: "Case Study Video Shoots", match: function(c) { return c.urType === "case-study";   } },
  { id: "cust-webinar", label: "Customer Webinars",       match: function(c) { return c.urType === "cust-webinar"; } },
  { id: "community",    label: "Community Engagement",    match: function(c) { return c.urType === "community";    } },
];

// Persist custom categories in localStorage so edits survive refresh
function loadCats(key, defaults) {
  try {
    var raw = localStorage.getItem(key);
    if (raw) {
      var parsed = JSON.parse(raw);
      return parsed.map(function(cat) {
        var def = defaults.find(function(d) { return d.id === cat.id; });
        return Object.assign({}, cat, { match: def ? def.match : function() { return false; } });
      });
    }
  } catch (_) {}
  return defaults;
}
function saveCats(key, cats) {
  try { localStorage.setItem(key, JSON.stringify(cats.map(function(c) { return { id: c.id, label: c.label }; }))); }
  catch (_) {}
}

// ── Category Editor Modal ────────────────────────────────────────────────────
function CategoryEditorModal(props) {
  var cats    = props.cats;
  var onSave  = props.onSave;
  var onClose = props.onClose;
  var isUR    = props.isUR;

  var ls = useState(cats.map(function(c) { return { id: c.id, label: c.label }; }));
  var local = ls[0]; var setLocal = ls[1];
  var ns = useState(""); var newLabel = ns[0]; var setNewLabel = ns[1];

  function updateLabel(id, val) {
    setLocal(function(prev) { return prev.map(function(c) { return c.id === id ? Object.assign({}, c, { label: val }) : c; }); });
  }
  function remove(id) {
    setLocal(function(prev) { return prev.filter(function(c) { return c.id !== id; }); });
  }
  function add() {
    var lbl = newLabel.trim();
    if (!lbl) return;
    var id = lbl.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setLocal(function(prev) { return prev.concat([{ id: id, label: lbl }]); });
    setNewLabel("");
  }
  function handleSave() { onSave(local); onClose(); }

  var lbl = { display: "block", fontWeight: 600, fontSize: 12, color: isUR ? UR.primaryDark : C.oceanDark, marginBottom: 4 };

  return e("div", {
    onClick: function(ev) { if (ev.target === ev.currentTarget) onClose(); },
    style: { position: "fixed", inset: 0, background: "rgba(1,26,38,0.65)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }
  },
    e("div", { style: { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 460, boxShadow: "0 24px 80px rgba(2,63,90,0.25)", overflow: "hidden" } },
      e("div", { style: { background: isUR ? "linear-gradient(135deg," + UR.primary + " 0%," + UR.primaryDark + " 100%)" : "linear-gradient(135deg,#023F5A 0%,#4ACDC4 100%)", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" } },
        e("div", { style: { color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "'Onest',sans-serif" } }, "✏️ Edit Categories"),
        e("button", { onClick: onClose, style: { background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" } }, "×")
      ),
      e("div", { style: { padding: 24 } },
        e("div", { style: { fontSize: 12, color: "#8ba7b3", marginBottom: 16, lineHeight: 1.5 } },
          "Rename or remove categories. New categories appear as filter chips — assign events to them via the Category field inside each event."
        ),
        local.map(function(cat) {
          return e("div", { key: cat.id, style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 } },
            e("input", {
              value: cat.label,
              onChange: function(ev) { updateLabel(cat.id, ev.target.value); },
              style: Object.assign({}, inp, { flex: 1, fontSize: 13 })
            }),
            e("button", {
              onClick: function() { remove(cat.id); },
              style: { background: "#fef5f9", border: "1.5px solid #f3c6d8", borderRadius: 8, padding: "6px 10px", color: "#ae6f8a", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }
            }, "✕")
          );
        }),
        e("div", { style: { display: "flex", gap: 8, marginTop: 12 } },
          e("input", {
            value: newLabel,
            onChange: function(ev) { setNewLabel(ev.target.value); },
            onKeyDown: function(ev) { if (ev.key === "Enter") add(); },
            placeholder: "New category name…",
            style: Object.assign({}, inp, { flex: 1, fontSize: 13 })
          }),
          e("button", {
            onClick: add,
            style: { background: isUR ? UR.accent : C.cyan, border: "none", borderRadius: 8, padding: "8px 14px", color: isUR ? "#fff" : C.oceanDark, fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }
          }, "+ Add")
        ),
        e("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 } },
          e("button", { onClick: onClose, style: { padding: "9px 18px", borderRadius: 8, border: "1.5px solid #dde6ea", background: "transparent", color: "#8ba7b3", fontWeight: 600, fontSize: 13, cursor: "pointer" } }, "Cancel"),
          e("button", { onClick: handleSave, style: { padding: "9px 20px", borderRadius: 8, border: "none", background: isUR ? UR.accent : C.cyan, color: isUR ? "#fff" : C.oceanDark, fontWeight: 700, fontSize: 13, cursor: "pointer" } }, "Save Changes")
        )
      )
    )
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
function EventsPage(props) {
  var conf = useConferences();

  var gs   = useState("bizdev"); var group        = gs[0];  var setGroup        = gs[1];
  var ts   = useState("all");    var tab          = ts[0];  var setTab          = ts[1];
  var ss   = useState("");       var search       = ss[0];  var setSearch       = ss[1];
  var sbs  = useState("date");   var sortBy       = sbs[0]; var setSortBy       = sbs[1];
  var fs   = useState("All");    var filterStatus = fs[0];  var setFilterStatus = fs[1];
  var selS = useState(null);     var selected     = selS[0];var setSelected     = selS[1];
  var cfs  = useState("all");    var catFilter    = cfs[0]; var setCatFilter    = cfs[1];
  var ems  = useState(false);    var editingCats  = ems[0]; var setEditingCats  = ems[1];

  var bdS  = useState(function() { return loadCats("tad_bd_cats", DEFAULT_BD_CATS); });
  var bdCats = bdS[0]; var setBdCats = bdS[1];
  var urS  = useState(function() { return loadCats("tad_ur_cats", DEFAULT_UR_CATS); });
  var urCats = urS[0]; var setUrCats = urS[1];

  var noteState = useAnalyticsNote(group);

  var isUR         = group === "userrev";
  var P            = isUR ? UR : C;
  var activeTabClr = isUR ? UR.accent : C.cyan;

  var currentTabs = isUR
    ? [{ id: "all", label: "All Events" }, { id: "ur-analytics", label: "Event Analytics" }]
    : [{ id: "all", label: "All Events" }, { id: "analytics",    label: "Event Analytics & ROI" }];

  var isAnalyticsTab = tab === "analytics" || tab === "ur-analytics";
  var activeCats     = isUR ? urCats : bdCats;

  function handleSaveCats(updated) {
    var defaults = isUR ? DEFAULT_UR_CATS : DEFAULT_BD_CATS;
    var merged = updated.map(function(u) {
      var def = defaults.find(function(d) { return d.id === u.id; });
      return { id: u.id, label: u.label, match: def ? def.match : function() { return false; } };
    });
    if (isUR) { setUrCats(merged); saveCats("tad_ur_cats", merged); }
    else      { setBdCats(merged); saveCats("tad_bd_cats", merged); }
    setCatFilter("all");
  }

  var activeEvents = useMemo(function() {
    return conf.conferences.filter(function(c) {
      return isUR ? c.group === "userrev" : c.group !== "userrev";
    });
  }, [conf.conferences, isUR]);

  var visible = useMemo(function() {
    var list = activeEvents.slice();
    if (catFilter !== "all") {
      var cat = activeCats.find(function(c) { return c.id === catFilter; });
      if (cat && cat.match) list = list.filter(cat.match);
    }
    if (filterStatus !== "All") list = list.filter(function(c) { return c.status === filterStatus; });
    if (search) {
      var q = search.toLowerCase();
      list = list.filter(function(c) {
        return (c.name + c.location + (c.notes || "") + (c.teamMembers || "")).toLowerCase().includes(q);
      });
    }
    if (sortBy === "date")  list.sort(function(a, b) { return (a.dates || "zzz").localeCompare(b.dates || "zzz"); });
    if (sortBy === "score") list.sort(function(a, b) { return scoreConference(b) - scoreConference(a); });
    if (sortBy === "cost")  list.sort(function(a, b) { return totalCost(b) - totalCost(a); });
    return list;
  }, [activeEvents, catFilter, activeCats, search, sortBy, filterStatus, isUR]);

  function handleAdd() {
    var n = isUR
      ? { id: "new-" + Date.now(), name: "New Event", type: "userrev", group: "userrev", urType: "case-study", region: null, dates: "", location: "", cost: 0, sponsorshipCost: 0, status: "Considering", teamMembers: "", notes: "", leadsGenerated: 0, revenue: 0 }
      : { id: "new-" + Date.now(), name: "New Event", type: "at-large", group: "bizdev", region: null, dates: "", location: "", cost: 0, sponsorshipCost: 0, status: "Considering", bdPriority: "", teamMembers: "", involvement: "General Attendance", audience: [], notes: "", deadline: "", leadsGenerated: 0, dealsWon: 0, revenue: 0 };
    conf.saveConf(n);
    setSelected(n);
  }

  var confirmed  = activeEvents.filter(function(c) { return c.status === "Attending"; });
  var attended   = activeEvents.filter(function(c) { return c.attended === true; });
  var totalSpend = activeEvents.reduce(function(s, c) { return s + totalCost(c); }, 0);
  var attSpend   = attended.reduce(function(s, c) { return s + totalCost(c); }, 0);
  var attRevenue = attended.reduce(function(s, c) { return s + (c.revenue || 0); }, 0);

  if (conf.loading) return e("div", {
    style: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.ocean, color: "#fff", fontSize: 18 }
  }, "Loading Event Strategy…");

  return e("div", { style: { fontFamily: "'IBM Plex Sans',system-ui,sans-serif", background: isUR ? UR.overcast : "#e6f2f7", minHeight: "100vh" } },

    e(NavBar, {
      user: props.user, onLogout: props.onLogout,
      title: "Event Strategy", onHub: props.onHub,
      rightSlot: e("div", { style: { display: "flex", gap: 10 } },
        e("div", { style: { display: "flex", background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 3, gap: 2 } },
          [{ id: "bizdev", label: "Biz-Dev" }, { id: "userrev", label: "User-Rev" }].map(function(g) {
            var active = group === g.id;
            return e("button", {
              key: g.id,
              onClick: function() { setGroup(g.id); setTab("all"); setSearch(""); setFilterStatus("All"); setCatFilter("all"); },
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
            borderRadius: 8, padding: "7px 16px", color: isUR ? "#fff" : C.white,
            fontWeight: 700, fontSize: 13, cursor: "pointer"
          }
        }, "+ Add Event")
      )
    },
      e("div", { style: { display: "flex", gap: 2, maxWidth: 1400, margin: "0 auto", paddingTop: 4, overflowX: "auto" } },
        currentTabs.map(function(t) {
          return e("button", {
            key: t.id, onClick: function() { setTab(t.id); setCatFilter("all"); },
            style: {
              padding: "10px 16px", border: "none", background: "none",
              color: tab === t.id ? activeTabClr : "rgba(255,255,255,0.6)",
              fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: "pointer",
              borderBottom: tab === t.id ? "2.5px solid " + activeTabClr : "2.5px solid transparent",
              whiteSpace: "nowrap", fontFamily: "inherit"
            }
          }, t.label);
        })
      )
    ),

    e("div", { style: { maxWidth: 1400, margin: "0 auto", padding: "28px 24px" } },

      isAnalyticsTab
        ? e(AnalyticsDashboard, { events: activeEvents, isUR: isUR, P: P, noteState: noteState, onSelectEvent: setSelected })

        : e("div", null,

            // ── Category filter chip bar ─────────────────────────────────
            e("div", { style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 18, flexWrap: "wrap" } },

              e("button", {
                onClick: function() { setCatFilter("all"); },
                style: {
                  padding: "6px 16px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit",
                  border: "1.5px solid " + (catFilter === "all" ? (isUR ? UR.accent : C.cyan) : (isUR ? UR.grayLight : "#b8cfd8")),
                  background: catFilter === "all" ? (isUR ? UR.accentLight : C.cyanLight) : "transparent",
                  color: catFilter === "all" ? (isUR ? UR.primaryDark : C.oceanDark) : (isUR ? UR.gray : "#8ba7b3"),
                  fontWeight: catFilter === "all" ? 700 : 500, fontSize: 12
                }
              },
                "All  ",
                e("span", {
                  style: {
                    background: catFilter === "all" ? (isUR ? UR.accent : C.ocean) : (isUR ? "#e8d8f0" : "#c8dce6"),
                    color: catFilter === "all" ? "#fff" : (isUR ? UR.primaryDark : C.oceanDark),
                    borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700
                  }
                }, activeEvents.length)
              ),

              activeCats.map(function(cat) {
                var active = catFilter === cat.id;
                var count  = activeEvents.filter(cat.match).length;
                return e("button", {
                  key: cat.id,
                  onClick: function() { setCatFilter(active ? "all" : cat.id); },
                  style: {
                    padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit",
                    border: "1.5px solid " + (active ? (isUR ? UR.accent : C.cyan) : (isUR ? UR.grayLight : "#b8cfd8")),
                    background: active ? (isUR ? UR.accentLight : C.cyanLight) : "transparent",
                    color: active ? (isUR ? UR.primaryDark : C.oceanDark) : (isUR ? UR.gray : "#8ba7b3"),
                    fontWeight: active ? 700 : 500, fontSize: 12,
                    display: "inline-flex", alignItems: "center", gap: 6
                  }
                },
                  cat.label,
                  e("span", {
                    style: {
                      background: active ? (isUR ? UR.accent : C.ocean) : (isUR ? "#e8d8f0" : "#c8dce6"),
                      color: active ? "#fff" : (isUR ? UR.primaryDark : C.oceanDark),
                      borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700
                    }
                  }, count)
                );
              }),

              e("button", {
                onClick: function() { setEditingCats(true); },
                style: {
                  marginLeft: "auto", padding: "6px 13px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit",
                  border: "1.5px dashed " + (isUR ? UR.grayLight : "#b8cfd8"),
                  background: "transparent",
                  color: isUR ? UR.gray : "#8ba7b3",
                  fontWeight: 600, fontSize: 11,
                  display: "inline-flex", alignItems: "center", gap: 5
                }
              }, "✏️ Edit Categories")
            ),

            // ── Toolbar ──────────────────────────────────────────────────
            e("div", { style: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" } },
              e("input", {
                value: search, onChange: function(ev) { setSearch(ev.target.value); },
                placeholder: "🔍 Search…",
                style: Object.assign({}, inp, { width: 220, flex: "none", background: isUR ? "#fff" : C.ocean, color: isUR ? C.oceanDark : C.white, border: "1.5px solid " + (isUR ? UR.grayLight : "#35657b") })
              }),
              e("select", {
                value: filterStatus, onChange: function(ev) { setFilterStatus(ev.target.value); },
                style: Object.assign({}, inp, { width: 160, flex: "none", background: isUR ? "#fff" : C.ocean, color: isUR ? C.oceanDark : C.white, border: "1.5px solid " + (isUR ? UR.grayLight : "#35657b") })
              },
                e("option", { value: "All" }, "All Statuses"),
                ["Attending","Considering","Not Attending","Submitted","Completed"].map(function(s) { return e("option", { key: s }, s); })
              ),
              e("div", { style: { display: "flex", gap: 2, background: isUR ? UR.white : C.ocean, borderRadius: 8, border: "1.5px solid " + (isUR ? UR.grayLight : "#35657b"), padding: 3 } },
                [["date","Date"],["score","Score"],["cost","Cost"]].map(function(pair) {
                  return e("button", {
                    key: pair[0], onClick: function() { setSortBy(pair[0]); },
                    style: { padding: "5px 12px", borderRadius: 6, border: "none", background: sortBy === pair[0] ? (isUR ? UR.accent : C.cyan) : "transparent", color: sortBy === pair[0] ? (isUR ? "#fff" : C.oceanDark) : (isUR ? UR.gray : "#8ba7b3"), fontWeight: 600, fontSize: 12, cursor: "pointer" }
                  }, pair[1]);
                })
              )
            ),

            // ── Cards grid ───────────────────────────────────────────────
            e("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 14 } },
              visible.map(function(c) {
                var score   = scoreConference(c);
                var tier    = scoreLabel(score);
                var spend   = totalCost(c);
                var roiVal  = calcRoi(c);
                var urLabel = { "case-study":"Case Study","cust-webinar":"Cust. Webinar","community":"Community" }[c.urType] || c.urType || "User-Rev";

                return e("div", {
                  key: c.id, onClick: function() { setSelected(c); },
                  style: { background: isUR ? P.white : C.ocean, borderRadius: 14, border: "1.5px solid " + (isUR ? P.grayLight : "#35657b"), padding: "18px 20px", cursor: "pointer", boxShadow: isUR ? "0 2px 8px rgba(174,111,138,0.08)" : "0 2px 8px rgba(0,0,0,0.2)" }
                },
                  e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 } },
                    e("div", { style: { fontWeight: 700, fontSize: 15, color: isUR ? UR.primaryDark : C.white, lineHeight: 1.35, flex: 1 } }, c.name),
                    e("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 } },
                      e("span", { style: { background: isUR ? urStatusColor(c.status) : statusColor(c.status), color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 } }, c.status || "TBD"),
                      isUR
                        ? e("span", { style: { background: "#4ACDC4", color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 } }, urLabel)
                        : c.type === "at-large"
                          ? e("span", { style: { background: C.ocean, color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 } }, "At-Large")
                          : e("span", { style: { background: C.cyan, color: C.oceanDark, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 } }, c.region || "Regional")
                    )
                  ),
                  e("div", { style: { fontSize: 12, color: isUR ? UR.gray : "#8ba7b3", marginBottom: 10 } }, "📅 " + (c.dates || "TBD") + "  ·  📍 " + (c.location || "TBD")),
                  e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 } },
                    e("span", { style: { background: tier.color + "18", color: tier.color, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700 } }, tier.label),
                    e("div", { style: { fontSize: 12, color: "#8ba7b3", textAlign: "right" } },
                      spend > 0 ? "$" + spend.toLocaleString() + (c.attended === true ? " invested" : " cost") : "Cost TBD",
                      roiVal !== null && e("span", { style: { marginLeft: 6, fontWeight: 700, color: +roiVal >= 0 ? C.cyan : C.pink } }, " ROI: " + roiVal + "%")
                    )
                  ),
                  e("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
                    (c.audience || []).map(function(a) {
                      return e("span", { key: a, style: { background: isUR ? UR.accentLight : "rgba(74,205,196,0.18)", color: isUR ? UR.primary : C.cyan, borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 600 } }, a);
                    })
                  )
                );
              })
            ),

            visible.length === 0 && e("div", { style: { textAlign: "center", padding: "60px 0", color: isUR ? UR.gray : "#8ba7b3" } },
              e("div", { style: { fontSize: 40, marginBottom: 12 } }, "📫"),
              e("div", { style: { fontSize: 16, fontWeight: 600 } }, "No events match your filters")
            )
          )
    ),

    selected && e(ConferenceModal, {
      conf:     selected,
      onClose:  function() { setSelected(null); },
      onSave:   function(updated) { conf.saveConf(updated); setSelected(updated); },
      onDelete: function(id) { conf.removeConf(id); setSelected(null); }
    }),

    editingCats && e(CategoryEditorModal, {
      cats:    activeCats,
      isUR:    isUR,
      onSave:  handleSaveCats,
      onClose: function() { setEditingCats(false); }
    })
  );
}
