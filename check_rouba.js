const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function check() {
  const { data: profiles } = await supabase.from("profiles").select("id,email,full_name");
  const rouba = profiles.find(p => p.email === "roubakazzaz@gmail.com");
  const { data } = await supabase.from("availability")
    .select("slot_date, slot_key, slot_label")
    .eq("staff_id", rouba.id)
    .eq("slot_date", "2026-04-27")
    .order("slot_key");
  console.log("Rouba Monday slots:");
  data?.forEach(s => console.log(" ", s.slot_key, s.slot_label));
}
check();
