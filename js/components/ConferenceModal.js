// ═══════════════════════════════════════════════════════════════════════════
// components/ConferenceModal.js — Event detail / edit modal.
//
// Used by EventsPage for both BizDev and User-Rev groups.
// Adapts colors based on conf.group ("bizdev" vs "userrev").
// Depends on: constants.js (C, UR), components/SharedUI.js (inp)
// ═══════════════════════════════════════════════════════════════════════════

function ConferenceModal(props) {
  var conf = props.conf, onClose = props.onClose, onSave = props.onSave, onDelete = props.onDelete;
  var isUR = conf.group === "userrev";
  var P    = isUR ? UR : C;

  var fs = useState(Object.assign({}, conf, { _tab: "Overview" }));
  var f  = fs[0]; var setF = fs[1];

  function set(k, v) { setF(function(p) { return Object.assign({}, p, { [k]: v }); }); }

  function toggleAud(a) {
    var cur = f.audience || [];
    set("audience", cur.includes(a) ? cur.filter(function(x) { return x !== a; }) : cur.concat([a]));
  }

  return e("div", {
    onClick: function(ev) { if (ev.target === ev.currentTarget) onClose(); },
    style: {
      position: "fixed", inset: 0,
      background: isUR ? "rgba(59,26,96,0.72)" : "rgba(1,26,38,0.7)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }
  },
    e("div", {
      style: {
        background: P.white, borderRadius: 16,
        width: "100%", maxWidth: 820, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(2,63,90,0.3)"
      }
    },
      // ── Header ───────────────────────────────────────────────────────────
      e("div", {
        style: {
          background: isUR
            ? "linear-gradient(135deg," + UR.primary + " 0%," + UR.primaryDark + " 100%)"
            : "linear-gradient(135deg,#023F5A 0%,#4ACDC4 100%)",
          padding: "20px 28px", borderRadius: "16px 16px 0 0",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }
      },
        e("span", { style: { color: "#fff", fontWeight: 700, fontSize: 18, fontFamily: "'Onest',sans-serif" } },
          f.name || "Event Details"
        ),
        e("div", { style: { display: "flex", gap: 10, alignItems: "center" } },
          onDelete && e("button", {
            onClick: function() { if (confirm("Delete this event?")) { onDelete(f.id); onClose(); } },
            style: {
              background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)",
              borderRadius: 8, padding: "5px 12px",
              fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer"
            }
          }, "🗑 Delete"),
          e("button", {
            onClick: onClose,
            style: { background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }
          }, "×")
        )
      ),

      // ── Body ─────────────────────────────────────────────────────────────
      e("div", { style: { padding: 28 } },

        // ── Tab switcher ──────────────────────────────────────────────────
        e("div", {
          style: { display: "flex", gap: 2, background: P.overcast, borderRadius: 10, padding: 4, marginBottom: 20 }
        }, ["Overview", "Logistics"].map(function(t) {
          return e("button", {
            key: t,
            onClick: function() { set("_tab", t); },
            style: {
              flex: 1, padding: "8px 6px", borderRadius: 8, border: "none",
              background: f._tab === t ? (P.primary || P.ocean) : "transparent",
              color: f._tab === t ? "#fff" : P.gray,
              fontWeight: 700, fontSize: 12, cursor: "pointer"
            }
          }, t);
        })),

        // ── Shared fields (both tabs) ─────────────────────────────────────
        e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 } },
          e("div", { style: { gridColumn: "1/-1" } },
            e("label", { style: { display: "block", fontWeight: 600, fontSize: 13, color: isUR ? UR.primaryDark : C.oceanDark, marginBottom: 6 } }, "Event Name"),
            e("input", { style: inp, value: f.name || "", onChange: function(ev) { set("name", ev.target.value); } })
          ),
          e("div", null,
            e("label", { style: { display: "block", fontWeight: 600, fontSize: 13, color: isUR ? UR.primaryDark : C.oceanDark, marginBottom: 6 } }, "Status"),
            e("select", { style: inp, value: f.status || "", onChange: function(ev) { set("status", ev.target.value); } },
              ["Attending","Considering","Not Attending","Submitted","Completed"].map(function(o) { return e("option", { key: o }, o); })
            )
          ),
          e("div", null,
            e("label", { style: { display: "block", fontWeight: 600, fontSize: 13, color: isUR ? UR.primaryDark : C.oceanDark, marginBottom: 6 } }, "Dates"),
            e("input", { style: inp, value: f.dates || "", onChange: function(ev) { set("dates", ev.target.value); } })
          ),
          e("div", null,
            e("label", { style: { display: "block", fontWeight: 600, fontSize: 13, color: isUR ? UR.primaryDark : C.oceanDark, marginBottom: 6 } }, "Location"),
            e("input", { style: inp, value: f.location || "", onChange: function(ev) { set("location", ev.target.value); } })
          ),
          e("div", null,
            e("label", { style: { display: "block", fontWeight: 600, fontSize: 13, color: isUR ? UR.primaryDark : C.oceanDark, marginBottom: 6 } }, "Attendance Cost ($)"),
            e("input", { style: inp, type: "number", value: f.cost || 0, onChange: function(ev) { set("cost", +ev.target.value); } })
          ),
          e("div", null,
            e("label", { style: { display: "block", fontWeight: 600, fontSize: 13, color: isUR ? UR.primaryDark : C.oceanDark, marginBottom: 6 } }, "Sponsorship Cost ($)"),
            e("input", { style: inp, type: "number", value: f.sponsorshipCost || 0, onChange: function(ev) { set("sponsorshipCost", +ev.target.value); } })
          )
        ),

        // ── Attended toggle ───────────────────────────────────────────────
        e("div", { style: { marginBottom: 16 } },
          e("label", { style: { display: "block", fontWeight: 600, fontSize: 13, color: isUR ? UR.primaryDark : C.oceanDark, marginBottom: 6 } }, "Did We Attend?"),
          e("div", { style: { display: "flex", gap: 8 } },
            [
              { val: true,      label: "✓ Yes",     bg: "#edfaf9",  active: "#35928b" },
              { val: false,     label: "✗ No",      bg: "#fef5f9",  active: "#ae6f8a" },
              { val: undefined, label: "? Unknown", bg: P.overcast, active: P.gray   }
            ].map(function(opt) {
              var isActive = f.attended === opt.val;
              return e("button", {
                key: String(opt.val),
                onClick: function() { set("attended", opt.val); },
                style: {
                  flex: 1, padding: "10px 6px", borderRadius: 8,
                  border: "2px solid " + (isActive ? opt.active : P.grayLight),
                  background: isActive ? opt.bg : "transparent",
                  color: isActive ? opt.active : P.gray,
                  fontWeight: 700, fontSize: 12, cursor: "pointer"
                }
              }, opt.label);
            })
          )
        ),

        // ── Overview tab ──────────────────────────────────────────────────
        f._tab === "Overview" && e("div", null,
          e("div", { style: { marginBottom: 16 } },
            e("label", { style: { display: "block", fontWeight: 600, fontSize: 13, color: isUR ? UR.primaryDark : C.oceanDark, marginBottom: 6 } }, "Team Members"),
            e("input", { style: inp, value: f.teamMembers || "", onChange: function(ev) { set("teamMembers", ev.target.value); }, placeholder: "e.g. Jen, Matt, Victoria" })
          ),
          e("div", { style: { marginBottom: 16 } },
            e("label", { style: { display: "block", fontWeight: 600, fontSize: 13, color: isUR ? UR.primaryDark : C.oceanDark, marginBottom: 6 } }, "Target Audience"),
            e("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 } },
              ["Teachers","Principals","Counselors","School Board Members","Superintendents"].map(function(a) {
                var sel = (f.audience || []).includes(a);
                return e("button", {
                  key: a, onClick: function() { toggleAud(a); },
                  style: {
                    padding: "5px 12px", borderRadius: 20,
                    border: "1.5px solid " + (sel ? P.accent || P.cyan : P.grayLight),
                    background: sel ? P.accentLight || P.cyanLight : "transparent",
                    color: sel ? P.primary || P.ocean : P.gray,
                    fontWeight: 600, fontSize: 12, cursor: "pointer"
                  }
                }, a);
              })
            )
          ),
          e("div", { style: { marginBottom: 16 } },
            e("label", { style: { display: "block", fontWeight: 600, fontSize: 13, color: isUR ? UR.primaryDark : C.oceanDark, marginBottom: 6 } }, "Notes"),
            e("textarea", {
              style: Object.assign({}, inp, { minHeight: 80, resize: "vertical" }),
              value: f.notes || "", onChange: function(ev) { set("notes", ev.target.value); }
            })
          )
        ),

        // ── Logistics tab ─────────────────────────────────────────────────
        f._tab === "Logistics" && e("div", null,
          !isUR && e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 } },
            [["Leads Generated","leadsGenerated"],["MQLs","mqls"],["Revenue ($)","revenue"]].map(function(pair) {
              return e("div", { key: pair[1] },
                e("label", { style: { display: "block", fontWeight: 600, fontSize: 13, color: C.oceanDark, marginBottom: 6 } }, pair[0]),
                e("input", { style: inp, type: "number", value: f[pair[1]] || 0, onChange: function(ev) { set(pair[1], +ev.target.value); } })
              );
            })
          ),
          e("div", null,
            e("label", { style: { display: "block", fontWeight: 600, fontSize: 13, color: isUR ? UR.primaryDark : C.oceanDark, marginBottom: 6 } }, "Post-Event Debrief"),
            e("textarea", {
              style: Object.assign({}, inp, { minHeight: 80, resize: "vertical" }),
              value: f.debrief || "", onChange: function(ev) { set("debrief", ev.target.value); },
              placeholder: "What worked, follow-up actions…"
            })
          )
        ),

        // ── Footer buttons ────────────────────────────────────────────────
        e("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 } },
          e("button", {
            onClick: onClose,
            style: {
              padding: "10px 20px", borderRadius: 8,
              border: "1.5px solid " + P.grayLight, background: "transparent",
              cursor: "pointer", fontWeight: 600, color: P.gray
            }
          }, "Cancel"),
          e("button", {
            onClick: function() { onSave(Object.assign({}, f)); onClose(); },
            style: {
              padding: "10px 24px", borderRadius: 8, border: "none",
              background: isUR ? UR.accent : C.cyan,
              color: isUR ? "#fff" : C.oceanDark,
              fontWeight: 700, cursor: "pointer"
            }
          }, "Save Event")
        )
      )
    )
  );
}
