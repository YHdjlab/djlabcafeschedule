const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DATES = ["2026-04-27","2026-04-28","2026-04-29","2026-04-30","2026-05-01","2026-05-02","2026-05-03"];
const DAYS  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const weekStartStr = "2026-04-27";

const SHIFTS = {
  AM:  { startH: 8,  endH: 16 },
  MID: { startH: 12, endH: 20 },
  PM:  { startH: 16, endH: 24 },
};

function fmt(h) {
  if (h < 12) return h + " AM";
  if (h === 12) return "12 PM";
  return (h-12) + " PM";
}

// Realistic schedule with overlaps:
// - Multiple staff picking MID on same day creates overlap with AM and PM
// - Fri/Sat/Sun everyone has a shift (mandatory)
// - Max 2 of each type per person per week (excluding Sunday free pick)
// null = day off
const staffShifts = {
  "hoyekjp@gmail.com": {
    // JP (admin/supervisor) - evening person, 2 MID + 2 PM + mandatory weekends
    0: "MID",  // Mon MID
    1: null,   // Tue off
    2: "PM",   // Wed PM
    3: null,   // Thu off
    4: "PM",   // Fri PM (mandatory)
    5: "MID",  // Sat MID (mandatory)
    6: "PM",   // Sun free pick PM
  },
  "miladaali995@gmail.com": {
    // Miled (supervisor_bar) - morning person, 2 AM + 2 MID + mandatory weekends
    0: "AM",   // Mon AM
    1: "MID",  // Tue MID
    2: "AM",   // Wed AM
    3: "MID",  // Thu MID
    4: "AM",   // Fri AM (mandatory) - overlaps with JP MID
    5: "MID",  // Sat MID (mandatory) - overlaps with JP
    6: "AM",   // Sun free pick AM
  },
  "cloyounan@gmail.com": {
    // Cleo (floor) - flexible, 2 PM + 2 MID + mandatory weekends
    0: "PM",   // Mon PM
    1: "MID",  // Tue MID - overlap with Miled
    2: null,   // Wed off
    3: "PM",   // Thu PM
    4: "PM",   // Fri PM (mandatory) - overlap with JP
    5: "PM",   // Sat PM (mandatory)
    6: "MID",  // Sun free pick MID
  },
  "roubakazzaz@gmail.com": {
    // Rouba (floor) - morning/mid person, 2 AM + 2 MID + mandatory weekends
    0: "AM",   // Mon AM - overlap with Miled
    1: "AM",   // Tue AM
    2: "MID",  // Wed MID
    3: null,   // Thu off
    4: "MID",  // Fri MID (mandatory)
    5: "AM",   // Sat AM (mandatory)
    6: "PM",   // Sun free pick PM
  },
  "ndflucy@gmail.com": {
    // Lucciana (bar) - evening/mid, 2 PM + 2 MID + mandatory weekends
    0: "MID",  // Mon MID - overlap with JP
    1: "PM",   // Tue PM
    2: "MID",  // Wed MID - overlap with Rouba
    3: "PM",   // Thu PM
    4: "PM",   // Fri PM (mandatory) - overlap with Cleo + JP
    5: "MID",  // Sat MID (mandatory)
    6: "AM",   // Sun free pick AM
  },
  "cynthiaboughanem1@gmail.com": {
    // Cynthia (bar) - flexible all shifts, 2 AM + 2 PM + mandatory weekends
    0: "PM",   // Mon PM - overlap with Cleo
    1: "AM",   // Tue AM - overlap with Rouba
    2: "PM",   // Wed PM
    3: "AM",   // Thu AM
    4: "AM",   // Fri AM (mandatory) - overlap with Miled + Rouba
    5: "PM",   // Sat PM (mandatory)
    6: "MID",  // Sun free pick MID
  },
};

async function seed() {
  // Clear all
  for (const t of ["attendance","swap_requests","day_off_requests","schedules","availability"]) {
    await supabase.from(t).delete().neq("id","00000000-0000-0000-0000-000000000000");
    console.log("Cleared:", t);
  }

  const { data: profiles } = await supabase.from("profiles").select("id,email,full_name");
  let total = 0;

  for (const [email, schedule] of Object.entries(staffShifts)) {
    const profile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (!profile) { console.log("Not found:", email); continue; }

    const rows = [];
    for (let d = 0; d < 7; d++) {
      const shiftKey = schedule[d];
      if (!shiftKey) continue;

      const dateStr = DATES[d];
      const dayName = DAYS[d];
      const shift = SHIFTS[shiftKey];

      // Insert hour slots for schedule builder compatibility
      for (let h = shift.startH; h < shift.endH; h++) {
        rows.push({
          week_starting: weekStartStr,
          staff_id: profile.id,
          slot_key: dateStr + "_h" + h,
          slot_label: dayName + " " + fmt(h),
          slot_date: dateStr,
          available: true,
        });
      }
      // Insert shift marker for display
      rows.push({
        week_starting: weekStartStr,
        staff_id: profile.id,
        slot_key: dateStr + "_shift_" + shiftKey,
        slot_label: dayName + " " + shiftKey + " Shift",
        slot_date: dateStr,
        available: true,
      });
    }

    const { error } = await supabase.from("availability").upsert(rows, { onConflict: "week_starting,staff_id,slot_key" });
    if (error) console.log("ERROR", email, error.message);
    else {
      total += rows.length;
      const shifts = Object.entries(schedule).filter(([,v]) => v).map(([d,s]) => DAYS[parseInt(d)].slice(0,3)+":"+s).join(", ");
      console.log("Seeded", profile.full_name + ":", shifts);
    }
  }
  console.log("\nTotal:", total, "slots");
  console.log("\nOverlaps for builder to handle:");
  console.log("Mon AM: Miled+Rouba, Mon MID: JP+Lucciana, Mon PM: Cleo+Cynthia");
  console.log("Fri AM: Miled+Cynthia, Fri PM: JP+Cleo+Lucciana");
  console.log("Sat MID: JP+Miled+Lucciana");
}
seed();
