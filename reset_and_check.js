const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function go() {
  // Clear all transactional data
  for (const t of ["attendance","swap_requests","day_off_requests","schedules","availability","fillin_requests"]) {
    const { error } = await supabase.from(t).delete().neq("id","00000000-0000-0000-0000-000000000000");
    console.log(t + ":", error ? "ERROR: " + error.message : "cleared");
  }
  // Show current profiles
  const { data } = await supabase.from("profiles").select("email,full_name,role").order("role");
  console.log("\nCurrent profiles:");
  data?.forEach(p => console.log(" ", p.email, "->", p.role, "|", p.full_name));
}
go();
