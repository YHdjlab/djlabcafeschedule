const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Replace floor2 assignment - only assign floor2 during rush or weekends
ap = ap.replace(
  `      // Assign floor 2 (slot 3) - only if weekend or enough staff
      const floor2Pool=allStaffPool.filter((id:string)=>id!==bar_staff_id&&id!==floor_staff1_id)
      const floor_staff2_id=floor2Pool[0]||null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`,
  `      // Assign floor 2 (slot 3) - ONLY during rush hours or weekends (cost efficiency)
      // Off-rush = 1 supervisor + 1 staff is sufficient
      // Rush/weekend = full coverage needed
      const needsFullCoverage=isWeekend // weekends always full
      const floor2Pool=allStaffPool.filter((id:string)=>id!==bar_staff_id&&id!==floor_staff1_id)
      const floor_staff2_id=needsFullCoverage?(floor2Pool[0]||null):null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`
);

// Also update issues - floor2 only required on weekends
ap = ap.replace(
  `      const issues:string[]=[]
      if(!supervisor_id)issues.push('No supervisor available')
      if(!bar_staff_id)issues.push('No bar staff')
      if(!floor_staff1_id)issues.push('No floor staff')`,
  `      const issues:string[]=[]
      if(!supervisor_id)issues.push('⚠️ No supervisor — shift cannot run')
      if(!bar_staff_id&&!floor_staff1_id)issues.push('No staff available')
      if(isWeekend&&!floor_staff2_id&&floor_staff1_id)issues.push('Weekend needs 2nd staff for rush')`
);

// Update system info in settings tab
ap = ap.replace(
  `['Off-Rush Staffing','1 supervisor + 1 bar + 1 floor']`,
  `['Off-Rush Staffing','1 supervisor + 1 staff (cost efficient)']`
);
ap = ap.replace(
  `['Rush Staffing','1 supervisor + 1 bar + 2 floor']`,
  `['Rush Staffing','1 supervisor + 1 bar + 2 floor (weekends/rush)']`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
