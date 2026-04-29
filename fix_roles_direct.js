const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function fix() {
  // Check current roles
  const { data } = await supabase.from("profiles").select("email,full_name,role").order("role");
  console.log("Current roles:");
  data?.forEach(p => console.log(" ", p.full_name, "->", p.role));

  // Force update supervisor roles
  const { error } = await supabase.from("profiles")
    .update({ role: "supervisor" })
    .in("email", ["hoyekjp@gmail.com", "miladaali995@gmail.com"]);
  console.log("\nForce update:", error ? error.message : "OK");

  // Verify
  const { data: after } = await supabase.from("profiles").select("email,full_name,role").order("role");
  console.log("\nAfter update:");
  after?.forEach(p => console.log(" ", p.full_name, "->", p.role));
}
fix();
