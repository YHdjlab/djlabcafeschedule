const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function check() {
  // Check RLS policies on schedules table
  const { data, error } = await supabase.rpc('get_policies', {}).catch(() => ({data: null, error: 'no rpc'}));
  
  // Try inserting a test row to see what error we get
  const testRow = {
    schedule_id: 'TEST-123',
    week_starting: '2026-04-27',
    slot_id: 'test_day',
    slot_date: '2026-04-27',
    slot_label: 'Test',
    slot_type: 'draft',
    start_time: '10:00',
    end_time: '23:00',
    status: 'approved',
  };
  const { data: ins, error: insErr } = await supabase.from('schedules').insert(testRow).select();
  console.log("Insert test:", ins ? "SUCCESS rows:" + ins.length : "FAILED: " + insErr?.message);
  
  // Check existing schedules
  const { data: existing, error: selErr } = await supabase.from('schedules').select('id,week_starting,status').limit(5);
  console.log("Select test:", existing ? "SUCCESS rows:" + existing.length : "FAILED: " + selErr?.message);
  
  // Clean up test
  await supabase.from('schedules').delete().eq('schedule_id', 'TEST-123');
}
check();
