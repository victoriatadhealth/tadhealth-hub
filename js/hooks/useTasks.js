// ═══════════════════════════════════════════════════════════════════════════
// hooks/useTasks.js — Kanban tasks + incoming requests queue.
//
// Uses Supabase real-time subscriptions so all connected clients stay in sync.
// Depends on: helpers.js (taskToDb), Supabase client (sb)
// ═══════════════════════════════════════════════════════════════════════════

function useTasks() {
  var ts = useState([]);     var tasks   = ts[0]; var setTasks   = ts[1];
  var ps = useState([]);     var pending = ps[0]; var setPending = ps[1];
  var ls = useState(false);  var loading = ls[0]; var setLoading = ls[1];

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  function fetchTasks() {
    return sb.from("tasks")
      .select("*")
      .order("deadline", { ascending: true, nullsFirst: false })
      .then(function(r) { if (!r.error) setTasks(r.data || []); });
  }

  function fetchPending() {
    return sb.from("requests_queue")
      .select("*")
      .eq("status", "pending")
      .order("submitted_at", { ascending: true })
      .then(function(r) { if (!r.error) setPending(r.data || []); });
  }

  // ── Initial load + real-time subscriptions ────────────────────────────────
  useEffect(function() {
    Promise.all([fetchTasks(), fetchPending()]).then(function() { setLoading(false); });

    var c1 = sb.channel("tasks-ch")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchTasks)
      .subscribe();

    var c2 = sb.channel("queue-ch")
      .on("postgres_changes", { event: "*", schema: "public", table: "requests_queue" }, fetchPending)
      .subscribe();

    return function() { sb.removeChannel(c1); sb.removeChannel(c2); };
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  function addTask(t) {
    return sb.from("tasks").insert(taskToDb(t)).then(function(r) {
      if (r.error) console.error("addTask error:", r.error);
      fetchTasks();
    });
  }

  function updateTask(t) {
    return sb.from("tasks")
      .update(Object.assign({}, taskToDb(t), { updated_at: new Date().toISOString() }))
      .eq("id", t.id)
      .then(function(r) {
        if (r.error) console.error("updateTask error:", r.error);
        fetchTasks();
      });
  }

  function deleteTask(id) {
    return sb.from("tasks").delete().eq("id", id).then(function(r) {
      if (r.error) console.error("deleteTask error:", r.error);
      fetchTasks();
    });
  }

  // ── Requests queue ────────────────────────────────────────────────────────
  function approveRequest(req) {
    sb.from("tasks").insert({
      id: req.id, name: req.name, status: "not-started",
      owner: "", deadline: req.deadline || null,
      project: req.campaign || "", description: req.description || "",
      requested_by: req.requested_by, email: req.email,
      department: req.department, type: req.type,
      priority: req.priority, from_form: true
    }).then(function(r) {
      if (r.error) console.error("approveRequest insert error:", r.error);
      fetchTasks();
    });

    sb.from("requests_queue").update({ status: "accepted" }).eq("id", req.id)
      .then(function(r) {
        if (r.error) console.error("approveRequest queue error:", r.error);
        fetchPending();
      });
  }

  function dismissRequest(id) {
    sb.from("requests_queue").update({ status: "dismissed" }).eq("id", id)
      .then(function(r) {
        if (r.error) console.error("dismissRequest error:", r.error);
        fetchPending();
      });
  }

  function approveAll() { pending.forEach(function(r) { approveRequest(r); }); }

  return {
    tasks: tasks, pending: pending, loading: loading,
    addTask: addTask, updateTask: updateTask, deleteTask: deleteTask,
    approveRequest: approveRequest, dismissRequest: dismissRequest, approveAll: approveAll
  };
}
