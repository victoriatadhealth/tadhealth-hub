// ═══════════════════════════════════════════════════════════════════════════
// pages/LoginPage.js — Google sign-in screen.
//
// Accepts props.auth (from useAuth hook).
// Restricts access to @tadhealth.com emails via the auth hook.
// ═══════════════════════════════════════════════════════════════════════════

function LoginPage(props) {
  var auth      = props.auth;
  var signingIn = auth.loading;

  return e("div", {
    style: {
      position: "fixed", inset: 0,
      background: "linear-gradient(145deg,#012d41 0%,#023F5A 55%,#014d6e 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 28, padding: 20
    }
  },
    // ── Logo + tagline ────────────────────────────────────────────────────
    e("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10 } },
      e("img", { src: LOGO, style: { width: 80, height: 80, objectFit: "contain" } }),
      e("div", { style: { fontFamily: "'Onest',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff" } },
        "TadHealth Marketing Hub"
      ),
      e("div", { style: { fontSize: 12, color: "#4ACDC4", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" } },
        "Empowering Those Who Care"
      )
    ),

    // ── Sign-in card ──────────────────────────────────────────────────────
    e("div", {
      style: {
        background: "#fff", borderRadius: 20, padding: 40,
        width: "100%", maxWidth: 380,
        boxShadow: "0 32px 96px rgba(0,0,0,0.35)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20
      }
    },
      e("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" } },
        e("h2", { style: { fontFamily: "'Onest',sans-serif", fontSize: 20, fontWeight: 700, color: "#023F5A", margin: 0 } },
          "Welcome back"
        ),
        e("p", { style: { fontSize: 13.5, color: "#8ba7b3", margin: 0 } },
          "Sign in with your TadHealth Google account"
        )
      ),

      // ── Error message ─────────────────────────────────────────────────
      auth.authError && e("div", {
        style: {
          width: "100%", fontSize: 13, color: "#ae6f8a",
          background: "#fef5f9", border: "1px solid #fad2e3",
          borderRadius: 8, padding: "10px 14px",
          textAlign: "center", boxSizing: "border-box"
        }
      }, auth.authError),

      // ── Google sign-in button ─────────────────────────────────────────
      e("button", {
        onClick: auth.loginWithGoogle,
        disabled: signingIn,
        style: {
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          padding: "13px 20px", background: signingIn ? "#f5f5f5" : "#fff",
          border: "1.5px solid #e6ecef", borderRadius: 11,
          fontSize: 15, fontWeight: 600, color: "#023F5A",
          fontFamily: "'IBM Plex Sans',sans-serif",
          cursor: signingIn ? "not-allowed" : "pointer",
          boxShadow: "0 2px 8px rgba(2,63,90,0.08)",
          opacity: signingIn ? 0.7 : 1,
          transition: "box-shadow 0.15s, background 0.15s"
        }
      },
        // Google "G" logo SVG
        e("svg", { width: 20, height: 20, viewBox: "0 0 48 48" },
          e("path", { fill: "#EA4335", d: "M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.3 30.2 0 24 0 14.6 0 6.6 5.5 2.6 13.6l7.9 6.1C12.4 13.1 17.7 9.5 24 9.5z" }),
          e("path", { fill: "#4285F4", d: "M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7.1-10.1 7.1-17.1z" }),
          e("path", { fill: "#FBBC05", d: "M10.5 28.3A14.6 14.6 0 0 1 9.5 24c0-1.5.3-2.9.7-4.3l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.4z" }),
          e("path", { fill: "#34A853", d: "M24 48c6.2 0 11.4-2 15.2-5.5l-7.6-5.9c-2 1.4-4.7 2.2-7.6 2.2-6.3 0-11.6-3.6-13.5-9.5l-7.9 6.4C6.6 42.5 14.6 48 24 48z" })
        ),
        signingIn ? "Signing in…" : "Sign in with Google"
      ),

      e("div", { style: { fontSize: 12, color: "#b0c4cc", textAlign: "center", lineHeight: 1.5 } },
        "Access is restricted to ",
        e("span", { style: { fontWeight: 600, color: "#8ba7b3" } }, "@tadhealth.com"),
        " accounts only."
      )
    )
  );
}
