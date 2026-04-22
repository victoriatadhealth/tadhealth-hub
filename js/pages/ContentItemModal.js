// ═══════════════════════════════════════════════════════════════════════════
// pages/ContentItemModal.js — Create / edit a content calendar item.
// Depends on: constants.js, components/SharedUI.js (Modal, ModalHeader, Field, inp)
// ═══════════════════════════════════════════════════════════════════════════

function ContentItemModal(props) {
  var item    = props.item;
  var onClose = props.onClose;
  var onSave  = props.onSave;
  var onDelete= props.onDelete;
  var isNew   = !item || !item.id;

  var fs = useState(
    isNew
      ? {
          id:            "item-" + Date.now(),
          title:         "",
          type:          "blog",
          date:          "",
          channel:       "",
          platforms:     [],
          campaign:      "",
          campaignStart: "",
          campaignEnd:   "",
          audience:      [],
          status:        "Draft",
          notes:         ""
        }
      : Object.assign({}, item)
  );
  var f = fs[0]; var setF = fs[1];

  function set(k, v) { setF(function(p) { return Object.assign({}, p, { [k]: v }); }); }

  function toggleArr(k, val) {
    setF(function(p) {
      var cur = p[k] || [];
      return Object.assign({}, p, { [k]: cur.includes(val) ? cur.filter(function(x) { return x !== val; }) : cur.concat([val]) });
    });
  }

  return e(Modal, { onClose: onClose, maxWidth: 520 },
    e(ModalHeader, { title: isNew ? "New Content Item" : "Edit Content Item", onClose: onClose }),
    e("div", { style: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 } },

      e(Field, { label: "Title *" },
        e("input", { style: inp, value: f.title, onChange: function(ev) { set("title", ev.target.value); }, placeholder: "e.g. Back to School Mental Health Tips" })
      ),

      e("div", { style: { display: "flex", gap: 12 } },
        e(Field, { label: "Type", style: { flex: 1 } },
          e("select", { style: inp, value: f.type, onChange: function(ev) { set("type", ev.target.value); } },
            CONTENT_TYPES.map(function(t) { return e("option", { key: t.id, value: t.id }, t.label); })
          )
        ),
        e(Field, { label: "Status", style: { flex: 1 } },
          e("select", { style: inp, value: f.status, onChange: function(ev) { set("status", ev.target.value); } },
            CONTENT_STATUS_OPTIONS.map(function(s) { return e("option", { key: s }, s); })
          )
        )
      ),

      e(Field, { label: "Publish Date" },
        e("input", { style: inp, type: "date", value: f.date || "", onChange: function(ev) { set("date", ev.target.value); } })
      ),

      e(Field, { label: "Channel" },
        e("select", { style: inp, value: f.channel || "", onChange: function(ev) { set("channel", ev.target.value); } },
          e("option", { value: "" }, "Select channel…"),
          CAL_CHANNELS.map(function(ch) { return e("option", { key: ch }, ch); })
        )
      ),

      e(Field, { label: "Platform" },
        e("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
          PLATFORMS.map(function(p) {
            var active = (f.platforms || []).includes(p);
            return e("button", {
              key: p, type: "button", onClick: function() { toggleArr("platforms", p); },
              style: {
                padding: "5px 12px", borderRadius: 20,
                border: "1.5px solid " + (active ? "#4ACDC4" : "#e6ecef"),
                background: active ? "#edfaf9" : "transparent",
                color: active ? "#35928b" : "#8ba7b3",
                fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit"
              }
            }, p);
          })
        )
      ),

      e(Field, { label: "Campaign" },
        e("input", { style: inp, value: f.campaign || "", onChange: function(ev) { set("campaign", ev.target.value); }, placeholder: "e.g. Q2 Report Launch" })
      ),

      e("div", { style: { display: "flex", gap: 12 } },
        e(Field, { label: "Campaign Start", style: { flex: 1 } },
          e("input", { style: inp, type: "date", value: f.campaignStart || "", onChange: function(ev) { set("campaignStart", ev.target.value); } })
        ),
        e(Field, { label: "Campaign End", style: { flex: 1 } },
          e("input", { style: inp, type: "date", value: f.campaignEnd || "", onChange: function(ev) { set("campaignEnd", ev.target.value); } })
        )
      ),

      e(Field, { label: "Target Audience" },
        e("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
          AUDIENCES.map(function(a) {
            var active = (f.audience || []).includes(a.id);
            return e("button", {
              key: a.id, type: "button", onClick: function() { toggleArr("audience", a.id); },
              style: {
                padding: "5px 12px", borderRadius: 20,
                border: "1.5px solid " + (active ? a.color : "#e6ecef"),
                background: active ? a.color + "22" : "transparent",
                color: active ? a.color : "#8ba7b3",
                fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit"
              }
            }, a.label);
          })
        )
      ),

      e(Field, { label: "Notes / Brief" },
        e("textarea", {
          style: Object.assign({}, inp, { minHeight: 80, resize: "vertical" }),
          value: f.notes || "", onChange: function(ev) { set("notes", ev.target.value); },
          placeholder: "Add context, links, or a brief…"
        })
      )
    ),

    e("div", { style: { padding: "12px 24px 20px", display: "flex", gap: 10, borderTop: "1.5px solid #f0f4f6" } },
      e("button", {
        onClick: function() {
          if (!f.title.trim()) { alert("Please add a title."); return; }
          onSave(f); onClose();
        },
        style: { flex: 1, padding: 11, background: "#023F5A", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: "'Onest',sans-serif", cursor: "pointer" }
      }, isNew ? "Add to Calendar" : "Save Changes"),
      !isNew && onDelete && e("button", {
        onClick: function() { if (confirm("Delete this item?")) { onDelete(f.id); onClose(); } },
        style: { padding: "11px 16px", background: "transparent", color: "#ae6f8a", border: "1.5px solid #fad2e3", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }
      }, "Delete"),
      e("button", {
        onClick: onClose,
        style: { padding: "11px 16px", background: "transparent", color: "#8ba7b3", border: "1.5px solid #e6ecef", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }
      }, "Cancel")
    )
  );
}
