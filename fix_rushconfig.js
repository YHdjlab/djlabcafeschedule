const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Add rushConfig to ScheduleBuilderTab props and call
ap = ap.replace(
  "function ScheduleBuilderTab({ staff, schedules, setSchedules, profile, supabase, availability }: any) {",
  "function ScheduleBuilderTab({ staff, schedules, setSchedules, profile, supabase, availability, rushConfig }: any) {"
);
ap = ap.replace(
  "{tab === 'schedule' && <ScheduleBuilderTab staff={staff} schedules={schedules} setSchedules={setSchedules} profile={profile} supabase={supabase} availability={availability}/>}",
  "{tab === 'schedule' && <ScheduleBuilderTab staff={staff} schedules={schedules} setSchedules={setSchedules} profile={profile} supabase={supabase} availability={availability} rushConfig={rushConfig}/>}"
);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("fixed");
