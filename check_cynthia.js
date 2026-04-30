const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function go() {
  const { data: c } = await supabase.from("profiles").select("id").eq("email","cynthiaboughanem1@gmail.com").single();
  for (const date of ["2026-05-07","2026-05-08"]) {
    const { data } = await supabase.from("availability")
      .select("slot_key,available")
      .eq("staff_id", c.id)
      .eq("slot_date", date)
      .order("slot_key");
    console.log("\nCynthia " + date + ":");
    data?.sort((a,b)=>{const ah=parseInt(a.slot_key.match(/_h(\d+)$/)[1]);const bh=parseInt(b.slot_key.match(/_h(\d+)$/)[1]);return ah-bh}).forEach(a => {
      const h = parseInt(a.slot_key.match(/_h(\d+)$/)[1]);
      console.log("  hour", h, "->", a.available ? "AVAILABLE" : "BLOCKED");
    });
  }
}
go();
