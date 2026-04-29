const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Fix duplicate supervisor key in utils.ts
let utils = fs.readFileSync("src/lib/utils.ts", "utf8");
// Remove duplicate lines
const lines = utils.split("\n");
const seen = new Set();
const deduped = lines.filter(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith("supervisor:") || trimmed.startsWith("'supervisor':")) {
    if (seen.has("supervisor")) return false;
    seen.add("supervisor");
  }
  return true;
});
fs.writeFileSync("src/lib/utils.ts", deduped.join("\n"), "utf8");
console.log("utils.ts deduped");

// Fix roles via service role client
async function fix() {
  const { data, error } = await supabase.from("profiles")
    .update({ role: "supervisor" })
    .in("role", ["supervisor_floor", "supervisor_bar", "admin"]);
  console.log("Roles updated:", error ? error.message : "OK");
  const { data: all } = await supabase.from("profiles").select("email,role").order("role");
  all?.forEach(p => console.log(p.email, "->", p.role));
}
fix();
