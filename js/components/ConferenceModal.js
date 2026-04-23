// ═══════════════════════════════════════════════════════════════════════════
// components/ConferenceModal.js — Event detail / edit modal.
//
// Used by EventsPage for both BizDev and User-Rev groups.
// Adapts colors based on conf.group ("bizdev" vs "userrev").
// Tabs: Overview | Logistics | Travel & Stay
// Depends on: constants.js (C, UR), components/SharedUI.js (inp)
// ═══════════════════════════════════════════════════════════════════════════

// ── Revenue tier calculator ───────────────────────────────────────────────────
// $5/student  at 20,000+ students
// $10/student at 10,000–19,999 students
// $20/student at <10,000 students
function revenuePerStudent(studentCount) {
  var n = parseInt(studentCount, 10) || 0;
  if (n >= 20000) return 5;
  if (n >= 10000) return 10;
  return 20;
}
function calcContactRevenue(studentCount) {
  var n = parseInt(studentCount, 10) || 0;
  if (n <= 0) return 0;
  return n * revenuePerStudent(n);
}
function tierLabel(studentCount) {
  var n = parseInt(studentCount, 10) || 0;
  if (n >= 20000) return "$5/student (20K+)";
  if (n >= 10000) return "$10/student (10K–19.9K)";
  if (n > 0)      return "$20/student (<10K)";
  return "—";
}

// ── Travel helpers ────────────────────────────────────────────────────────────
function parseTravelEntries(raw) {
  try { var p = typeof raw === "string" ? JSON.parse(raw) : raw; return Array.isArray(p) ? p : []; }
  catch (_) { return []; }
}
function emptyTraveler() {
  return { name: "", flight: "", hotel: "", checkIn: "", checkOut: "", notes: "" };
}

// ── Contact helpers ───────────────────────────────────────────────────────────
function parseContacts(raw) {
  try { var p = typeof raw === "string" ? JSON.parse(raw) : raw; return Array.isArray(p) ? p : []; }
  catch (_) { return []; }
}
function emptyContact() {
  return { name: "", district: "", title: "", studentCount: "", closedWon: false };
}

// ── Main modal ────────────────────────────────────────────────────────────────
function ConferenceModal(props) {
  var conf = props.conf, onClose = props.onClose, onSave = props.onSave, onDelete = props.onDelete;
  var isUR = conf.group === "userrev";
  var P    = isUR ? UR : C;

  var fs = useState(Object.assign({}, conf, { _tab: "Overview" }));
  var f  = fs[0]; var setF = fs[1];

  var ts2 = useState(parseTravelEntries(conf.travelBookings));
  var travelers = ts2[0]; var setTravelers = ts2[1];

  var cs = useState(parseContacts(conf.contacts));
  var contacts = cs[0]; var setContacts = cs[1];

  function set(k, v) { setF(function(p) { return Object.assign({}, p, { [k]: v }); }); }

  function toggleAud(a) {
    var cur = f.audience || [];
    set("audience", cur.includes(a) ? cur.filter(function(x) { return x !== a; }) : cur.concat([a]));
  }

  // Travel
  function setTraveler(i, k, v) {
    setTravelers(function(prev) {
      return prev.map(function(t, idx) { return idx === i ? Object.assign({}, t, { [k]: v }) : t; });
    });
  }
  function addTraveler()     { setTravelers(function(p) { return p.concat([emptyTraveler()]); }); }
  function removeTraveler(i) { setTravelers(function(p) { return p.filter(function(_, idx) { return idx !== i; }); }); }

  // Contacts
  function setContact(i, k, v) {
    setContacts(function(prev) {
      return prev.map(function(c, idx) { return idx === i ? Object.assign({}, c, { [k]: v }) : c; });
    });
  }
  function addContact()     { setContacts(function(p) { return p.concat([emptyContact()]); }); }
  function removeContact(i) { setContacts(function(p) { return p.filter(function(_, idx) { return idx !== i; }); }); }

  // Auto-calculate total revenue from closed-won contacts
  var calcRevenue = contacts
    .filter(function(c) { return c.closedWon; })
    .reduce(function(sum, c) { return sum + calcContactRevenue(c.studentCount); }, 0);

  var closedWonCount = contacts.filter(function(c) { return c.closedWon; }).length;

  function handleSave() {
    onSave(Object.assign({}, f, {
      travelBookings: JSON.stringify(travelers),
      contacts:       JSON.stringify(contacts),
      revenue:        calcRevenue
    }));
    onClose();
  }

  // Category options
  var bizdevCats = [
    { label: "At-Large", type: "at-large", region: null         },
    { label: "SoCal",    type: "regional", region: "SoCal"      },
    { label: "NorCal",   type: "regional", region: "NorCal"     },
    { label: "CenCal",   type: "regional", region: "CentralCal" },
    { label: "Webinar",  type: "webinar",  region: null         },
  ];
  var urCats = [
    { label: "Case Study Video Shoot", urType: "case-study"   },
    { label: "Customer Webinar",       urType: "cust-webinar" },
    { label: "Community Engagement",   urType: "community"    },
  ];

  function currentCatLabel() {
    if (isUR) {
      var u = urCats.find(function(c) { return c.urType === f.urType; });
      return u ? u.label : "—";
    }
    var b = bizdevCats.find(function(c) { return c.type === f.type && c.region === (f.region || null); });
    return b ? b.label : "—";
  }

  var lbl = { display: "block", fontWeight: 600, fontSize: 13, color: isUR ? UR.primaryDark : C.oceanDark, marginBottom: 6 };
  var subLbl = { display: "block", fontWeight: 600, fontSize: 11, color: isUR ? UR.gray : "#8ba7b3", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" };

  return e("div", {
    onClick: function(ev) { if (ev.target === ev.currentTarget) onClose(); },
    style: { position: "fixed", inset: 0, background: isUR ? "rgba(59,26,96,0.72)" : "rgba(1,26,38,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }
  },
    e("div", {
      style: { background: P.white, borderRadius: 16, width: "100%", maxWidth: 860, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(2,63,90,0.3)" }
    },

      // ── Header ─────────────────────────────────────────────────────────
      e("div", {
        style: {
          background: isUR ? "linear-gradient(135deg," + UR.primary + " 0%," + UR.primaryDark + " 100%)" : "linear-gradient(135deg,#023F5A 0%,#4ACDC4 100%)",
          padding: "20px 28px", borderRadius: "16px 16px 0 0",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }
      },
        e("div", null,
          e("span", { style: { color: "#fff", fontWeight: 700, fontSize: 18, fontFamily: "'Onest',sans-serif" } }, f.name || "Event Details"),
          e("span", { style: { marginLeft: 12, background: "rgba(255,255,255,0.18)", borderRadius: 20, padding: "3px 11px", fontSize: 11, fontWeight: 700, color: "#fff" } }, currentCatLabel())
        ),
        e("div", { style: { display: "flex", gap: 10, alignItems: "center" } },
          onDelete && e("button", {
            onClick: function() { if (confirm("Delete this event?")) { onDelete(f.id); onClose(); } },
            style: { background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }
          }, "🗑 Delete"),
          e("button", { onClick: onClose, style: { background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" } }, "×")
        )
      ),

      // ── Body ───────────────────────────────────────────────────────────
      e("div", { style: { padding: 28 } },

        // Tab switcher
        e("div", { style: { display: "flex", gap: 2, background: P.overcast, borderRadius: 10, padding: 4, marginBottom: 20 } },
          ["Overview", "Logistics", "Travel & Stay"].map(function(t) {
            return e("button", {
              key: t, onClick: function() { set("_tab", t); },
              style: {
                flex: 1, padding: "8px 6px", borderRadius: 8, border: "none",
                background: f._tab === t ? (P.primary || P.ocean) : "transparent",
                color: f._tab === t ? "#fff" : P.gray,
                fontWeight: 700, fontSize: 12, cursor: "pointer"
              }
            }, t);
          })
        ),

        // ── Shared fields (shown on all tabs) ───────────────────────────
        e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 } },

          e("div", { style: { gridColumn: "1/-1" } },
            e("label", { style: lbl }, "Event Name"),
            e("input", { style: inp, value: f.name || "", onChange: function(ev) { set("name", ev.target.value); } })
          ),

          // Category / region pill selector
          e("div", { style: { gridColumn: "1/-1" } },
            e("label", { style: lbl }, isUR ? "Event Type" : "Category / Region"),
            e("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } },
              (isUR ? urCats : bizdevCats).map(function(cat) {
                var isActive = isUR
                  ? f.urType === cat.urType
                  : f.type === cat.type && (f.region || null) === cat.region;
                return e("button", {
                  key: cat.label,
                  onClick: function() {
                    if (isUR) { set("urType", cat.urType); }
                    else { setF(function(p) { return Object.assign({}, p, { type: cat.type, region: cat.region }); }); }
                  },
                  style: {
                    padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600,
                    border: "1.5px solid " + (isActive ? (isUR ? UR.accent : C.cyan) : P.grayLight),
                    background: isActive ? (isUR ? UR.accentLight : C.cyanLight) : "transparent",
                    color: isActive ? (isUR ? UR.primaryDark : C.oceanDark) : P.gray
                  }
                }, cat.label);
              })
            )
          ),

          e("div", null,
            e("label", { style: lbl }, "Status"),
            e("select", { style: inp, value: f.status || "", onChange: function(ev) { set("status", ev.target.value); } },
              ["Attending","Considering","Not Attending","Submitted","Completed"].map(function(o) { return e("option", { key: o }, o); })
            )
          ),
          e("div", null,
            e("label", { style: lbl }, "Dates"),
            e("input", { style: inp, value: f.dates || "", onChange: function(ev) { set("dates", ev.target.value); } })
          ),
          e("div", null,
            e("label", { style: lbl }, "Location"),
            e("input", { style: inp, value: f.location || "", onChange: function(ev) { set("location", ev.target.value); } })
          ),
          e("div", null,
            e("label", { style: lbl }, "Attendance Cost ($)"),
            e("input", { style: inp, type: "number", value: f.cost || 0, onChange: function(ev) { set("cost", +ev.target.value); } })
          ),
          e("div", null,
            e("label", { style: lbl }, "Sponsorship Cost ($)"),
            e("input", { style: inp, type: "number", value: f.sponsorshipCost || 0, onChange: function(ev) { set("sponsorshipCost", +ev.target.value); } })
          ),

          // Google Drive Resource / Guide link
          e("div", { style: { gridColumn: "1/-1" } },
            e("label", { style: lbl }, "📁 Event Resource / Guide"),
            e("input", {
              style: inp, type: "url",
              value: f.resourceLink || "",
              onChange: function(ev) { set("resourceLink", ev.target.value); },
              placeholder: "https://drive.google.com/…"
            })
          ),
          f.resourceLink && e("div", { style: { gridColumn: "1/-1", marginTop: -4 } },
            e("a", {
              href: f.resourceLink, target: "_blank", rel: "noopener noreferrer",
              style: { display: "inline-flex", alignItems: "center", gap: 6, color: isUR ? UR.accent : C.cyan, fontWeight: 600, fontSize: 12, textDecoration: "none" }
            }, "🔗 Open Event Resource Guide ↗")
          )
        ),

        // Attended toggle
        e("div", { style: { marginBottom: 16 } },
          e("label", { style: lbl }, "Did We Attend?"),
          e("div", { style: { display: "flex", gap: 8 } },
            [
              { val: true,      label: "✓ Yes",     bg: "#edfaf9",  active: "#35928b" },
              { val: false,     label: "✗ No",      bg: "#fef5f9",  active: "#ae6f8a" },
              { val: undefined, label: "? Unknown", bg: P.overcast, active: P.gray   }
            ].map(function(opt) {
              var isActive = f.attended === opt.val;
              return e("button", {
                key: String(opt.val), onClick: function() { set("attended", opt.val); },
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

        // ── Overview tab ────────────────────────────────────────────────
        f._tab === "Overview" && e("div", null,
          e("div", { style: { marginBottom: 16 } },
            e("label", { style: lbl }, "Team Members"),
            e("input", { style: inp, value: f.teamMembers || "", onChange: function(ev) { set("teamMembers", ev.target.value); }, placeholder: "e.g. Jen, Matt, Victoria" })
          ),
          e("div", { style: { marginBottom: 16 } },
            e("label", { style: lbl }, "Target Audience"),
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
            e("label", { style: lbl }, "Notes"),
            e("textarea", {
              style: Object.assign({}, inp, { minHeight: 80, resize: "vertical" }),
              value: f.notes || "", onChange: function(ev) { set("notes", ev.target.value); }
            })
          )
        ),

        // ── Logistics tab ───────────────────────────────────────────────
        f._tab === "Logistics" && e("div", null,

          // BizDev metrics row
          !isUR && e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 } },
            e("div", null,
              e("label", { style: lbl }, "SQLs"),
              e("input", { style: inp, type: "number", value: f.leadsGenerated || 0, onChange: function(ev) { set("leadsGenerated", +ev.target.value); } })
            ),
            e("div", null,
              e("label", { style: lbl }, "MQLs"),
              e("input", { style: inp, type: "number", value: f.mqls || 0, onChange: function(ev) { set("mqls", +ev.target.value); } })
            )
          ),

          // ── Closed Won + Revenue Calculator (BizDev only) ────────────
          !isUR && e("div", { style: { marginBottom: 20 } },

            // Section header
            e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } },
              e("div", { style: { fontWeight: 700, fontSize: 13, color: C.oceanDark } }, "🏆 Closed Won Accounts"),
              // Revenue summary pill
              e("div", { style: { display: "flex", gap: 10, alignItems: "center" } },
                e("span", { style: { fontSize: 12, color: "#8ba7b3" } }, closedWonCount + " closed"),
                e("span", {
                  style: {
                    background: calcRevenue > 0 ? C.cyanLight : "#f0f6f9",
                    color: calcRevenue > 0 ? C.oceanDark : "#8ba7b3",
                    border: "1.5px solid " + (calcRevenue > 0 ? C.cyan : "#dde6ea"),
                    borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 700
                  }
                }, "$" + calcRevenue.toLocaleString() + " projected")
              )
            ),

            // Pricing tier legend
            e("div", { style: { display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" } },
              [
                { label: "20K+ students", rate: "$5/student",  bg: "#edfaf9", color: "#35928b" },
                { label: "10K–19.9K",     rate: "$10/student", bg: "#fff8ed", color: "#c87a00" },
                { label: "<10K students", rate: "$20/student", bg: "#fef5f9", color: "#ae6f8a" },
              ].map(function(tier) {
                return e("div", {
                  key: tier.label,
                  style: { background: tier.bg, border: "1px solid " + tier.color + "40", borderRadius: 8, padding: "4px 10px", display: "flex", gap: 6, alignItems: "center" }
                },
                  e("span", { style: { fontSize: 11, fontWeight: 600, color: tier.color } }, tier.rate),
                  e("span", { style: { fontSize: 11, color: "#8ba7b3" } }, tier.label)
                );
              })
            ),

            // Empty state
            contacts.length === 0 && e("div", {
              style: { textAlign: "center", padding: "20px 0", color: "#8ba7b3", border: "1.5px dashed #dde6ea", borderRadius: 10, marginBottom: 12 }
            },
              e("div", { style: { fontSize: 28, marginBottom: 6 } }, "🏫"),
              e("div", { style: { fontSize: 13 } }, "No contacts yet. Add closed-won accounts below.")
            ),

            // Contact cards
            contacts.map(function(ct, i) {
              var rev = ct.closedWon ? calcContactRevenue(ct.studentCount) : 0;
              var rate = tierLabel(ct.studentCount);
              return e("div", {
                key: i,
                style: {
                  background: ct.closedWon ? "#edfaf9" : "#f8fbfc",
                  border: "1.5px solid " + (ct.closedWon ? "#a8ddd8" : "#dde6ea"),
                  borderRadius: 12, padding: "14px 16px", marginBottom: 10
                }
              },
                // Contact header row
                e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } },
                  e("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
                    // Closed Won toggle
                    e("button", {
                      onClick: function() { setContact(i, "closedWon", !ct.closedWon); },
                      style: {
                        padding: "4px 12px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 700,
                        border: "1.5px solid " + (ct.closedWon ? "#35928b" : "#dde6ea"),
                        background: ct.closedWon ? "#35928b" : "transparent",
                        color: ct.closedWon ? "#fff" : "#8ba7b3"
                      }
                    }, ct.closedWon ? "✓ Closed Won" : "○ Not Closed"),
                    rev > 0 && e("span", { style: { fontSize: 12, fontWeight: 700, color: "#35928b" } }, "$" + rev.toLocaleString())
                  ),
                  e("button", {
                    onClick: function() { removeContact(i); },
                    style: { background: "none", border: "none", color: "#8ba7b3", fontSize: 16, cursor: "pointer" }
                  }, "✕")
                ),

                // Contact fields
                e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } },
                  e("div", null,
                    e("label", { style: subLbl }, "Contact Name"),
                    e("input", { style: Object.assign({}, inp, { fontSize: 13 }), value: ct.name || "", onChange: function(ev) { setContact(i, "name", ev.target.value); }, placeholder: "e.g. Dr. Jane Smith" })
                  ),
                  e("div", null,
                    e("label", { style: subLbl }, "Title"),
                    e("input", { style: Object.assign({}, inp, { fontSize: 13 }), value: ct.title || "", onChange: function(ev) { setContact(i, "title", ev.target.value); }, placeholder: "e.g. Superintendent" })
                  ),
                  e("div", null,
                    e("label", { style: subLbl }, "District"),
                    e("input", { style: Object.assign({}, inp, { fontSize: 13 }), value: ct.district || "", onChange: function(ev) { setContact(i, "district", ev.target.value); }, placeholder: "e.g. LAUSD" })
                  ),
                  e("div", null,
                    e("label", { style: subLbl }, "Student Count"),
                    e("div", { style: { position: "relative" } },
                      e("input", {
                        style: Object.assign({}, inp, { fontSize: 13 }),
                        type: "number", value: ct.studentCount || "",
                        onChange: function(ev) { setContact(i, "studentCount", ev.target.value); },
                        placeholder: "e.g. 15000"
                      }),
                      ct.studentCount > 0 && e("div", { style: { fontSize: 10, color: "#8ba7b3", marginTop: 3 } }, rate)
                    )
                  )
                )
              );
            }),

            // Add contact button
            e("button", {
              onClick: addContact,
              style: {
                width: "100%", padding: "10px 0", borderRadius: 10,
                border: "1.5px dashed " + C.cyan, background: "transparent",
                color: C.cyan, fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 4
              }
            }, "+ Add Contact")
          ),

          // Post-event debrief (both sides)
          e("div", { style: { marginTop: isUR ? 0 : 4 } },
            e("label", { style: lbl }, "Post-Event Debrief"),
            e("textarea", {
              style: Object.assign({}, inp, { minHeight: 80, resize: "vertical" }),
              value: f.debrief || "", onChange: function(ev) { set("debrief", ev.target.value); },
              placeholder: "What worked, follow-up actions…"
            })
          )
        ),

        // ── Travel & Stay tab ───────────────────────────────────────────
        f._tab === "Travel & Stay" && e("div", null,
          e("div", { style: { fontWeight: 700, fontSize: 13, color: isUR ? UR.accent : C.cyan, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em" } },
            "✈️  Team Travel & Accommodation"
          ),

          travelers.length === 0 && e("div", {
            style: { textAlign: "center", padding: "24px 0", color: P.gray, border: "1.5px dashed " + P.grayLight, borderRadius: 10, marginBottom: 16 }
          },
            e("div", { style: { fontSize: 30, marginBottom: 6 } }, "🧳"),
            e("div", { style: { fontSize: 13 } }, "No travel entries yet. Add one below.")
          ),

          travelers.map(function(t, i) {
            return e("div", {
              key: i,
              style: { background: isUR ? "#fdf6fb" : "#f0f6f9", border: "1.5px solid " + P.grayLight, borderRadius: 12, padding: "16px 18px", marginBottom: 12 }
            },
              e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } },
                e("div", { style: { fontWeight: 700, fontSize: 13, color: isUR ? UR.primaryDark : C.oceanDark } },
                  "Traveler " + (i + 1) + (t.name ? " — " + t.name : "")
                ),
                e("button", {
                  onClick: function() { removeTraveler(i); },
                  style: { background: "none", border: "none", color: P.gray, fontSize: 16, cursor: "pointer", padding: "0 4px" }
                }, "✕")
              ),
              e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
                e("div", { style: { gridColumn: "1/-1" } },
                  e("label", { style: lbl }, "Team Member Name"),
                  e("input", { style: inp, value: t.name || "", onChange: function(ev) { setTraveler(i, "name", ev.target.value); }, placeholder: "e.g. Victoria" })
                ),
                e("div", null,
                  e("label", { style: lbl }, "✈️ Flight Booking"),
                  e("input", { style: inp, value: t.flight || "", onChange: function(ev) { setTraveler(i, "flight", ev.target.value); }, placeholder: "Airline, confirmation #, link…" })
                ),
                e("div", null,
                  e("label", { style: lbl }, "🏨 Hotel / Stay"),
                  e("input", { style: inp, value: t.hotel || "", onChange: function(ev) { setTraveler(i, "hotel", ev.target.value); }, placeholder: "Hotel name, confirmation #…" })
                ),
                e("div", null,
                  e("label", { style: lbl }, "Check-in Date"),
                  e("input", { style: inp, type: "date", value: t.checkIn || "", onChange: function(ev) { setTraveler(i, "checkIn", ev.target.value); } })
                ),
                e("div", null,
                  e("label", { style: lbl }, "Check-out Date"),
                  e("input", { style: inp, type: "date", value: t.checkOut || "", onChange: function(ev) { setTraveler(i, "checkOut", ev.target.value); } })
                ),
                e("div", { style: { gridColumn: "1/-1" } },
                  e("label", { style: lbl }, "Notes"),
                  e("input", { style: inp, value: t.notes || "", onChange: function(ev) { setTraveler(i, "notes", ev.target.value); }, placeholder: "Dietary needs, ground transport, rental car…" })
                )
              )
            );
          }),

          e("button", {
            onClick: addTraveler,
            style: {
              width: "100%", padding: "11px 0", borderRadius: 10,
              border: "1.5px dashed " + (isUR ? UR.accent : C.cyan),
              background: "transparent", color: isUR ? UR.accent : C.cyan,
              fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 4
            }
          }, "+ Add Traveler")
        ),

        // ── Footer ──────────────────────────────────────────────────────
        e("div", { style: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 } },
          e("button", {
            onClick: onClose,
            style: { padding: "10px 20px", borderRadius: 8, border: "1.5px solid " + P.grayLight, background: "transparent", cursor: "pointer", fontWeight: 600, color: P.gray }
          }, "Cancel"),
          e("button", {
            onClick: handleSave,
            style: { padding: "10px 24px", borderRadius: 8, border: "none", background: isUR ? UR.accent : C.cyan, color: isUR ? "#fff" : C.oceanDark, fontWeight: 700, cursor: "pointer" }
          }, "Save Event")
        )
      )
    )
  );
}
