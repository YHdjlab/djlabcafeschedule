const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function go() {
  const { data: c } = await supabase.from("profiles").select("id").eq("email","cynthiaboughanem1@gmail.com").single();
  const { data } = await supabase.from("availability")
    .select("slot_date,slot_key,available")
    .eq("staff_id", c.id)
    .eq("week_starting", "2026-05-04")
    .eq("available", false);
  console.log("Cynthia blocked hours week May 4:");
  data?.forEach(a => {
    const h = parseInt(a.slot_key.match(/_h(\d+)$/)[1]);
    console.log("  ", a.slot_date, "hour", h, "BLOCKED");
  });
  if (!data?.length) console.log("  (none - fully available)");
}
go();
