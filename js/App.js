// ═══════════════════════════════════════════════════════════════════════════
// App.js — Root component + ReactDOM mount.
//
// Depends on: ALL hooks, pages, and components (must be last script loaded).
// ═══════════════════════════════════════════════════════════════════════════

function App() {
  var auth = useAuth();
  var ps   = useState("hub"); var page = ps[0]; var setPage = ps[1];

  // Loading screen
  if (auth.loading) return e("div", {
    style: {
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh",
      background: "linear-gradient(145deg,#012d41 0%,#023F5A 55%,#014d6e 100%)",
      color: "#fff", fontSize: 15,
      fontFamily: "'IBM Plex Sans',sans-serif",
      flexDirection: "column", gap: 16
    }
  },
    e("img", { src: LOGO, style: { width: 56, height: 56, objectFit: "contain", opacity: 0.9 } }),
    e("span", { style: { color: "#4ACDC4", fontWeight: 500 } }, "Loading…")
  );

  // Auth gate
  if (!auth.user) return e(LoginPage, { auth: auth });

  // Routing
  if (page === "events")   return e(EventsPage,   { user: auth.user, onLogout: auth.logout, onHub: function() { setPage("hub"); } });
  if (page === "calendar") return e(CalendarPage,  { user: auth.user, onLogout: auth.logout, onHub: function() { setPage("hub"); } });
  if (page === "kanban")   return e(KanbanPage,    { user: auth.user, onLogout: auth.logout, onHub: function() { setPage("hub"); } });

  return e(HubPage, { user: auth.user, onLogout: auth.logout, onNav: setPage });
}

// ── Mount ──────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById("root")).render(e(App, null));
