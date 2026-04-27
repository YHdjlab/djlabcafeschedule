const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function check() {
  // Auth users
  const { data: { users } } = await supabase.auth.admin.listUsers();
  console.log("\nAUTH USERS (" + users.length + "):");
  users.forEach(u => console.log(" ", u.email, "| confirmed:", u.email_confirmed_at ? "YES" : "NO"));

  // Profiles
  const { data: profiles } = await supabase.from('profiles').select('email,full_name,role,active');
  console.log("\nPROFILES (" + profiles.length + "):");
  profiles.forEach(p => console.log(" ", p.email, "|", p.role, "|", p.full_name, "| active:", p.active));

  // Check who has auth but no profile
  const profileEmails = new Set(profiles.map(p => p.email?.toLowerCase()));
  const missing = users.filter(u => !profileEmails.has(u.email?.toLowerCase()));
  if (missing.length) {
    console.log("\nMISSING PROFILES for:", missing.map(u => u.email).join(', '));
  } else {
    console.log("\nAll auth users have profiles.");
  }
}
check();
