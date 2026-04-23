const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
function dateStr(d) { return d.toISOString().slice(0,10); }
function formatHour(h) { if (h < 12) return h + ' AM'; if (h === 12) return '12 PM'; return (h-12) + ' PM'; }
const DAYS_OF_WEEK = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function getAvailableHours(type, dayIndex) {
  const isWeekend = dayIndex >= 5;
  if (type === "supervisor") {
    if (dayIndex === 2) return [15,16,17,18,19,20,21,22,23];
    return [10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  }
  if (type === "MWF") {
    if (dayIndex === 0 || dayIndex === 2 || dayIndex === 4) return [14,15,16,17,18,19,20,21,22,23];
    if (dayIndex === 1 || dayIndex === 3) return [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
    if (isWeekend) return [10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  }
  if (type === "TTH") {
    if (dayIndex === 1 || dayIndex === 3) return [14,15,16,17,18,19,20,21,22,23];
    if (dayIndex === 0 || dayIndex === 2 || dayIndex === 4) return [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
    if (isWeekend) return [10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  }
  if (type === "WEEKEND_FREE") {
    if (!isWeekend) return [16,17,18,19,20,21,22,23];
    return [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  }
  return [];
}

const staffSchedules = [
  { email: "hoyekjp@gmail.com",           type: "supervisor"   },
  { email: "miladaali995@gmail.com",       type: "supervisor"   },
  { email: "cloyounan@gmail.com",          type: "MWF"          },
  { email: "roubakazzaz@gmail.com",        type: "TTH"          },
  { email: "ndflucy@gmail.com",            type: "WEEKEND_FREE" },
  { email: "cynthiaboughanem1@gmail.com",  type: "MWF"          },
];

async function seed() {
  // Wipe all availability
  await supabase.from("availability").delete().neq("id","00000000-0000-0000-0000-000000000000");
  console.log("Cleared all availability");

  // Seed BOTH current week (Apr 21) and next week (Apr 27)
  const weeks = ["2026-04-21", "2026-04-27"];
  const { data: profiles } = await supabase.from("profiles").select("id,email,full_name");
  let total = 0;

  for (const weekStartStr of weeks) {
    const weekStart = new Date(weekStartStr + "T00:00:00");
    console.log("\nSeeding week:", weekStartStr);
    for (const s of staffSchedules) {
      const profile = profiles?.find(p => p.email.toLowerCase() === s.email.toLowerCase());
      if (!profile) { console.log("Not found: " + s.email); continue; }
      const rows = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = addDays(weekStart, dayIndex);
        const ds = dateStr(date);
        for (const hour of getAvailableHours(s.type, dayIndex)) {
          rows.push({
            week_starting: weekStartStr, staff_id: profile.id,
            slot_key: ds + "_h" + hour,
            slot_label: DAYS_OF_WEEK[dayIndex] + " " + formatHour(hour),
            slot_date: ds, available: true,
          });
        }
      }
      const { error } = await supabase.from("availability").upsert(rows, { onConflict: "week_starting,staff_id,slot_key" });
      if (error) console.log("ERROR " + s.email + ": " + error.message);
      else { total += rows.length; console.log("  " + profile.full_name + ": " + rows.length + " slots"); }
    }
  }
  console.log("\nTotal slots: " + total);
}
seed();
