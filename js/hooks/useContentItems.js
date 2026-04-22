// ═══════════════════════════════════════════════════════════════════════════
// hooks/useContentItems.js — Content calendar items CRUD with real-time sync.
// Depends on: helpers.js (contentToDb, contentFromDb), Supabase client (sb)
// ═══════════════════════════════════════════════════════════════════════════

function useContentItems() {
  var is = useState([]);    var items   = is[0]; var setItems   = is[1];
  var ls = useState(false); var loading = ls[0]; var setLoading = ls[1];

  function fetch() {
    return sb.from("content_items")
      .select("*")
      .order("date", { ascending: true, nullsFirst: false })
      .then(function(r) {
        if (!r.error) setItems((r.data || []).map(contentFromDb));
        setLoading(false);
      });
  }

  useEffect(function() {
    fetch();
    var ch = sb.channel("content-ch")
      .on("postgres_changes", { event: "*", schema: "public", table: "content_items" }, fetch)
      .subscribe();
    return function() { sb.removeChannel(ch); };
  }, []);

  function saveItem(i) {
    return sb.from("content_items")
      .upsert(contentToDb(i), { onConflict: "id" })
      .then(function(r) {
        if (r.error) console.error("saveItem error:", r.error);
        fetch();
      });
  }

  function removeItem(id) {
    return sb.from("content_items").delete().eq("id", id).then(fetch);
  }

  return { items: items, loading: loading, saveItem: saveItem, removeItem: removeItem };
}
