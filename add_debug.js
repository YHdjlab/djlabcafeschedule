const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Add console.log right after STAFF_MAP is built to debug
ap = ap.replace(
  "const weekAvailability=availability.filter((a:any)=>a.week_starting===weekStart&&a.available)",
  `const weekAvailability=availability.filter((a:any)=>a.week_starting===weekStart&&a.available)
  console.log('STAFF_MAP keys:', Object.keys(STAFF_MAP).length, Object.values(STAFF_MAP).map((s:any)=>s.full_name+'('+s.role+')'))
  console.log('weekAvailability count:', weekAvailability.length)
  console.log('availability sample:', availability.slice(0,3))`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("debug added");
