const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function getNextMonday() {
  const today = new Date();
  const day = today.getDay(); // 0=Sun, 1=Mon...
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() + daysUntilMonday);
  monday.setHours(0,0,0,0);
  return monday;
}

function addDays(date, days) {
  const d = new Date(date); d.setDate(d.getDate() + days); return d;
}
function dateStr(d) { return d.toISOString().slice(0,10); }
function formatHour(h) {
  if (h < 12) return h + ' AM'; if (h === 12) return '12 PM'; return (h-12) + ' PM';
}

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
  { email: "hoyekjp@gmail.com",           type: "supervisor" },
  { email: "miladaali995@gmail.com",       type: "supervisor" },
  { email: "cloyounan@gmail.com",          type: "MWF"        },
  { email: "roubakazzaz@gmail.com",        type: "TTH"        },
  { email: "ndflucy@gmail.com",            type: "WEEKEND_FREE"},
  { email: "cynthiaboughanem1@gmail.com",  type: "MWF"        },
];

async function seed() {
  // Clear old wrong-week data
  await supabase.from("availability").delete().neq("id","00000000-0000-0000-0000-000000000000");
  console.log("Cleared old data");

  const weekStart = new Date('2026-04-27T00:00:00');
  const weekStartStr = dateStr(weekStart);
  console.log("Seeding week:", weekStartStr);

  const { data: profiles } = await supabase.from("profiles").select("id,email,full_name");
  let total = 0;

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
    else { total += rows.length; console.log("Seeded " + rows.length + " slots for " + profile.full_name); }
  }
  console.log("\nTotal: " + total + " slots for week " + weekStartStr);
}
seed();
