// ═══════════════════════════════════════════════════════════════════════════
// helpers.js — Supabase DB serialization / deserialization helpers.
//
// Each pair of functions converts between the in-app JS object shape and
// the flat DB column shape so both layers stay clean.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Tasks ────────────────────────────────────────────────────────────────────
function taskToDb(t) {
  return {
    id:           t.id,
    name:         t.name,
    status:       t.status,
    owner:        t.owner        || null,
    deadline:     t.deadline     || null,
    project:      t.project      || null,
    description:  t.description  || null,
    requested_by: t.requestedBy  || t.requested_by || null,
    email:        t.email        || null,
    department:   t.department   || null,
    type:         t.type         || null,
    priority:     t.priority     || null,
    from_form:    t.fromForm     || t.from_form    || false
  };
}

// ─── Conferences / Events ─────────────────────────────────────────────────────
function confToDb(c) {
  return {
    id:               c.id,
    name:             c.name,
    type:             c.type             || null,
    group_name:       c.group            || "bizdev",
    region:           c.region           || null,
    ur_type:          c.urType           || null,
    dates:            c.dates            || null,
    location:         c.location         || null,
    cost:             c.cost             || 0,
    sponsorship_cost: c.sponsorshipCost  || 0,
    status:           c.status           || "Considering",
    bd_priority:      c.bdPriority       || null,
    team_members:     c.teamMembers      || null,
    involvement:      c.involvement      || null,
    audience:         c.audience         || [],
    notes:            c.notes            || null,
    deadline:         c.deadline         || null,
    leads_generated:  c.leadsGenerated   || 0,
    mqls:             c.mqls             || 0,
    deals_won:        c.dealsWon         || 0,
    revenue:          c.revenue          || 0,
    attended:         c.attended != null ? c.attended : null,
    debrief:          c.debrief          || null,
    travel_bookings:  c.travelBookings   || null,
    resource_link:    c.resourceLink     || null,
    contacts:         c.contacts         || null,
    updated_at:       new Date().toISOString()
  };
}

function confFromDb(r) {
  return {
    id:              r.id,
    name:            r.name,
    type:            r.type,
    group:           r.group_name,
    region:          r.region,
    urType:          r.ur_type,
    dates:           r.dates,
    location:        r.location,
    cost:            r.cost             || 0,
    sponsorshipCost: r.sponsorship_cost || 0,
    status:          r.status,
    bdPriority:      r.bd_priority,
    teamMembers:     r.team_members,
    involvement:     r.involvement,
    audience:        r.audience         || [],
    notes:           r.notes,
    deadline:        r.deadline,
    leadsGenerated:  r.leads_generated  || 0,
    mqls:            r.mqls             || 0,
    dealsWon:        r.deals_won        || 0,
    revenue:         r.revenue          || 0,
    attended:        r.attended,
    debrief:         r.debrief,
    travelBookings:  r.travel_bookings,
    resourceLink:    r.resource_link,
    contacts:        r.contacts
  };
}

// ─── Content items ────────────────────────────────────────────────────────────
function contentToDb(i) {
  return {
    id:             i.id,
    title:          i.title,
    type:           i.type          || null,
    status:         i.status        || "Draft",
    channel:        i.channel       || null,
    platforms:      i.platforms     || [],
    campaign:       i.campaign      || null,
    campaign_start: i.campaignStart || null,
    campaign_end:   i.campaignEnd   || null,
    audience:       i.audience      || [],
    date:           i.date          || null,
    notes:          i.notes         || null,
    updated_at:     new Date().toISOString()
  };
}

function contentFromDb(r) {
  return {
    id:            r.id,
    title:         r.title,
    type:          r.type,
    status:        r.status,
    channel:       r.channel,
    platforms:     r.platforms     || [],
    campaign:      r.campaign,
    campaignStart: r.campaign_start,
    campaignEnd:   r.campaign_end,
    audience:      r.audience      || [],
    date:          r.date,
    notes:         r.notes
  };
}
