const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function check() {
  // Check Sunday availability (2026-05-03)
  const { data, count } = await supabase.from("availability")
    .select("*", { count: "exact" })
    .eq("slot_date", "2026-05-03")
    .eq("available", true);
  console.log("Sunday 2026-05-03 availability rows:", count);
  if (data?.length) console.log("Sample:", data[0]);

  // Fix JP role
  const { data: jp, error } = await supabase.from("profiles")
    .update({ role: "admin" })
    .eq("email", "hoyekjp@gmail.com")
    .select();
  console.log("JP update:", jp?.[0]?.role, error?.message || "OK");
}
check();
