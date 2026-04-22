// ═══════════════════════════════════════════════════════════════════════════
// pages/HubPage.js — Home hub with 3 navigation cards.
//
// Props: user, onLogout, onNav(pageId)
// ═══════════════════════════════════════════════════════════════════════════

function HubPage(props) {
  var hs = useState(null); var hov = hs[0]; var setHov = hs[1];

  var cards = [
    {
      id:   "events",
      icon: "📅",
      name: "Event Strategy",
      desc: "Track events, ROI, team assignments, and regional planning."
    },
    {
      id:   "calendar",
      icon: "📣",
      name: "Content Calendar",
      desc: "Plan and manage blog, email, and social content across channels."
    },
    {
      id:   "kanban",
      icon: "📋",
      name: "Project Tracker",
      desc: "Track tasks, manage requests, and keep the team moving forward."
    }
  ];

  return e("div", {
    style: {
      position: "fixed", inset: 0,
      background: "linear-gradient(145deg,#012d41 0%,#023F5A 55%,#014d6e 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 32, padding: 24
    }
  },
    // ── Sign out button ───────────────────────────────────────────────────
    e("button", {
      onClick: props.onLogout,
      style: {
        position: "fixed", top: 14, right: 18,
        padding: "7px 16px", background: "rgba(255,255,255,0.95)",
        border: "1.5px solid #e6ecef", borderRadius: 30,
        fontSize: 13, fontWeight: 600, color: "#023F5A", cursor: "pointer"
      }
    }, "Sign Out"),

    // ── Logo + title ──────────────────────────────────────────────────────
    e("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 } },
      e("img", { src: LOGO, style: { width: 80, height: 80, objectFit: "contain" } }),
      e("div", { style: { fontFamily: "'Onest',sans-serif", fontSize: 24, fontWeight: 800, color: "#fff" } },
        "TadHealth Marketing Hub"
      ),
      e("div", { style: { fontSize: 12, color: "#4ACDC4", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" } },
        "Empowering Those Who Care"
      )
    ),

    // ── Greeting ──────────────────────────────────────────────────────────
    e("div", { style: { fontSize: 14, color: "rgba(255,255,255,0.55)" } },
      "Welcome back, ",
      e("span", { style: { color: "#fff", fontWeight: 600 } }, props.user && props.user.email),
      " — where would you like to go?"
    ),

    // ── Navigation cards ──────────────────────────────────────────────────
    e("div", { style: { display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 820 } },
      cards.map(function(card) {
        var isHov = hov === card.id;
        return e("div", {
          key:          card.id,
          onClick:      function() { props.onNav(card.id); },
          onMouseEnter: function() { setHov(card.id); },
          onMouseLeave: function() { setHov(null); },
          style: {
            background:    isHov ? "rgba(255,255,255,0.1)"  : "rgba(255,255,255,0.05)",
            border:        "1.5px solid " + (isHov ? "#4ACDC4" : "rgba(255,255,255,0.12)"),
            borderRadius:  20,
            padding:       "32px 28px",
            width:         220,
            cursor:        "pointer",
            display:       "flex",
            flexDirection: "column",
            alignItems:    "flex-start",
            gap:           14,
            transform:     isHov ? "translateY(-3px)" : "none",
            boxShadow:     isHov ? "0 16px 48px rgba(0,0,0,0.3)" : "none",
            transition:    "all 0.2s",
            backdropFilter:"blur(8px)"
          }
        },
          e("div", { style: { fontSize: 32 } }, card.icon),
          e("div", { style: { fontFamily: "'Onest',sans-serif", fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.2 } }, card.name),
          e("div", { style: { fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 } }, card.desc),
          e("div", { style: { fontSize: 18, color: "#4ACDC4", marginTop: 4 } }, "→")
        );
      })
    )
  );
}
