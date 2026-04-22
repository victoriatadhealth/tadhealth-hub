// ═══════════════════════════════════════════════════════════════════════════
// pages/TaskModal.js — Create / edit a Kanban task.
// Depends on: constants.js (KANBAN_STATUSES), components/SharedUI.js (Modal, ModalHeader, Field, inp)
// ═══════════════════════════════════════════════════════════════════════════

function TaskModal(props) {
  var task    = props.task;
  var onClose = props.onClose;
  var onSave  = props.onSave;
  var onDelete= props.onDelete;
  var isNew   = !task || !task.id;

  var fs = useState(
    isNew
      ? {
          id:          "task-" + Date.now(),
          name:        "",
          status:      (task && task.status) || "not-started",
          owner:       "",
          deadline:    "",
          project:     "",
          description: "",
          requestedBy: ""
        }
      : Object.assign({}, task)
  );
  var f = fs[0]; var setF = fs[1];

  function set(k, v) { setF(function(p) { return Object.assign({}, p, { [k]: v }); }); }

  var st = KANBAN_STATUSES.find(function(s) { return s.id === f.status; }) || KANBAN_STATUSES[0];

  return e(Modal, { onClose: onClose },
    e(ModalHeader, { title: isNew ? "New Task" : "Edit Task", onClose: onClose }),
    e("div", { style: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 } },
      e(Field, { label: "Task / Project Name *" },
        e("input", {
          style: inp, value: f.name,
          onChange: function(ev) { set("name", ev.target.value); },
          placeholder: "e.g. Write Q2 Campaign Brief"
        })
      ),
      e(Field, { label: "Project" },
        e("input", {
          style: inp, value: f.project || "",
          onChange: function(ev) { set("project", ev.target.value); },
          placeholder: "e.g. Q2 Campaign…"
        })
      ),
      e("div", { style: { display: "flex", gap: 12 } },
        e(Field, { label: "Status", style: { flex: 1 } },
          e("select", { style: inp, value: f.status, onChange: function(ev) { set("status", ev.target.value); } },
            KANBAN_STATUSES.map(function(s) { return e("option", { key: s.id, value: s.id }, s.label); })
          )
        ),
        e(Field, { label: "Owner", style: { flex: 1 } },
          e("input", {
            style: inp, value: f.owner || "",
            onChange: function(ev) { set("owner", ev.target.value); },
            placeholder: "e.g. Jen"
          })
        )
      ),
      e(Field, { label: "Deadline" },
        e("input", { style: inp, type: "date", value: f.deadline || "", onChange: function(ev) { set("deadline", ev.target.value); } })
      ),
      (f.requestedBy || f.requested_by) && e(Field, { label: "Requested By" },
        e("input", {
          style: Object.assign({}, inp, { color: "#8ba7b3", background: "#fafcfd" }),
          value: f.requestedBy || f.requested_by || "",
          readOnly: true
        })
      ),
      e(Field, { label: "Description / Notes" },
        e("textarea", {
          style: Object.assign({}, inp, { minHeight: 90, resize: "vertical" }),
          value: f.description || "",
          onChange: function(ev) { set("description", ev.target.value); },
          placeholder: "Add context, links, or details…"
        })
      ),
      e("div", { style: { display: "flex", alignItems: "center", gap: 8, paddingTop: 4 } },
        e("span", { style: { fontSize: 12, color: "#8ba7b3" } }, "Status:"),
        e("span", {
          style: {
            background: st.color, color: st.textColor,
            borderRadius: 20, padding: "3px 12px",
            fontSize: 12, fontWeight: 700
          }
        }, st.label)
      )
    ),
    e("div", { style: { padding: "12px 24px 20px", display: "flex", gap: 10, borderTop: "1.5px solid #f0f4f6" } },
      e("button", {
        onClick: function() {
          if (!f.name.trim()) { alert("Please add a task name."); return; }
          onSave(f); onClose();
        },
        style: {
          flex: 1, padding: 11, background: "#023F5A", color: "#fff",
          border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
          fontFamily: "'Onest',sans-serif", cursor: "pointer"
        }
      }, isNew ? "Add Task" : "Save Changes"),
      !isNew && onDelete && e("button", {
        onClick: function() { if (confirm("Delete this task?")) { onDelete(f.id); onClose(); } },
        style: {
          padding: "11px 16px", background: "transparent",
          color: "#ae6f8a", border: "1.5px solid #fad2e3",
          borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer"
        }
      }, "Delete"),
      e("button", {
        onClick: onClose,
        style: {
          padding: "11px 16px", background: "transparent",
          color: "#8ba7b3", border: "1.5px solid #e6ecef",
          borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer"
        }
      }, "Cancel")
    )
  );
}
