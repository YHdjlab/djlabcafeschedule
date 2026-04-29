const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function go() {
  // Check availability staff_ids vs profiles
  const { data: avail } = await supabase.from("availability")
    .select("staff_id").eq("week_starting","2026-05-04").eq("available",true).limit(100);
  const ids = [...new Set(avail?.map(a => a.staff_id))];
  console.log("Unique staff_ids in availability:", ids);

  const { data: profiles } = await supabase.from("profiles").select("id,full_name,role");
  ids.forEach(id => {
    const p = profiles?.find(p => p.id === id);
    console.log(id, "->", p ? p.full_name+"("+p.role+")" : "NOT IN PROFILES");
  });
}
go();
