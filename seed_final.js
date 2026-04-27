const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DATES = ["2026-04-27","2026-04-28","2026-04-29","2026-04-30","2026-05-01","2026-05-02","2026-05-03"];
const DAYS  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const weekStartStr = "2026-04-27";

function fmt(h) { if (h < 12) return h+" AM"; if (h===12) return "12 PM"; return (h-12)+" PM"; }

// day index 0=Mon 1=Tue 2=Wed 3=Thu 4=Fri 5=Sat 6=Sun
const realAvailability = {
  "cynthiaboughanem1@gmail.com": {
    0: [16,24], 1: [16,24], 2: [16,24], 3: null,    4: [8,16],  5: [8,16],  6: [8,16],
  },
  "ndflucy@gmail.com": {
    0: [17,22], 1: [19,24], 2: [18,22], 3: [18,23], 4: [16,20], 5: [10,14], 6: [8,13],
  },
  "roubakazzaz@gmail.com": {
    0: [20,24], 1: [8,16],  2: [8,16],  3: [20,24], 4: [20,24], 5: [8,16],  6: [8,16],
  },
  "cloyounan@gmail.com": {
    0: [18,24], 1: [18,24], 2: [8,13],  3: null,    4: [19,24], 5: [18,24], 6: [8,13],
  },
  "miladaali995@gmail.com": {
    0: [8,18],  1: [8,18],  2: [8,18],  3: [8,18],  4: [8,18],  5: [8,18],  6: [8,18],
  },
  "hoyekjp@gmail.com": {
    0: [18,24], 1: [18,24], 2: [18,24], 3: [18,24], 4: [18,24], 5: [18,24], 6: [18,24],
  },
};

async function seed() {
  await supabase.from("availability").delete().neq("id","00000000-0000-0000-0000-000000000000");
  console.log("Cleared");

  const { data: profiles } = await supabase.from("profiles").select("id,email,full_name");
  let total = 0;

  for (const [email, schedule] of Object.entries(realAvailability)) {
    const profile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (!profile) { console.log("Not found:", email); continue; }

    const rows = [];
    for (let d = 0; d < 7; d++) {
      const range = schedule[d];
      if (!range) { console.log(" ", profile.full_name, DAYS[d], "OFF"); continue; }
      const dateStr = DATES[d];  // use fixed date array - no calculation
      const [startH, endH] = range;
      for (let h = startH; h < endH; h++) {
        rows.push({
          week_starting: weekStartStr,
          staff_id: profile.id,
          slot_key: dateStr + "_h" + h,
          slot_label: DAYS[d] + " " + fmt(h),
          slot_date: dateStr,
          available: true,
        });
      }
    }

    const { error } = await supabase.from("availability").upsert(rows, { onConflict: "week_starting,staff_id,slot_key" });
    if (error) console.log("ERROR", email, error.message);
    else { total += rows.length; console.log("Seeded", profile.full_name+":", rows.length, "slots"); }
  }
  console.log("\nTotal:", total, "slots");
}
seed();
