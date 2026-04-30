const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function go() {
  // JP's availability on Thursday May 7
  const { data: jp } = await supabase.from("profiles").select("id").eq("email","hoyekjp@gmail.com").single();
  const { data } = await supabase.from("availability")
    .select("slot_key,available")
    .eq("staff_id", jp.id)
    .eq("slot_date", "2026-05-07")
    .order("slot_key");
  console.log("JP Thursday availability:");
  data?.forEach(a => console.log(a.slot_key, "->", a.available ? "AVAILABLE" : "BLOCKED"));

  // Also check Lucciana on Monday
  const { data: lu } = await supabase.from("profiles").select("id").eq("email","ndflucy@gmail.com").single();
  const { data: luMon } = await supabase.from("availability")
    .select("slot_key,available")
    .eq("staff_id", lu.id)
    .eq("slot_date", "2026-05-04")
    .order("slot_key");
  console.log("\nLucciana Monday availability:");
  luMon?.forEach(a => console.log(a.slot_key, "->", a.available ? "AVAILABLE" : "BLOCKED"));
}
go();
