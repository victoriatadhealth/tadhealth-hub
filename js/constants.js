// ═══════════════════════════════════════════════════════════════════════════
// constants.js — Brand colors, status options, tab definitions, and all other
//               shared constants used across multiple pages/components.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Brand color palettes ─────────────────────────────────────────────────────
// C  = BizDev / default palette (ocean blue)
// UR = User-Rev palette (pink / rose)
var C = {
  ocean:     "#023F5A",
  oceanDark: "#011a26",
  cyan:      "#4ACDC4",
  cyanLight: "#edfaf9",
  pink:      "#f59dc3",
  orange:    "#f79824",
  overcast:  "#F5F5F5",
  white:     "#FFFFFF",
  gray:      "#8ba7b3",
  grayLight: "#e6ecef"
};

var UR = {
  primary:      "#ae6f8a",
  primaryDark:  "#023F5A",
  accent:       "#f59dc3",
  accentLight:  "#fef5f9",
  teal:         "#4ACDC4",
  tealLight:    "#edfaf9",
  orange:       "#f79824",
  overcast:     "#fef5f9",
  white:        "#FFFFFF",
  gray:         "#8ba7b3",
  grayLight:    "#fad2e3"
};

// ─── Audience scoring (used for conference tier calculations) ─────────────────
var AUDIENCE_SCORES = {
  "Teachers":            1,
  "Principals":          2,
  "Counselors":          3,
  "School Board Members":4,
  "Superintendents":     5
};

// ─── Status options ───────────────────────────────────────────────────────────
var STATUS_OPTIONS  = ["Attending","Considering","Not Attending","Submitted","Completed"];
var AUDIENCE_OPTIONS= ["Teachers","Principals","Counselors","School Board Members","Superintendents"];

// ─── Nav tabs ─────────────────────────────────────────────────────────────────
var BIZDEV_TABS = [
  {id:"all",         label:"All Events"},
  {id:"at-large",    label:"At-Large"},
  {id:"socal",       label:"SoCal"},
  {id:"norcal",      label:"NorCal"},
  {id:"centralcal",  label:"CenCal"},
  {id:"webinars",    label:"Webinars"},
  {id:"analytics",   label:"Event Analytics & ROI"}
];

var USERREV_TABS = [
  {id:"case-study",  label:"Case Study Video Shoots"},
  {id:"cust-webinar",label:"Customer Webinars"},
  {id:"community",   label:"Community Engagement"},
  {id:"ur-analytics",label:"Event Analytics"}
];

// ─── Content calendar constants ───────────────────────────────────────────────
var CONTENT_TYPES = [
  {id:"blog",   label:"Blog",          color:"#023F5A", bg:"#e6f2f7"},
  {id:"email",  label:"Email",         color:"#4ACDC4", bg:"#edfaf9"},
  {id:"social", label:"Social",        color:"#f59dc3", bg:"#fef5f9"},
  {id:"video",  label:"YouTube Video", color:"#f79824", bg:"#fef5e9"}
];

var PLATFORMS = ["Instagram","LinkedIn","Facebook","X"];

var CAL_CHANNELS = ["Blog","Email","Social","YouTube","Web"];

var CONTENT_STATUS_OPTIONS = ["Draft","Scheduled","Published","Archived"];

var AUDIENCES = [
  {id:"superintendents", label:"Superintendents", color:"#023F5A"},
  {id:"principals",      label:"Principals",      color:"#4ACDC4"},
  {id:"counselors",      label:"Counselors",      color:"#f59dc3"},
  {id:"board-members",   label:"School Board",    color:"#f79824"},
  {id:"teachers",        label:"Teachers",        color:"#35928b"},
  {id:"all",             label:"All Audiences",   color:"#8ba7b3"}
];

// ─── Kanban columns ───────────────────────────────────────────────────────────
var KANBAN_STATUSES = [
  {id:"not-started", label:"Not Started", color:"#023F5A",              textColor:"#fff"},
  {id:"in-progress", label:"In Progress", color:"#4ACDC4",              textColor:"#023F5A"},
  {id:"in-review",   label:"In Review",   color:"#f59dc3",              textColor:"#fff"},
  {id:"blocked",     label:"Blocked",     color:"#f79824",              textColor:"#fff"},
  {id:"paused",      label:"Paused",      color:"rgba(247,152,36,0.38)",textColor:"#7a4800"},
  {id:"done",        label:"Done",        color:"#4ACDC4",              textColor:"#023F5A"}
];

// ─── Calendar helpers ─────────────────────────────────────────────────────────
var MONTHS     = ["January","February","March","April","May","June","July","August","September","October","November","December"];
var DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
