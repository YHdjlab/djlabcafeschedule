const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function go() {
  const { data: cleo } = await supabase.from("profiles").select("id").eq("email","cloyounan@gmail.com").single();
  const { data } = await supabase.from("availability")
    .select("slot_key,available")
    .eq("staff_id", cleo.id)
    .eq("slot_date", "2026-05-04")
    .order("slot_key");
  console.log("Cleo Monday May 4:");
  data?.forEach(a => {
    const m = a.slot_key.match(/_h(\d+)$/);
    const h = m ? parseInt(m[1]) : 0;
    console.log("  hour", h, "(" + (h<12?h+"am":h===12?"12pm":(h-12)+"pm") + ") ->", a.available ? "AVAILABLE" : "BLOCKED");
  });
}
go();
