const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function check() {
  const { data: profiles } = await supabase.from("profiles").select("id,email,full_name,role").order("role");
  console.log("Profiles:");
  profiles?.forEach(p => console.log(" ", p.id, p.email, "->", p.role));

  const { data: avail } = await supabase.from("availability").select("staff_id,slot_date").eq("week_starting","2026-05-04").limit(10);
  console.log("\nAvailability staff_ids:");
  const ids = [...new Set(avail?.map(a => a.staff_id))];
  ids.forEach(id => {
    const p = profiles?.find(p => p.id === id);
    console.log(" ", id, "->", p ? p.full_name + " (" + p.role + ")" : "NOT FOUND");
  });
}
check();
