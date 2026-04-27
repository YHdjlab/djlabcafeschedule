const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function fix() {
  // Try via rpc to run raw SQL
  const { data, error } = await supabase.rpc('exec_sql', { 
    sql: "UPDATE profiles SET role = 'admin' WHERE email = 'hoyekjp@gmail.com'" 
  });
  console.log("rpc result:", data, error?.message);
  
  // Check current constraint
  const { data: check } = await supabase.rpc('exec_sql', {
    sql: "SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'profiles' AND constraint_type = 'CHECK'"
  });
  console.log("constraints:", check);
}
fix();
