// ═══════════════════════════════════════════════════════════════════════════
// pages/CalendarPage.js — Content calendar with month and list views.
//
// Props: user, onLogout, onHub
// Depends on: hooks/useContentItems.js, pages/ContentItemModal.js,
//             components/SharedUI.js, constants.js
// ═══════════════════════════════════════════════════════════════════════════

function CalendarPage(props) {
  var ci = useContentItems();

  var vs  = useState("calendar"); var view       = vs[0];  var setView       = vs[1];
  var cs  = useState(function()  { var d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  var current = cs[0]; var setCurrent = cs[1];
  var ms  = useState(null);       var modal      = ms[0];  var setModal      = ms[1];
  var fts = useState("all");      var filterType = fts[0]; var setFilterType = fts[1];
  var fas = useState("all");      var filterAud  = fas[0]; var setFilterAud  = fas[1];
  var fcs = useState("");         var filterCamp = fcs[0]; var setFilterCamp = fcs[1];

  var todayStr = new Date().toISOString().slice(0, 10);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function typeInfo(id) { return CONTENT_TYPES.find(function(t) { return t.id === id; }) || CONTENT_TYPES[0]; }

  function audienceColor(item) {
    var aid = (item.audience || [])[0];
    if (!aid) return typeInfo(item.type).color;
    var a = AUDIENCES.find(function(x) { return x.id === aid; });
    return a ? a.color : typeInfo(item.type).color;
  }

  function filtered(list) {
    return list.filter(function(i) {
      if (filterType !== "all" && i.type !== filterType) return false;
      if (filterAud  !== "all" && !(i.audience || []).includes(filterAud)) return false;
      if (filterCamp && !(i.campaign || "").toLowerCase().includes(filterCamp.toLowerCase())) return false;
      return true;
    });
  }

  function getCalDays() {
    var first = new Date(current.year, current.month, 1).getDay();
    var dim   = new Date(current.year, current.month + 1, 0).getDate();
    var days  = [];
    for (var i = 0; i < first; i++) days.push(null);
    for (var d = 1; d <= dim; d++) days.push(d);
    return days;
  }

  function itemsForDay(day) {
    if (!day) return [];
    var ds = current.year + "-" + String(current.month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
    return filtered(ci.items).filter(function(i) { return i.date === ds; });
  }

  var sorted = useMemo(function() {
    return filtered(ci.items).slice().sort(function(a, b) { return (a.date || "").localeCompare(b.date || ""); });
  }, [ci.items, filterType, filterAud, filterCamp]);

  // ── Nav helpers ────────────────────────────────────────────────────────────
  function prevMonth() {
    setCurrent(function(c) {
      var m = c.month - 1, y = c.year;
      if (m < 0) { m = 11; y--; }
      return { year: y, month: m };
    });
  }
  function nextMonth() {
    setCurrent(function(c) {
      var m = c.month + 1, y = c.year;
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  }

  if (ci.loading) return e("div", {
    style: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#023F5A", color: "#fff", fontSize: 18 }
  }, "Loading Calendar…");

  return e("div", { style: { fontFamily: "'IBM Plex Sans',system-ui,sans-serif", background: "#f0f4f6", minHeight: "100vh" } },

    // ── NavBar ─────────────────────────────────────────────────────────────
    e(NavBar, {
      user: props.user, onLogout: props.onLogout,
      title: "Content Calendar", onHub: props.onHub,
      rightSlot: e("button", {
        onClick: function() { setModal({}); },
        style: { background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 8, padding: "7px 16px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }
      }, "+ Add Content")
    },
      e("div", { style: { display: "flex", alignItems: "center", maxWidth: 1200, margin: "0 auto", paddingTop: 10, overflowX: "auto", gap: 0 } },
        e(NavTab, { active: view === "calendar", onClick: function() { setView("calendar"); } }, "📅 Calendar"),
        e(NavTab, { active: view === "list",     onClick: function() { setView("list");     } }, "☰ List"),
        e(NavSep),
        e(NavTab, { active: filterType === "all", onClick: function() { setFilterType("all"); } }, "All"),
        CONTENT_TYPES.map(function(t) { return e(NavTab, { key: t.id, active: filterType === t.id, onClick: function() { setFilterType(t.id); } }, t.label); }),
        e(NavSep),
        e("select", {
          value: filterAud, onChange: function(ev) { setFilterAud(ev.target.value); },
          style: { background: "transparent", border: "none", color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: 12, padding: "6px 4px 10px", cursor: "pointer", fontFamily: "inherit", outline: "none" }
        },
          e("option", { value: "all" }, "All Audiences"),
          AUDIENCES.map(function(a) { return e("option", { key: a.id, value: a.id }, a.label); })
        ),
        e("input", {
          value: filterCamp, onChange: function(ev) { setFilterCamp(ev.target.value); },
          placeholder: "Filter campaign…",
          style: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, color: "#fff", fontSize: 12, padding: "5px 10px", fontFamily: "inherit", outline: "none", width: 130, marginLeft: 8, marginBottom: 4 }
        })
      )
    ),

    // ── Content ────────────────────────────────────────────────────────────
    e("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "28px 24px" } },

      // ──────────────────── Calendar view ────────────────────────────────
      view === "calendar"
        ? e("div", null,
            // Month navigation
            e("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 } },
              e("button", { onClick: prevMonth, style: { background: "#fff", border: "1.5px solid #e6ecef", borderRadius: 8, padding: "6px 14px", fontSize: 14, cursor: "pointer", fontWeight: 600, color: "#023F5A" } }, "←"),
              e("div", { style: { fontFamily: "'Onest',sans-serif", fontWeight: 700, fontSize: 20, color: "#023F5A" } }, MONTHS[current.month] + " " + current.year),
              e("button", { onClick: nextMonth, style: { background: "#fff", border: "1.5px solid #e6ecef", borderRadius: 8, padding: "6px 14px", fontSize: 14, cursor: "pointer", fontWeight: 600, color: "#023F5A" } }, "→")
            ),
            // Legend
            e("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 } },
              CONTENT_TYPES.map(function(t) {
                return e("div", { key: t.id, style: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: t.color } },
                  e("div", { style: { width: 10, height: 10, borderRadius: 2, background: t.color } }),
                  t.label
                );
              })
            ),
            // Calendar grid
            e("div", { style: { background: "#fff", borderRadius: 16, border: "1.5px solid #e6ecef", overflow: "hidden", boxShadow: "0 2px 12px rgba(2,63,90,0.06)" } },
              // Day-of-week headers
              e("div", { style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1.5px solid #e6ecef" } },
                DAYS_SHORT.map(function(d) {
                  return e("div", { key: d, style: { padding: "10px 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#8ba7b3", textTransform: "uppercase", letterSpacing: "0.05em" } }, d);
                })
              ),
              // Day cells
              e("div", { style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)" } },
                getCalDays().map(function(day, idx) {
                  var dayItems = itemsForDay(day);
                  var isToday  = day && (current.year + "-" + String(current.month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0")) === todayStr;
                  return e("div", {
                    key: idx,
                    onClick: day ? function() { setModal({ date: current.year + "-" + String(current.month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0") }); } : undefined,
                    style: {
                      minHeight: 90,
                      borderRight: idx % 7 !== 6 ? "1px solid #f0f4f6" : "none",
                      borderBottom: "1px solid #f0f4f6",
                      padding: "6px 5px",
                      background: day ? "#fff" : "#fafcfd",
                      cursor: day ? "pointer" : "default"
                    }
                  },
                    day && e("div", { style: { display: "flex", flexDirection: "column", height: "100%" } },
                      e("span", {
                        style: {
                          fontSize: 12, fontWeight: isToday ? 800 : 500,
                          color: isToday ? "#fff" : "#023F5A",
                          background: isToday ? "#023F5A" : "transparent",
                          borderRadius: "50%", width: 22, height: 22,
                          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4
                        }
                      }, day),
                      dayItems.slice(0, 3).map(function(item) {
                        return e("div", {
                          key: item.id,
                          onClick: function(ev) { ev.stopPropagation(); setModal(item); },
                          style: {
                            fontSize: 10, fontWeight: 600, color: "#fff",
                            background: audienceColor(item), borderRadius: 4,
                            padding: "2px 5px", marginBottom: 2,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer"
                          }
                        }, item.title);
                      }),
                      dayItems.length > 3 && e("div", { style: { fontSize: 10, color: "#8ba7b3", paddingLeft: 2 } }, "+" + (dayItems.length - 3) + " more")
                    )
                  );
                })
              )
            )
          )

        // ──────────────────── List view ─────────────────────────────────
        : e("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
            sorted.length === 0
              ? e("div", { style: { textAlign: "center", padding: "60px 0", color: "#8ba7b3" } },
                  e("div", { style: { fontSize: 36, marginBottom: 12 } }, "📫"),
                  e("div", { style: { fontSize: 15, fontWeight: 600 } }, "No content items yet")
                )
              : sorted.map(function(item) {
                  var t  = typeInfo(item.type);
                  var sc = { Draft: "#8ba7b3", Scheduled: "#f79824", Published: "#35928b", Archived: "#b0c4cc" };
                  return e("div", {
                    key: item.id, onClick: function() { setModal(item); },
                    style: { background: "#fff", border: "1.5px solid #e6ecef", borderRadius: 12, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 6px rgba(2,63,90,0.05)" }
                  },
                    e("div", { style: { width: 4, borderRadius: 4, alignSelf: "stretch", background: t.color, flexShrink: 0 } }),
                    e("div", { style: { flex: 1, minWidth: 0 } },
                      e("div", { style: { fontWeight: 600, fontSize: 14, color: "#011a26", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, item.title),
                      e("div", { style: { fontSize: 12, color: "#8ba7b3", marginTop: 2, display: "flex", flexWrap: "wrap", gap: 6 } },
                        e("span", { style: { background: t.bg, color: t.color, borderRadius: 4, padding: "1px 7px", fontWeight: 600 } }, t.label),
                        item.channel  && e("span", { style: { background: "#f0f4f6", borderRadius: 4, padding: "1px 7px" } }, item.channel),
                        item.campaign && e("span", { style: { background: "#edfaf9", color: "#35928b", borderRadius: 4, padding: "1px 7px", fontWeight: 600 } }, item.campaign),
                        (item.audience || []).map(function(aid) {
                          var a = AUDIENCES.find(function(x) { return x.id === aid; });
                          return a ? e("span", { key: aid, style: { background: a.color + "22", color: a.color, borderRadius: 4, padding: "1px 7px", fontWeight: 600 } }, a.label) : null;
                        }),
                        e("span", null, item.date || "No date")
                      )
                    ),
                    e("span", { style: { fontSize: 11, fontWeight: 700, color: sc[item.status] || "#8ba7b3", background: "#f5f7f8", borderRadius: 20, padding: "3px 10px", whiteSpace: "nowrap" } }, item.status || "Draft")
                  );
                })
          )
    ),

    // ── Content item modal ─────────────────────────────────────────────────
    modal !== null && e(ContentItemModal, {
      item:     modal,
      onClose:  function() { setModal(null); },
      onSave:   ci.saveItem,
      onDelete: ci.removeItem
    })
  );
}
