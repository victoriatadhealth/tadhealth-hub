// ═══════════════════════════════════════════════════════════════════════════
// hooks/useConferences.js — Events/conferences CRUD + default SEED data.
//
// On first load, if Supabase returns an empty table, SEED data is inserted.
// Local state is updated optimistically on save/delete for snappy UX.
// Depends on: helpers.js (confToDb, confFromDb), Supabase client (sb)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Seed data ────────────────────────────────────────────────────────────────
// Default BizDev conferences used when the database is empty.
var SEED = [
  // ── At-Large ────────────────────────────────────────────────────────────
  {id:"al-1",name:"ACSA – Every Child Counts",type:"at-large",region:null,dates:"Jan 12–14, 2026",location:"Marriott Marquis San Diego Marina",cost:950,sponsorshipCost:4000,status:"Not Attending",bdPriority:"1",teamMembers:"Jen, Matt, Victoria, Brian, Scott",involvement:"Exhibitor",audience:["Counselors","Principals"],notes:"500+ attendees",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"al-2",name:"ACSA – Superintendents Symposium",type:"at-large",region:null,dates:"Jan 28–30, 2026",location:"Indian Wells, CA | Renaissance Esmeralda",cost:17346,sponsorshipCost:6000,status:"Attending",bdPriority:"4.5",teamMembers:"Jen, Matt, Victoria, Brian, Ron, Scott",involvement:"Sponsor / Exhibitor",audience:["Superintendents"],notes:"Complimentary passes for Matt, Victoria, Brian. Ron & Scott $1,200 each.",leadsGenerated:0,dealsWon:0,revenue:0,attended:true},
  {id:"al-3",name:"OC Counselor Symposium",type:"at-large",region:null,dates:"Feb 4, 2026",location:"Orange County, CA",cost:4689,sponsorshipCost:3000,status:"Attending",bdPriority:"—",teamMembers:"Jordan, Jen, Matt, Victoria, Brian, Ron, Scott",involvement:"Sponsor / Exhibitor",audience:["Counselors"],notes:"Victoria & Brian complimentary. Gold Sponsor $3,000.",leadsGenerated:0,dealsWon:0,revenue:0,attended:true},
  {id:"al-4",name:"ERDI Winter Institute",type:"at-large",region:null,dates:"Jan 25–30, 2026",location:"Tucson, AZ",cost:0,sponsorshipCost:0,status:"Considering",bdPriority:"2",teamMembers:"Jen, Matt",involvement:"General Attendance",audience:["Superintendents","Principals"],notes:"",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"al-5",name:"Napa Valley Wellness Conference",type:"at-large",region:null,dates:"March 5–6, 2026",location:"Napa Valley, CA",cost:475,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"",involvement:"Sponsor",audience:["Counselors","Principals"],notes:"Gold Sponsor (2 tickets).",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"al-6",name:"SXSW EDU",type:"at-large",region:null,dates:"March 9–12, 2026",location:"Austin, TX",cost:795,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"Jen, Matt, Victoria, Brian, Scott",involvement:"General Attendance",audience:["Teachers","Principals"],notes:"",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"al-7",name:"Cali School-Based Health Alliance",type:"at-large",region:null,dates:"April 27–28, 2026",location:"Hilton Los Angeles/Universal City",cost:150,sponsorshipCost:0,status:"Considering",bdPriority:"3",teamMembers:"Jen, Matt, Victoria, Brian, Scott",involvement:"Presenter & Exhibitor",audience:["Counselors","Principals"],notes:"Proposal Due Nov 30",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"al-8",name:"NCSFEC",type:"at-large",region:null,dates:"May 27–29, 2026",location:"Long Beach, CA",cost:795,sponsorshipCost:0,status:"Considering",bdPriority:"5",teamMembers:"Jen, Matt, Victoria, Brian, Scott",involvement:"Exhibitor",audience:["Counselors","School Board Members"],notes:"",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"al-9",name:"Cali MTSS Institute",type:"at-large",region:null,dates:"Jul 14–16, 2026",location:"TBA",cost:11797,sponsorshipCost:10000,status:"Attending",bdPriority:"4",teamMembers:"Jen, Matt, Victoria, Brian, AE-Sales, Ron, Scott",involvement:"Sponsor / Exhibitor",audience:["Counselors","Principals","Superintendents"],notes:"Gold Sponsor $10,000.",leadsGenerated:0,dealsWon:0,revenue:0,attended:true},
  {id:"al-10",name:"ERDI (San Diego)",type:"at-large",region:null,dates:"Jul 12–17, 2026",location:"San Diego, CA",cost:14000,sponsorshipCost:0,status:"Attending",bdPriority:"2",teamMembers:"Brian, Scott, Ben, Matt, Jen, Alex",involvement:"Attendance Package",audience:["Superintendents"],notes:"$14,000 attendance package covers all team.",leadsGenerated:0,dealsWon:0,revenue:0,attended:true},
  {id:"al-11",name:"Wellness Together",type:"at-large",region:null,dates:"Late Sept/Oct 2026",location:"TBA",cost:3289,sponsorshipCost:2995,status:"Attending",bdPriority:"1.5",teamMembers:"Jen, Matt, Victoria, Brian, Ron, Scott",involvement:"Sponsor / Exhibitor",audience:["Counselors","Principals"],notes:"Gold Sponsor $2,995.",leadsGenerated:0,dealsWon:0,revenue:0,attended:true},
  {id:"al-12",name:"CASC",type:"at-large",region:null,dates:"TBA 2026",location:"TBA",cost:6196,sponsorshipCost:3000,status:"Attending",bdPriority:"—",teamMembers:"Jen, Matt, Victoria, Brian, Ron, Scott",involvement:"Sponsor / Exhibitor",audience:["Counselors"],notes:"Exhibitor/Gold Sponsor $3,000.",leadsGenerated:0,dealsWon:0,revenue:0,attended:true},
  {id:"al-13",name:"CSBA (CSBAAEC)",type:"at-large",region:null,dates:"December 2026",location:"TBA",cost:13044,sponsorshipCost:6000,status:"Attending",bdPriority:"—",teamMembers:"Jen, Matt, Victoria, Brian, Ron, Scott",involvement:"Sponsor / Exhibitor",audience:["School Board Members","Superintendents"],notes:"Exhibitor/Gold Sponsor $6,000.",leadsGenerated:0,dealsWon:0,revenue:0,attended:true},
  {id:"al-14",name:"National Conference on Education (AASA)",type:"at-large",region:null,dates:"Feb 12–14, 2026",location:"Nashville, TN",cost:1345,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"Jen, Matt, Victoria, Brian, Scott",involvement:"General Attendance",audience:["Superintendents","School Board Members"],notes:"",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"al-15",name:"CALSA Cada Semilla Cuenta",type:"at-large",region:null,dates:"TBA 2026",location:"TBA",cost:0,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"Marcella, Pia, Victoria",involvement:"Presenter",audience:["Superintendents","Principals"],notes:"Submitted a proposal.",leadsGenerated:0,dealsWon:0,revenue:0},

  // ── SoCal Regional ────────────────────────────────────────────────────────
  {id:"sc-1",name:"ACSA Every Child Counts Symposium",type:"regional",region:"SoCal",dates:"Jan 12–14, 2026",location:"San Diego, CA",cost:950,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"Ron, Gabriella",involvement:"Exhibitor",audience:["Counselors","Principals","Superintendents"],notes:"Strong CYBHI crossover.",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"sc-2",name:"ACSA Equity Institute",type:"regional",region:"SoCal",dates:"Mar 25–27, 2026",location:"Anaheim, CA",cost:0,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"Ron, Gabriella",involvement:"General Attendance",audience:["Principals","Counselors"],notes:"Equity, inclusion focus.",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"sc-3",name:"ACSA Women in School Leadership Forum",type:"regional",region:"SoCal",dates:"May 13–15, 2026",location:"Anaheim, CA",cost:0,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"Gabriella",involvement:"General Attendance",audience:["Superintendents","Principals"],notes:"",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"sc-4",name:"ACSA Region 18 Awards Dinner",type:"regional",region:"SoCal",dates:"Apr 25, 2026",location:"Sheraton San Diego Hotel",cost:500,sponsorshipCost:5000,status:"Considering",bdPriority:"—",teamMembers:"Ron, Gabriella",involvement:"Sponsor",audience:["School Board Members","Superintendents"],notes:"~500 attendees.",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"sc-5",name:"ACSA Leadership Summit 2026",type:"regional",region:"SoCal",dates:"Nov 4–7, 2026",location:"Gaylord Pacific Resort, Chula Vista",cost:1075,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"Ron, Gabriella",involvement:"Exhibitor",audience:["Superintendents","School Board Members","Principals"],notes:"ACSA flagship.",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"sc-6",name:"ACSA Personnel Institute",type:"regional",region:"SoCal",dates:"Sept 16–18, 2026",location:"Irvine, CA",cost:0,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"Ron, Gabriella",involvement:"General Attendance",audience:["Principals"],notes:"HR/personnel law focus.",leadsGenerated:0,dealsWon:0,revenue:0},

  // ── NorCal Regional ───────────────────────────────────────────────────────
  {id:"nc-1",name:"Small School District Association Annual Conference",type:"regional",region:"NorCal",dates:"Mar 7–10, 2026",location:"Sacramento, CA",cost:3000,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"Megan",involvement:"Exhibitor",audience:["Superintendents","Principals"],notes:"Must be member to attend.",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"nc-2",name:"2026 CSDC Conference",type:"regional",region:"NorCal",dates:"Nov 16–18, 2026",location:"Sacramento, CA",cost:0,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"Megan",involvement:"Presenter",audience:["Principals","Superintendents"],notes:"Charter partner could present.",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"nc-3",name:"ACSA North State Conference",type:"regional",region:"NorCal",dates:"May 8–10, 2026",location:"Peppermill Resort, Reno NV",cost:499,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"Megan",involvement:"Exhibitor",audience:["Principals","Superintendents"],notes:"",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"nc-4",name:"ACSA Region 2 AOY Gala",type:"regional",region:"NorCal",dates:"Mar 13, 2026",location:"Lincoln Hills, CA",cost:0,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"Megan",involvement:"General Attendance",audience:["Superintendents","Principals"],notes:"Region 2 covers 11 NorCal counties.",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"nc-5",name:"CSBA Annual Education Conference",type:"regional",region:"NorCal",dates:"December 2026",location:"San Francisco/Sacramento area",cost:0,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"Megan",involvement:"Exhibitor",audience:["School Board Members","Superintendents"],notes:"100+ sessions.",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"nc-6",name:"CISC Spring Conference",type:"regional",region:"NorCal",dates:"Spring 2026",location:"Monterey, CA",cost:0,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"Megan",involvement:"General Attendance",audience:["Superintendents"],notes:"",leadsGenerated:0,dealsWon:0,revenue:0},

  // ── Central Cal Regional ──────────────────────────────────────────────────
  {id:"cc-1",name:"ACSA Mid-State Conference",type:"regional",region:"CentralCal",dates:"Mar 13–15, 2026",location:"Embassy Suites, San Luis Obispo",cost:380,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"",involvement:"Exhibitor",audience:["Principals","Superintendents"],notes:"",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"cc-2",name:"Central Valley Regional School Health Coalition",type:"regional",region:"CentralCal",dates:"Mar 6, 2026",location:"Fresno, CA",cost:0,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"",involvement:"General Attendance",audience:["Counselors"],notes:"Free half-day.",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"cc-3",name:"ACSA Region 7 Spring Conference",type:"regional",region:"CentralCal",dates:"May 1–3, 2026",location:"Margaritaville Resort, South Lake Tahoe",cost:0,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"",involvement:"Exhibitor",audience:["Principals","Superintendents"],notes:"",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"cc-4",name:"Tulare County COE School Counselor Conference",type:"regional",region:"CentralCal",dates:"Jan 2026",location:"Visalia, CA",cost:75,sponsorshipCost:0,status:"Not Attending",bdPriority:"—",teamMembers:"",involvement:"General Attendance",audience:["Counselors"],notes:"870:1 student-counselor ratio.",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"cc-5",name:"ACSA Legislative Action Days",type:"regional",region:"CentralCal",dates:"Apr 20–21, 2026",location:"Sacramento, CA",cost:0,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"",involvement:"General Attendance",audience:["Superintendents","School Board Members"],notes:"~250 leaders.",leadsGenerated:0,dealsWon:0,revenue:0},
  {id:"cc-6",name:"CSBA County Board Conference",type:"regional",region:"CentralCal",dates:"September 2026",location:"Monterey, CA",cost:0,sponsorshipCost:0,status:"Considering",bdPriority:"—",teamMembers:"",involvement:"Exhibitor",audience:["School Board Members","Superintendents"],notes:"",leadsGenerated:0,dealsWon:0,revenue:0}
];

// ─── Hook ─────────────────────────────────────────────────────────────────────
function useConferences() {
  // Initialise with SEED data so the UI is never empty on first render
  var seedData = SEED.map(function(c) { return Object.assign({}, c, { group: "bizdev" }); });
  var cs = useState(seedData);  var conferences = cs[0]; var setConferences = cs[1];
  var ls = useState(false);     var loading     = ls[0]; var setLoading     = ls[1];

  function fetch() {
    return sb.from("conferences")
      .select("*")
      .order("created_at", { ascending: true })
      .then(function(r) {
        if (!r.error && r.data && r.data.length > 0) {
          setConferences(r.data.map(confFromDb));
        } else if (!r.error && r.data && r.data.length === 0) {
          // Supabase table is empty — push SEED up so future sessions load fast
          var rows = SEED.map(function(c) { return confToDb(Object.assign({}, c, { group: "bizdev" })); });
          sb.from("conferences").insert(rows);
        }
      });
  }

  useEffect(function() {
    fetch();
    var ch = sb.channel("conf-ch")
      .on("postgres_changes", { event: "*", schema: "public", table: "conferences" }, fetch)
      .subscribe();
    return function() { sb.removeChannel(ch); };
  }, []);

  function saveConf(c) {
    // Optimistic local update
    setConferences(function(prev) {
      var exists = prev.find(function(x) { return x.id === c.id; });
      if (exists) return prev.map(function(x) { return x.id === c.id ? c : x; });
      return prev.concat([c]);
    });
    return sb.from("conferences")
      .upsert(confToDb(c), { onConflict: "id" })
      .then(function(r) { if (r.error) console.error("saveConf error:", r.error); });
  }

  function removeConf(id) {
    setConferences(function(prev) { return prev.filter(function(x) { return x.id !== id; }); });
    return sb.from("conferences").delete().eq("id", id);
  }

  return { conferences: conferences, loading: loading, saveConf: saveConf, removeConf: removeConf };
}
