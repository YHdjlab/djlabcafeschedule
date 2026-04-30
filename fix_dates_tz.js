const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
ap = ap.replace(
  "const DATES=Array.from({length:7},(_,i)=>{const d=new Date(weekStart+'T00:00:00');d.setDate(d.getDate()+i);return d.toISOString().slice(0,10)})",
  "const DATES=Array.from({length:7},(_,i)=>format(addDays(new Date(weekStart+'T00:00:00'),i),'yyyy-MM-dd'))"
);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
