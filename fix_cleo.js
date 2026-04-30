const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function go() {
  const { data: cleo } = await supabase.from("profiles").select("id").eq("email","cloyounan@gmail.com").single();
  // Mark all Monday hours as available for Cleo
  const { error } = await supabase.from("availability")
    .update({ available: true })
    .eq("staff_id", cleo.id)
    .eq("slot_date", "2026-05-04");
  if (error) console.log("ERROR:", error.message);
  else console.log("Cleo now fully available Monday");
}
go();
