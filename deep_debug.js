const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Add console log inside the viewer to show what date each row is using
ap = ap.replace(
  "const allWeekAvail=availability.filter((a:any)=>a.staff_id===s.id&&a.week_starting===weekStart)",
  `const allWeekAvail=availability.filter((a:any)=>a.staff_id===s.id&&a.week_starting===weekStart)
            if(s.full_name?.includes('Cynthia')){
              console.log('Cynthia DATES array:', DATES)
              console.log('Cynthia weekStart:', weekStart)
              DAYS.forEach((day:string,di:number)=>{
                const date=DATES[di]
                const dayBlocks=allWeekAvail.filter((a:any)=>a.slot_date===date&&!a.available)
                console.log(day, '(date:', date, ') blocks:', dayBlocks.map((a:any)=>a.slot_key))
              })
            }`
);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
