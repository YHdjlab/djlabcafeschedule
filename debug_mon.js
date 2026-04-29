const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Add debug after supervisor assignment
ap = ap.replace(
  "      const barPool=byLeast(availBars.filter((id:string)=>id!==supervisor_id&&id!==supervisor2_id))",
  `      if(day==='Monday'){console.log('MON sups:',{supervisor_id:supervisor_id?STAFF_MAP[supervisor_id]?.full_name:'none',supervisor2_id:supervisor2_id?STAFF_MAP[supervisor2_id]?.full_name:'none',availSups:availSups.map((id:string)=>STAFF_MAP[id]?.full_name),sup1Info,sup2Info})}
      const barPool=byLeast(availBars.filter((id:string)=>id!==supervisor_id&&id!==supervisor2_id))`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
