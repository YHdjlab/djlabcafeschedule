const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function go() {
  const { data: c } = await supabase.from("profiles").select("id").eq("email","cynthiaboughanem1@gmail.com").single();
  
  // Get ALL Cynthia's availability records ever
  const { data } = await supabase.from("availability")
    .select("week_starting,slot_date,slot_key,available")
    .eq("staff_id", c.id)
    .order("week_starting").order("slot_date");
  
  console.log("ALL Cynthia availability records:");
  console.log("Total rows:", data?.length);
  
  // Group by week
  const byWeek = {};
  data?.forEach(r => {
    if (!byWeek[r.week_starting]) byWeek[r.week_starting] = { available: 0, blocked: 0 };
    if (r.available) byWeek[r.week_starting].available++;
    else byWeek[r.week_starting].blocked++;
  });
  Object.entries(byWeek).forEach(([w,c]) => console.log("Week", w, "->", c.available, "available,", c.blocked, "blocked"));
  
  // Show all blocked
  console.log("\nAll BLOCKED hours:");
  data?.filter(r => !r.available).forEach(r => {
    const h = parseInt(r.slot_key.match(/_h(\d+)$/)[1]);
    console.log("  ", r.week_starting, r.slot_date, "h"+h);
  });
}
go();
