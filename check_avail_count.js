const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function check() {
  const dates = ["2026-04-27","2026-04-28","2026-04-29","2026-04-30","2026-05-01","2026-05-02","2026-05-03"];
  const days  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const { data: profiles } = await supabase.from("profiles").select("id,email,full_name,role");
  
  for (let i = 0; i < 7; i++) {
    const { data } = await supabase.from("availability")
      .select("staff_id").eq("slot_date", dates[i]).eq("available", true);
    const staffIds = [...new Set(data?.map((a) => a.staff_id))];
    const names = staffIds.map(id => {
      const p = profiles.find(p => p.id === id);
      return p ? p.full_name.split(" ")[0] : "?";
    });
    console.log(days[i], dates[i], "->", staffIds.length, "staff:", names.join(", "));
  }
}
check();
