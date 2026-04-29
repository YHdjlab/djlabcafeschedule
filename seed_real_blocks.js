const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Week May 4-10, 2026
const DATES = ["2026-05-04","2026-05-05","2026-05-06","2026-05-07","2026-05-08","2026-05-09","2026-05-10"];
const DAYS  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const HOURS = Array.from({length:16}, (_,i) => i+8); // 8am-11pm
const weekStartStr = "2026-05-04";

function fmtH(h) { if(h<12) return h+" AM"; if(h===12) return "12 PM"; return (h-12)+" PM"; }

// blocked[dayIndex] = array of hours that are BLOCKED (cannot work)
// Everything not blocked = available
const staffBlocks = {
  "cloyounan@gmail.com": {
    // Mon: 8am-7:30pm blocked -> block 8-19 (8,9,...,19)
    0: range(8,20),
    // Tue: free
    1: [],
    // Wed: free
    2: [],
    // Thu: 8am-4pm blocked -> block 8-15
    3: range(8,16),
    // Fri: 8am-7:30pm blocked -> block 8-19
    4: range(8,20),
    // Sat: 8am-7:30pm blocked -> block 8-19
    5: range(8,20),
    // Sun: free
    6: [],
  },
  "roubakazzaz@gmail.com": {
    // Mon: available 8-11 -> block 11-23
    0: range(11,24),
    // Tue: available 8-17 -> block 17-23
    1: range(17,24),
    // Wed: available 8-17 -> block 17-24
    2: range(17,24),
    // Thu: available 8-14 -> block 14-23
    3: range(14,24),
    // Fri: available 8-14 -> block 14-23
    4: range(14,24),
    // Sat: available 16-23 -> block 8-16
    5: range(8,16),
    // Sun: available 16-23 -> block 8-16
    6: range(8,16),
  },
  "ndflucy@gmail.com": {
    // Mon-Thu: block 8am-3pm
    0: range(8,15),
    1: range(8,15),
    2: range(8,15),
    3: range(8,15),
    // Fri: block 8am-3pm
    4: range(8,15),
    // Sat-Sun: free
    5: [],
    6: [],
  },
  "cynthiaboughanem1@gmail.com": {
    // Mon: free
    0: [],
    // Tue: block 18-21
    1: range(18,21),
    // Wed: block 15-21 (3:30pm rounded to 15)
    2: range(15,21),
    // Thu-Sun: free
    3: [],
    4: [],
    5: [],
    6: [],
  },
  "hoyekjp@gmail.com": {
    // Next week: Mon block 11-17, Thu block 15-17
    0: range(11,17),
    1: [],
    2: [],
    3: range(15,17),
    4: [],
    5: [],
    6: [],
  },
  "miladaali995@gmail.com": {
    // Fully flexible - no blocks
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
  },
};

function range(start, end) {
  const r = [];
  for (let i = start; i < end; i++) r.push(i);
  return r;
}

async function seed() {
  // Clear existing availability for this week
  await supabase.from("availability").delete().eq("week_starting", weekStartStr);
  console.log("Cleared availability for", weekStartStr);

  const { data: profiles } = await supabase.from("profiles").select("id,email,full_name");
  let total = 0;

  for (const [email, blocks] of Object.entries(staffBlocks)) {
    const profile = profiles.find(p => p.email === email);
    if (!profile) { console.log("Not found:", email); continue; }

    const rows = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = DATES[d];
      const blockedHours = new Set(blocks[d] || []);
      for (const h of HOURS) {
        rows.push({
          week_starting: weekStartStr,
          staff_id: profile.id,
          slot_key: dateStr + "_h" + h,
          slot_label: DAYS[d] + " " + fmtH(h),
          slot_date: dateStr,
          available: !blockedHours.has(h),
          submitted: true,
        });
      }
    }

    const { error } = await supabase.from("availability").upsert(rows, { onConflict: "week_starting,staff_id,slot_key" });
    if (error) console.log("ERROR", email, error.message);
    else {
      const blockedTotal = Object.values(blocks).flat().length;
      console.log("Seeded", profile.full_name + ":", blockedTotal, "hours blocked");
      total += rows.length;
    }
  }
  console.log("\nTotal:", total, "slots for week", weekStartStr);
  console.log("Go to Admin -> Schedule Builder -> Auto-Generate!");
}

seed();
