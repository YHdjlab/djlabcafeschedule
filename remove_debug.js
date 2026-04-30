const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
ap = ap.replace(
  `const allWeekAvail=availability.filter((a:any)=>a.staff_id===s.id&&a.week_starting===weekStart)
            if(s.full_name?.includes('Cynthia')){
              console.log('Cynthia avail rows:', allWeekAvail.length, 'blocked:', allWeekAvail.filter((a:any)=>!a.available).map((a:any)=>a.slot_date+' '+a.slot_key))
            }`,
  "const allWeekAvail=availability.filter((a:any)=>a.staff_id===s.id&&a.week_starting===weekStart)"
);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
