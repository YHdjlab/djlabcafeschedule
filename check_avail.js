const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function check() {
  const { data, error } = await supabase.from("availability").select("*").limit(5);
  console.log("error:", error);
  console.log("rows:", data?.length);
  console.log("sample:", JSON.stringify(data?.[0], null, 2));
  const { data: d2 } = await supabase.from("availability").select("*").eq("week_starting", "2026-04-27");
  console.log("rows for week 2026-04-27:", d2?.length);
}
check();
