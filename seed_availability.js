const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Get next monday
function getNextMonday() {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 1 ? 7 : (8 - day) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0,0,0,0);
  return monday;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function dateStr(date) {
  return date.toISOString().slice(0, 10);
}

// DAY INDEX: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
// UNI SCHEDULE TYPES:
// MWF = Mon/Wed/Fri uni (8am-2pm), available Tue/Thu/Sat/Sun all day + MWF afternoons
// TTH = Tue/Thu uni (8am-2pm), available Mon/Wed/Fri/Sat/Sun all day + TTH afternoons
// WEEKEND_FREE = uni Mon-Fri 8am-3pm, only available evenings weekdays + full weekends
// FULL_TIME = no uni, available everything except one day off

const DAYS_OF_WEEK = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function formatHour(h) {
  if (h < 12) return h + ' AM';
  if (h === 12) return '12 PM';
  return (h - 12) + ' PM';
}

// Staff schedules: email, uni_type, day_off (day they prefer off)
const staffSchedules = [
  { email: "hoyekjp@gmail.com",           type: "supervisor",    unavailable: [] },           // JP - supervisor, always available
  { email: "miladaali995@gmail.com",       type: "supervisor",    unavailable: [] },           // Miled - supervisor
  { email: "cloyounan@gmail.com",          type: "MWF",           unavailable: [0, 2, 4] },   // Cleo - MWF uni morning
  { email: "roubakazzaz@gmail.com",        type: "TTH",           unavailable: [1, 3] },      // Rouba - TTH uni morning
  { email: "ndflucy@gmail.com",            type: "WEEKEND_FREE",  unavailable: [] },           // Lucciana - weekday student
  { email: "cynthiaboughanem1@gmail.com",  type: "MWF",           unavailable: [0, 2, 4] },   // Cynthia - MWF uni morning
];

// Available hours per type per day
function getAvailableHours(type, dayIndex) {
  const isWeekend = dayIndex >= 5;

  if (type === "supervisor") {
    // Supervisors available most hours, one random day lighter
    if (dayIndex === 2) return [15,16,17,18,19,20,21,22,23]; // Wed lighter
    return [10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  }

  if (type === "MWF") {
    // Mon/Wed/Fri: uni 8am-2pm, available from 2pm onwards
    if (dayIndex === 0 || dayIndex === 2 || dayIndex === 4) {
      return [14,15,16,17,18,19,20,21,22,23];
    }
    // Tue/Thu: full day available
    if (dayIndex === 1 || dayIndex === 3) {
      return [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
    }
    // Weekend: available but shorter
    if (isWeekend) return [10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  }

  if (type === "TTH") {
    // Tue/Thu: uni 8am-2pm, available from 2pm onwards
    if (dayIndex === 1 || dayIndex === 3) {
      return [14,15,16,17,18,19,20,21,22,23];
    }
    // Mon/Wed/Fri: full day
    if (dayIndex === 0 || dayIndex === 2 || dayIndex === 4) {
      return [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
    }
    // Weekend: full
    if (isWeekend) return [10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  }

  if (type === "WEEKEND_FREE") {
    // Weekdays: only evenings after 4pm (student)
    if (!isWeekend) return [16,17,18,19,20,21,22,23];
    // Weekend: full availability
    return [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  }

  return [];
}

async function seedAvailability() {
  const weekStart = getNextMonday();
  const weekStartStr = dateStr(weekStart);

  // Get all user IDs
  const { data: profiles } = await supabase.from("profiles").select("id, email, full_name");
  console.log("Found profiles:", profiles?.map(p => p.email));

  let totalInserted = 0;

  for (const staffDef of staffSchedules) {
    const profile = profiles?.find(p => p.email.toLowerCase() === staffDef.email.toLowerCase());
    if (!profile) { console.log("Profile not found for: " + staffDef.email); continue; }

    const rows = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const date = addDays(weekStart, dayIndex);
      const dateString = dateStr(date);
      const availHours = getAvailableHours(staffDef.type, dayIndex);

      for (const hour of availHours) {
        const slotKey = dateString + "_h" + hour;
        rows.push({
          week_starting: weekStartStr,
          staff_id: profile.id,
          slot_key: slotKey,
          slot_label: DAYS_OF_WEEK[dayIndex] + " " + formatHour(hour),
          slot_date: dateString,
          available: true,

        });
      }
    }

    const { error } = await supabase.from("availability").upsert(rows, { onConflict: "week_starting,staff_id,slot_key" });
    if (error) console.log("ERROR for " + staffDef.email + ": " + error.message);
    else {
      totalInserted += rows.length;
      console.log("Seeded " + rows.length + " slots for " + profile.full_name + " (" + staffDef.type + ")");
    }
  }

  console.log("\nTotal slots inserted: " + totalInserted);
  console.log("Week: " + weekStartStr);
  console.log("Done! Go to Admin -> Schedule Builder to generate the schedule.");
}

seedAvailability();
