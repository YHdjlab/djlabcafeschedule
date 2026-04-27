const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function check() {
  // Test each slot_type value
  for (const t of ['rush','off-rush','mixed','draft','full','weekday']) {
    const { error } = await supabase.from('schedules').insert({
      schedule_id: 'TEST-TYPE', week_starting: '2026-04-27', slot_id: 'test',
      slot_date: '2026-04-27', slot_label: 'Test', slot_type: t,
      start_time: '10:00', end_time: '23:00', status: 'approved',
    });
    console.log(t + ":", error ? "FAIL - " + error.message : "OK");
    await supabase.from('schedules').delete().eq('schedule_id', 'TEST-TYPE');
  }
}
check();
