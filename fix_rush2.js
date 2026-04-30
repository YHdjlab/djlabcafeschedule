const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Replace the floor_staff2 logic to ALWAYS add a 2nd floor staff during rush
ap = ap.replace(
  `      // Add 2nd floor staff if:
      // - Weekend (full rush)
      // - OR there's a 3rd person available who covers rush hours significantly
      const thirdPerson=sortedPool[2]
      const thirdCoversRush=thirdPerson?(()=>{
        const av=getAvail(thirdPerson)
        return av.filter((h:number)=>h>=rushStartH&&h<rushEndH).length>=3
      })():false
      const floor_staff2_id=isWeekend?(sortedPool[2]||null):(thirdCoversRush?thirdPerson:null)
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`,
  `      // Rush hours always need 2 floor staff (1 sup + 1 bar + 2 floor)
      // Off-rush hours only need 1 staff total
      // Since the day spans both, we always assign 2 floor when a 3rd person is available
      const floor_staff2_id=sortedPool[2]||null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`
);

// Update settings tab to reflect new rules
ap = ap.replace(
  `['Off-Rush Staffing','1 supervisor + 1 staff (cost efficient)']`,
  `['Off-Rush Staffing','1 supervisor + 1 bar + 1 floor']`
);
ap = ap.replace(
  `['Rush Staffing','1 supervisor + 1 bar + 2 floor (weekends/rush)']`,
  `['Rush Staffing','1 supervisor + 1 bar + 2 floor (preferred)']`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
