// ═══════════════════════════════════════════════════════════════════════════
// pages/KanbanPage.js — Project tracker (board + list views).
//
// Props: user, onLogout, onHub
// Depends on: hooks/useTasks.js, pages/TaskModal.js,
//             components/SharedUI.js, constants.js
// ═══════════════════════════════════════════════════════════════════════════

function KanbanPage(props) {
  var th = useTasks();

  var vs  = useState("board");  var view          = vs[0];  var setView          = vs[1];
  var fss = useState("all");    var filterStatus  = fss[0]; var setFilterStatus  = fss[1];
  var fps = useState("all");    var filterProject = fps[0]; var setFilterProject = fps[1];
  var ms  = useState(null);     var modal         = ms[0];  var setModal         = ms[1];
  var sps = useState(false);    var showPending   = sps[0]; var setShowPending   = sps[1];

  var todayStr = new Date().toISOString().slice(0, 10);

  var projects = useMemo(function() {
    return Array.from(
      new Set(th.tasks.filter(function(t) { return t.project; }).map(function(t) { return t.project; }))
    ).sort();
  }, [th.tasks]);

  function handleSave(task) {
    if (task.id && th.tasks.find(function(t) { return t.id === task.id; })) th.updateTask(task);
    else th.addTask(task);
  }

  if (th.loading) return e("div", {
    style: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#023F5A", color: "#fff", fontSize: 18 }
  }, "Loading…");

  return e("div", { style: { fontFamily: "'IBM Plex Sans',system-ui,sans-serif", background: "#e6f2f7", minHeight: "100vh" } },

    // ── NavBar ─────────────────────────────────────────────────────────────
    e(NavBar, {
      user: props.user, onLogout: props.onLogout,
      title: "Project Tracker", onHub: props.onHub,
      rightSlot: e("div", { style: { display: "flex", gap: 8 } },
        // Pending requests badge
        e("button", {
          onClick: function() { setShowPending(function(v) { return !v; }); },
          style: {
            position: "relative",
            background: th.pending.length ? "rgba(74,205,202,0.18)" : "rgba(255,255,255,0.08)",
            border: "1.5px solid " + (th.pending.length ? "#4ACDC4" : "rgba(255,255,255,0.2)"),
            borderRadius: 8, padding: "7px 14px",
            color: th.pending.length ? "#4ACDC4" : "rgba(255,255,255,0.6)",
            fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit"
          }
        },
          "📥 Requests",
          th.pending.length > 0 && e("span", {
            style: {
              position: "absolute", top: -6, right: -6,
              background: "#f59dc3", color: "#fff", borderRadius: "50%",
              width: 18, height: 18, fontSize: 10, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center"
            }
          }, th.pending.length)
        ),
        e("button", {
          onClick: function() { setModal({}); },
          style: {
            background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.25)",
            borderRadius: 8, padding: "7px 14px", color: "#fff",
            fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit"
          }
        }, "+ Add Task")
      )
    },
      // ── Sub-nav tabs ────────────────────────────────────────────────────
      e("div", {
        style: {
          display: "flex", alignItems: "center",
          maxWidth: 1400, margin: "0 auto", paddingTop: 6,
          overflowX: "auto", gap: 0
        }
      },
        e(NavTab, { active: view === "board", onClick: function() { setView("board"); } }, " Board"),
        e(NavTab, { active: view === "list",  onClick: function() { setView("list");  } }, "☰ List"),
        e(NavSep),
        e(NavTab, { active: filterStatus === "all", onClick: function() { setFilterStatus("all"); } }, "All"),
        KANBAN_STATUSES.map(function(s) {
          return e(NavTab, { key: s.id, active: filterStatus === s.id, onClick: function() { setFilterStatus(s.id); } }, s.label);
        }),
        projects.length > 0 && e(NavSep),
        projects.length > 0 && e("select", {
          value: filterProject,
          onChange: function(ev) { setFilterProject(ev.target.value); },
          style: {
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 6, color: "#fff", fontSize: 12,
            padding: "5px 10px", fontFamily: "inherit", outline: "none",
            marginBottom: 4, cursor: "pointer"
          }
        },
          e("option", { value: "all" }, "All Projects"),
          projects.map(function(p) { return e("option", { key: p, value: p }, p); })
        )
      )
    ),

    // ── Pending requests panel ─────────────────────────────────────────────
    showPending && e("div", { style: { background: "#fff", borderBottom: "1.5px solid #e6ecef", padding: "20px 24px" } },
      e("div", { style: { maxWidth: 1400, margin: "0 auto" } },
        e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } },
          e("div", { style: { fontFamily: "'Onest',sans-serif", fontWeight: 700, fontSize: 16, color: "#023F5A" } }, "📥 Incoming Requests"),
          e("button", { onClick: function() { setShowPending(false); }, style: { background: "none", border: "none", color: "#b0c4cc", fontSize: 20, cursor: "pointer" } }, "×")
        ),
        !th.pending.length
          ? e("div", { style: { textAlign: "center", padding: "32px 0", color: "#8ba7b3" } }, "✅ No pending requests")
          : e("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
              e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } },
                e("span", { style: { fontSize: 13, color: "#8ba7b3" } },
                  th.pending.length + " request" + (th.pending.length !== 1 ? "s" : "") + " waiting"
                ),
                e("button", {
                  onClick: th.approveAll,
                  style: {
                    padding: "7px 16px", background: "#4ACDC4", color: "#023F5A",
                    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit"
                  }
                }, "Accept All →")
              ),
              th.pending.map(function(req) {
                return e("div", { key: req.id, style: { background: "#fff", borderRadius: 12, border: "1.5px solid #e6ecef", padding: "16px 18px" } },
                  e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: req.description ? 8 : 0 } },
                    e("div", null,
                      e("div", { style: { fontWeight: 700, fontSize: 14, color: "#011a26", marginBottom: 4 } }, req.name),
                      e("div", { style: { fontSize: 12, color: "#8ba7b3", display: "flex", gap: 10, flexWrap: "wrap" } },
                        req.requested_by && e("span", null, "👤 " + req.requested_by),
                        req.department   && e("span", null, req.department),
                        req.deadline     && e("span", null, "📅 " + req.deadline),
                        req.priority     && e("span", { style: { fontWeight: 600 } }, req.priority + " Priority")
                      )
                    ),
                    e("div", { style: { display: "flex", gap: 8, flexShrink: 0 } },
                      e("button", {
                        onClick: function() { th.approveRequest(req); },
                        style: { padding: "7px 14px", background: "#023F5A", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }
                      }, "Accept"),
                      e("button", {
                        onClick: function() { th.dismissRequest(req.id); },
                        style: { padding: "7px 10px", background: "transparent", color: "#b0c4cc", border: "1.5px solid #e6ecef", borderRadius: 8, fontSize: 12, cursor: "pointer" }
                      }, "×")
                    )
                  ),
                  req.description && e("div", { style: { fontSize: 13, color: "#8ba7b3", background: "#fafcfd", borderRadius: 8, padding: "10px 12px", lineHeight: 1.5 } }, req.description)
                );
              })
            )
      )
    ),

    // ── Main content area ──────────────────────────────────────────────────
    e("div", { style: { maxWidth: 1400, margin: "0 auto", padding: "28px 24px" } },

      // ────────────────── Board view ────────────────────────────────────────
      view === "board"
        ? e("div", { style: { display: "flex", gap: 14, overflowX: "auto", paddingBottom: 24, alignItems: "flex-start", minHeight: "60vh" } },
            KANBAN_STATUSES.map(function(status) {
              var colTasks = th.tasks
                .filter(function(t) {
                  return t.status === status.id
                    && (filterStatus === "all" || filterStatus === status.id)
                    && (filterProject === "all" || (t.project || "") === filterProject);
                })
                .sort(function(a, b) {
                  if (!a.deadline && !b.deadline) return 0;
                  if (!a.deadline) return 1;
                  if (!b.deadline) return -1;
                  return a.deadline.localeCompare(b.deadline);
                });

              return e("div", { key: status.id, style: { minWidth: 210, flex: "0 0 210px", display: "flex", flexDirection: "column", gap: 8 } },
                // Column header
                e("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 13px", borderRadius: 10, background: status.color, marginBottom: 4 } },
                  e("span", { style: { fontWeight: 700, fontSize: 12, color: status.textColor, fontFamily: "'Onest',sans-serif" } }, status.label),
                  e("span", { style: { background: "rgba(255,255,255,0.28)", color: status.textColor, borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 700 } }, colTasks.length)
                ),
                // Task cards
                colTasks.map(function(task) {
                  var overdue = task.deadline && task.deadline < todayStr && task.status !== "done";
                  return e("div", {
                    key: task.id, onClick: function() { setModal(task); },
                    style: {
                      background: "#fff", borderRadius: 10, padding: "12px 13px",
                      border: "1.5px solid #e6ecef", cursor: "pointer",
                      borderLeft: "3.5px solid " + status.color,
                      boxShadow: "0 1px 5px rgba(2,63,90,0.07)"
                    }
                  },
                    e("div", { style: { fontWeight: 600, fontSize: 13, color: "#011a26", lineHeight: 1.4, marginBottom: 4 } }, task.name),
                    task.project && e("div", { style: { fontSize: 10, fontWeight: 700, color: "#35928b", background: "#edfaf9", borderRadius: 4, padding: "2px 7px", display: "inline-block", marginBottom: 4 } }, "📂 " + task.project),
                    (task.requested_by || task.requestedBy) && e("div", { style: { fontSize: 10, color: "#b0c4cc", marginBottom: 4 } }, "📥 " + (task.requested_by || task.requestedBy)),
                    e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 } },
                      e("span", { style: { fontSize: 11, color: "#8ba7b3" } }, task.owner ? "👤 " + task.owner : ""),
                      task.deadline && e("span", {
                        style: {
                          fontSize: 11, fontWeight: overdue ? 700 : 500,
                          color: overdue ? "#ae6f8a" : "#8ba7b3",
                          background: overdue ? "#fef5f9" : "transparent",
                          borderRadius: 4, padding: overdue ? "2px 5px" : 0
                        }
                      }, (overdue ? "⚠️ " : "📅 ") + task.deadline)
                    )
                  );
                }),
                // Add card button
                e("button", {
                  onClick: function() { setModal({ status: status.id }); },
                  style: {
                    background: "transparent", border: "1.5px dashed #d0dde3",
                    borderRadius: 10, padding: 9, color: "#b0c4cc",
                    fontSize: 12, cursor: "pointer", fontWeight: 600,
                    fontFamily: "inherit", marginTop: 2
                  }
                }, "+ Add")
              );
            })
          )

        // ────────────────── List view ─────────────────────────────────────
        : e("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
            th.tasks
              .filter(function(t) {
                return (filterStatus === "all" || t.status === filterStatus)
                  && (filterProject === "all" || (t.project || "") === filterProject);
              })
              .sort(function(a, b) {
                if (!a.deadline && !b.deadline) return 0;
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return a.deadline.localeCompare(b.deadline);
              })
              .map(function(task) {
                var st      = KANBAN_STATUSES.find(function(s) { return s.id === task.status; }) || KANBAN_STATUSES[0];
                var overdue = task.deadline && task.deadline < todayStr && task.status !== "done";
                return e("div", {
                  key: task.id, onClick: function() { setModal(task); },
                  style: {
                    background: "#fff", border: "1.5px solid #e6ecef",
                    borderLeft: "4px solid " + st.color, borderRadius: 12,
                    padding: "14px 18px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 14,
                    boxShadow: "0 1px 6px rgba(2,63,90,0.05)"
                  }
                },
                  e("div", { style: { flex: 1, minWidth: 0 } },
                    e("div", { style: { fontWeight: 600, fontSize: 14, color: "#011a26", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, task.name),
                    e("div", { style: { fontSize: 12, color: "#8ba7b3", marginTop: 3, display: "flex", gap: 12, flexWrap: "wrap" } },
                      task.project && e("span", { style: { color: "#35928b", fontWeight: 600 } }, "📂 " + task.project),
                      task.owner   && e("span", null, "👤 " + task.owner),
                      (task.requested_by || task.requestedBy) && e("span", null, "📥 " + (task.requested_by || task.requestedBy)),
                      task.deadline && e("span", { style: { color: overdue ? "#ae6f8a" : "#8ba7b3", fontWeight: overdue ? 700 : 400 } },
                        (overdue ? "⚠️ " : "📅 ") + task.deadline
                      )
                    )
                  ),
                  e("span", {
                    style: {
                      fontSize: 11, fontWeight: 700, color: st.textColor,
                      background: st.color, borderRadius: 20,
                      padding: "4px 12px", whiteSpace: "nowrap", flexShrink: 0
                    }
                  }, st.label)
                );
              })
          )
    ),

    // ── Task modal ─────────────────────────────────────────────────────────
    modal !== null && e(TaskModal, {
      task:     typeof modal === "object" ? modal : {},
      onClose:  function() { setModal(null); },
      onSave:   handleSave,
      onDelete: th.deleteTask
    })
  );
}
