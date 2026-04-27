const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function check() {
  const { data: profiles } = await supabase.from("profiles").select("id,email,full_name");
  const rouba = profiles.find(p => p.email === "roubakazzaz@gmail.com");
  
  for (const date of ["2026-04-27","2026-04-28","2026-04-29","2026-04-30","2026-05-01","2026-05-02","2026-05-03"]) {
    const { data } = await supabase.from("availability")
      .select("slot_key")
      .eq("staff_id", rouba.id)
      .eq("slot_date", date)
      .order("slot_key");
    const hours = data?.map(s => { const m = s.slot_key.match(/_h(\d+)$/); return m ? parseInt(m[1]) : -1; }).filter(h => h >= 0).sort((a,b)=>a-b);
    const day = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][["2026-04-27","2026-04-28","2026-04-29","2026-04-30","2026-05-01","2026-05-02","2026-05-03"].indexOf(date)];
    console.log(day, date, "hours:", hours?.join(",") || "NONE");
  }
}
check();
