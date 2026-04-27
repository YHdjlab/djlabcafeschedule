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

// Real availability - hours are inclusive start to exclusive end
// null = day off
const realAvailability = {
  "cynthiaboughanem1@gmail.com": {
    // Mon off, Tue 16-24, Wed 16-24, Thu off, Fri 8-16, Sat 8-16, Sun 8-16
    0: null,        // Monday off
    1: [16, 24],    // Tuesday 4pm-12am
    2: [16, 24],    // Wednesday 4pm-12am
    3: null,        // Thursday off
    4: [8, 16],     // Friday 8am-4pm
    5: [8, 16],     // Saturday 8am-4pm
    6: [8, 16],     // Sunday 8am-4pm
  },
  "ndflucy@gmail.com": {
    // Mon 17-22, Tue 19-24, Wed 18-22, Thu 18-23, Fri 16-20, Sat 10-14, Sun 8-13
    0: [17, 22],    // Monday 5pm-10pm
    1: [19, 24],    // Tuesday 7pm-12am
    2: [18, 22],    // Wednesday 6pm-10pm
    3: [18, 23],    // Thursday 6pm-11pm
    4: [16, 20],    // Friday 4pm-8pm
    5: [10, 14],    // Saturday 10am-2pm
    6: [8, 13],     // Sunday 8am-1pm
  },
  "roubakazzaz@gmail.com": {
    // Mon 19:30-24, Tue 8-16, Wed 8-16, Thu 19:30-24, Fri 19:30-24, Sat 8-16, Sun 8-16
    // Rounding 7:30pm to 19 (7pm) for hour slots
    0: [20, 24],    // Monday 8pm-12am (7:30pm rounded)
    1: [8, 16],     // Tuesday 8am-4pm
    2: [8, 16],     // Wednesday 8am-4pm
    3: [20, 24],    // Thursday 8pm-12am
    4: [20, 24],    // Friday 8pm-12am
    5: [8, 16],     // Saturday 8am-4pm
    6: [8, 16],     // Sunday 8am-4pm
  },
  "cloyounan@gmail.com": {
    // Mon 18-24, Tue 18-24, Wed 8-13, Thu off, Fri 19-24, Sat 18-24, Sun 8-13
    0: [18, 24],    // Monday 6pm-12am
    1: [18, 24],    // Tuesday 6pm-12am
    2: [8, 13],     // Wednesday 8am-1pm
    3: null,        // Thursday off
    4: [19, 24],    // Friday 7pm-12am
    5: [18, 24],    // Saturday 6pm-12am
    6: [8, 13],     // Sunday 8am-1pm
  },
  "miladaali995@gmail.com": {
    // Every day 8am-6pm
    0: [8, 18], 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 18], 5: [8, 18], 6: [8, 18],
  },
  "hoyekjp@gmail.com": {
    // Every day 6pm-12am
    0: [18, 24], 1: [18, 24], 2: [18, 24], 3: [18, 24], 4: [18, 24], 5: [18, 24], 6: [18, 24],
  },
};

const weekStart = new Date("2026-04-27T00:00:00");
const weekStartStr = "2026-04-27";

async function seed() {
  const { data: profiles } = await supabase.from("profiles").select("id,email,full_name");
  let total = 0;

  for (const [email, schedule] of Object.entries(realAvailability)) {
    const profile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (!profile) { console.log("Not found:", email); continue; }

    const rows = [];
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const range = schedule[dayIdx];
      if (!range) continue; // day off
      const date = addDays(weekStart, dayIdx);
      const ds = dateStr(date);
      const [startH, endH] = range;
      for (let h = startH; h < endH; h++) {
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
    if (error) console.log("ERROR", email, error.message);
    else { total += rows.length; console.log("Seeded", profile.full_name + ":", rows.length, "slots"); }
  }

  console.log("\nTotal:", total, "slots seeded for week 2026-04-27");
  console.log("Go to Admin -> Schedule Builder -> Auto-Generate!");
}
seed();
