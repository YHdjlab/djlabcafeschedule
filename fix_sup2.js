const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Remove debug log
ap = ap.replace(
  `      if(day==='Monday'){console.log('MON sups:',{supervisor_id:supervisor_id?STAFF_MAP[supervisor_id]?.full_name:'none',supervisor2_id:supervisor2_id?STAFF_MAP[supervisor2_id]?.full_name:'none',availSups:availSups.map((id:string)=>STAFF_MAP[id]?.full_name),sup1Info,sup2Info})}
      `, ""
);

// The issue: sup2Info is null when JP only has PM hours but forceAM=false forcePM=true
// JP on Monday is blocked 11-17, so available 8-11 and 17-24
// PM filter h>=16&&h<24 should give 17,18,19,20,21,22,23 = 7 hours -> should work
// But bothFlexible check: JP avail is 11 hours NOT >=14, so bothFlexible split won't give him PM correctly

// Fix: getShiftForSup should use actual available hours within the forced window
// Also fix: when sup2 has limited availability, use whatever they have in PM window
ap = ap.replace(
  `      const bothFlexible=availSups.length>=2
      const sup1Info=supervisor_id?getShiftForSup(supervisor_id,bothFlexible,false):null
      const sup2Info=supervisor2_id?getShiftForSup(supervisor2_id,false,bothFlexible):null`,
  `      // sup1 gets AM if both supervisors are present, sup2 gets PM
      const hasTwoSups=!!(supervisor_id&&supervisor2_id)
      const sup1Info=supervisor_id?getShiftForSup(supervisor_id,hasTwoSups,false):null
      const sup2Info=supervisor2_id?getShiftForSup(supervisor2_id,false,hasTwoSups):null`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
