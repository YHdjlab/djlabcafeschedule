const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
function dateStr(d) { return d.toISOString().slice(0,10); }
function fmt(h) { if (h < 12) return h + " AM"; if (h === 12) return "12 PM"; return (h-12) + " PM"; }

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

// Realistic schedules based on uni constraints:
// JP (admin/supervisor): available all week 10am-midnight
// Miled (supervisor_bar): available all week 10am-midnight, Wed lighter 3pm-midnight
// Cleo (floor, MWF uni): MWF available 2pm-midnight, TTh available 8am-midnight, weekends 10am-midnight
// Rouba (floor, TTh uni): TTh available 2pm-midnight, MWF available 8am-midnight, weekends 10am-midnight
// Lucciana (bar, weekday student): weekdays 4pm-midnight, weekends 8am-midnight
// Cynthia (bar, MWF uni): MWF available 2pm-midnight, TTh available 8am-midnight, weekends 10am-midnight

const staffSchedules = [
  { email: "hoyekjp@gmail.com",           schedule: { 0:[10,23], 1:[10,23], 2:[10,23], 3:[10,23], 4:[10,23], 5:[10,23], 6:[10,23] } },
  { email: "miladaali995@gmail.com",       schedule: { 0:[10,23], 1:[10,23], 2:[15,23], 3:[10,23], 4:[10,23], 5:[10,23], 6:[10,23] } },
  { email: "cloyounan@gmail.com",          schedule: { 0:[14,23], 1:[8,23],  2:[14,23], 3:[8,23],  4:[14,23], 5:[10,23], 6:[10,23] } },
  { email: "roubakazzaz@gmail.com",        schedule: { 0:[8,23],  1:[14,23], 2:[8,23],  3:[14,23], 4:[8,23],  5:[10,23], 6:[10,23] } },
  { email: "ndflucy@gmail.com",            schedule: { 0:[16,23], 1:[16,23], 2:[16,23], 3:[16,23], 4:[16,23], 5:[8,23],  6:[8,23]  } },
  { email: "cynthiaboughanem1@gmail.com",  schedule: { 0:[14,23], 1:[8,23],  2:[14,23], 3:[8,23],  4:[14,23], 5:[10,23], 6:[10,23] } },
];

const weekStart = new Date("2026-04-27T00:00:00");
const weekStartStr = "2026-04-27";

async function seed() {
  const { data: profiles } = await supabase.from("profiles").select("id,email,full_name");

  let total = 0;
  for (const s of staffSchedules) {
    const profile = profiles.find(p => p.email.toLowerCase() === s.email.toLowerCase());
    if (!profile) { console.log("Not found:", s.email); continue; }

    const rows = [];
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const date = addDays(weekStart, dayIdx);
      const ds = dateStr(date);
      const [startH, endH] = s.schedule[dayIdx];
      for (let h = startH; h <= endH; h++) {
        rows.push({
          week_starting: weekStartStr,
          staff_id: profile.id,
          slot_key: ds + "_h" + h,
          slot_label: DAYS[dayIdx] + " " + fmt(h),
          slot_date: ds,
          available: true,
        });
      }
    }
    const { error } = await supabase.from("availability").upsert(rows, { onConflict: "week_starting,staff_id,slot_key" });
    if (error) console.log("ERROR", s.email, error.message);
    else { total += rows.length; console.log("Seeded", profile.full_name, rows.length, "slots"); }
  }
  console.log("\nTotal:", total, "availability slots seeded for week 2026-04-27");
  console.log("Now go to Admin -> Schedule Builder -> Auto-Generate!");
}
seed();
