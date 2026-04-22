// ═══════════════════════════════════════════════════════════════════════════
// hooks/useAnalyticsNote.js — Persistent free-text analytics notes per group.
//
// Notes are stored in the `analytics_notes` table keyed by group_name
// ("bizdev" or "userrev").
// ═══════════════════════════════════════════════════════════════════════════

function useAnalyticsNote(group) {
  var ns = useState(""); var note = ns[0]; var setNote = ns[1];

  useEffect(function() {
    sb.from("analytics_notes")
      .select("content")
      .eq("group_name", group)
      .single()
      .then(function(r) { if (r.data) setNote(r.data.content || ""); });
  }, [group]);

  function saveNote(text) {
    setNote(text);
    sb.from("analytics_notes")
      .upsert(
        { group_name: group, content: text, updated_at: new Date().toISOString() },
        { onConflict: "group_name" }
      )
      .then(function(r) { if (r.error) console.error("saveNote error:", r.error); });
  }

  return { note: note, saveNote: saveNote };
}
