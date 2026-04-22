// ═══════════════════════════════════════════════════════════════════════════
// components/SharedUI.js — Reusable UI primitives used across multiple pages.
//
// Exports: Modal, ModalHeader, Field, NavTab, NavSep, NavBar
// ═══════════════════════════════════════════════════════════════════════════

// ─── Modal overlay + card ────────────────────────────────────────────────────
function Modal(props) {
  return e("div", {
    onClick: function(ev) { if (ev.target === ev.currentTarget) props.onClose(); },
    style: {
      position: "fixed", inset: 0,
      background: "rgba(1,26,38,0.65)",
      zIndex: 9999, display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16
    }
  },
    e("div", {
      style: {
        background: "#fff", borderRadius: 20,
        width: "100%", maxWidth: props.maxWidth || 500,
        boxShadow: "0 32px 80px rgba(2,63,90,0.28)",
        overflow: "hidden", maxHeight: "90vh", overflowY: "auto"
      }
    }, props.children)
  );
}

// ─── Modal header with gradient + close button ────────────────────────────────
function ModalHeader(props) {
  return e("div", {
    style: {
      background: "linear-gradient(135deg,#023F5A 0%,#4ACDC4 100%)",
      padding: "18px 24px",
      display: "flex", justifyContent: "space-between", alignItems: "center"
    }
  },
    e("span", {
      style: { fontFamily: "'Onest',sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }
    }, props.title),
    e("button", {
      onClick: props.onClose,
      style: {
        background: "rgba(255,255,255,0.15)", border: "none",
        color: "#fff", fontSize: 18, cursor: "pointer",
        width: 30, height: 30, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center"
      }
    }, "×")
  );
}

// ─── Labelled form field wrapper ──────────────────────────────────────────────
function Field(props) {
  return e("div", { style: props.style || {} },
    e("label", {
      style: { fontSize: 12, fontWeight: 600, color: "#023F5A", display: "block", marginBottom: 5 }
    }, props.label),
    props.children
  );
}

// ─── Navigation tab button ────────────────────────────────────────────────────
function NavTab(props) {
  return e("button", {
    onClick: props.onClick,
    style: {
      background: "transparent", border: "none",
      borderBottom: props.active ? "2.5px solid #4ACDC4" : "2.5px solid transparent",
      color: props.active ? "#fff" : "rgba(255,255,255,0.55)",
      fontWeight: 600, fontSize: 13,
      padding: "6px 12px 10px",
      cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap"
    }
  }, props.children);
}

// ─── Vertical separator for nav bars ─────────────────────────────────────────
function NavSep() {
  return e("div", {
    style: {
      width: 1, background: "rgba(255,255,255,0.15)",
      margin: "0 8px", height: 20, alignSelf: "center"
    }
  });
}

// ─── Top navigation bar ───────────────────────────────────────────────────────
function NavBar(props) {
  var ms = useState(false); var showMenu = ms[0]; var setShowMenu = ms[1];

  return e("div", {
    style: {
      background: "#023F5A", padding: "0 24px",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 2px 16px rgba(1,26,38,0.3)"
    }
  },
    // ── Top row: title + user menu ──────────────────────────────────────────
    e("div", {
      style: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: 1400, margin: "0 auto",
        paddingTop: 14, paddingBottom: 2, paddingRight: 16
      }
    },
      e("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
        props.onHub && e("button", {
          onClick: props.onHub,
          style: {
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8, padding: "5px 11px",
            color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer", fontFamily: "inherit"
          }
        }, "← Hub"),
        e("span", {
          style: { color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "'Onest',sans-serif" }
        }, props.title)
      ),
      e("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
        props.rightSlot,
        // ── User avatar dropdown ──────────────────────────────────────────
        e("div", { style: { position: "relative" } },
          e("button", {
            onClick: function() { setShowMenu(function(v) { return !v; }); },
            style: {
              display: "flex", alignItems: "center", gap: 8,
              padding: "5px 12px 5px 5px",
              background: "rgba(255,255,255,0.08)",
              border: "1.5px solid rgba(255,255,255,0.15)",
              borderRadius: 30, fontSize: 12, fontWeight: 600,
              color: "#fff", cursor: "pointer", fontFamily: "inherit"
            }
          },
            props.user && props.user.avatar
              ? e("img", {
                  src: props.user.avatar,
                  style: { width: 26, height: 26, borderRadius: "50%", objectFit: "cover", border: "1.5px solid rgba(255,255,255,0.3)" }
                })
              : e("div", {
                  style: {
                    width: 26, height: 26, borderRadius: "50%",
                    background: "#4ACDC4", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#023F5A"
                  }
                }, props.user && props.user.name ? props.user.name[0].toUpperCase() : "👤"),
            props.user && (props.user.name || props.user.email)
          ),
          showMenu && e("div", {
            style: {
              position: "absolute", right: 0, top: "100%", marginTop: 8,
              background: "#fff", borderRadius: 12,
              boxShadow: "0 8px 32px rgba(2,63,90,0.18)",
              border: "1.5px solid #e6ecef", minWidth: 140, zIndex: 200
            }
          },
            e("button", {
              onClick: function() { props.onLogout(); setShowMenu(false); },
              style: {
                width: "100%", padding: "12px 16px",
                background: "none", border: "none",
                textAlign: "left", fontSize: 13, fontWeight: 600,
                color: "#ae6f8a", cursor: "pointer"
              }
            }, "Sign Out")
          )
        )
      )
    ),
    // ── Secondary slot (tabs, filters, etc.) passed as children ────────────
    props.children
  );
}
