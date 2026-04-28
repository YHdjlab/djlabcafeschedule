const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function main() {
  const { data, error } = await supabase.from("profiles").update({ role: "supervisor_floor" }).eq("email", "hoyekjp@gmail.com").select();
  console.log("JP:", data?.[0]?.role, error?.message || "OK");
  const { data: all } = await supabase.from("profiles").select("email,role").order("role");
  all?.forEach(p => console.log(p.email, "->", p.role));
}
main();
