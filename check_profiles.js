const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function fix() {
  // Show current state
  const { data } = await supabase.from("profiles").select("email,role,full_name,active").order("role");
  console.log("Current profiles:");
  data.forEach(p => console.log(" ", p.email, "->", p.role, p.active ? "active" : "inactive"));

  // Fix JP to admin
  const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("email", "hoyekjp@gmail.com");
  console.log("JP -> admin:", error?.message || "OK");

  // Final check
  const { data: d2 } = await supabase.from("profiles").select("email,role").order("role");
  console.log("\nFinal:");
  d2.forEach(p => console.log(" ", p.email, "->", p.role));
}
fix();
