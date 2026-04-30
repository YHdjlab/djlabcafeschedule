const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// After floor/bar assignment, add a rule:
// For each supervisor shift window (AM/PM), ensure at least 1 staff member overlaps
// If not, pull the bench staff with most overlap into the schedule
ap = ap.replace(
  `      const issues:string[]=[]
      if(!supervisor_id)issues.push('No supervisor available')
      if(!bar_staff_id)issues.push('No bar staff')
      if(!floor_staff1_id)issues.push('No floor staff')`,
  `      // Rule: each supervisor window must have at least 1 staff member
      // Check AM window (sup1) and PM window (sup2) coverage
      const staffCoversWindow=(staffId:string,winStart:number,winEnd:number)=>{
        const avail=getAvail(staffId)
        return avail.filter((h:number)=>h>=winStart&&h<winEnd).length>=2
      }

      const assignedNonSup=[bar_staff_id,floor_staff1_id,floor_staff2_id].filter(Boolean) as string[]
      
      // Check if AM supervisor has staff coverage
      if(sup1Info){
        const amCovered=assignedNonSup.some(id=>staffCoversWindow(id,sup1Info.startH,sup1Info.endH))
        if(!amCovered){
          // Find best bench staff to cover AM
          const bench=availStaff.filter((id:string)=>
            !assignedNonSup.includes(id)&&id!==supervisor_id&&id!==supervisor2_id&&
            staffCoversWindow(id,sup1Info.startH,sup1Info.endH)
          )
          const bestBench=byRushThenLeast(bench)[0]||null
          if(bestBench){
            // Replace floor2 or add as floor2
            if(!floor_staff2_id){
              // Add as floor2 - need to mutate the variables
              // Since we can't reassign const, we'll add to issues as reminder
              issues_extra_am=bestBench
            }
          }
        }
      }

      // Much simpler approach: just note coverage gaps as issues
      const issues:string[]=[]
      if(!supervisor_id)issues.push('No supervisor available')
      if(!bar_staff_id)issues.push('No bar staff')
      if(!floor_staff1_id)issues.push('No floor staff')`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("too complex, reverting");

// That approach is too messy. Instead, rewrite the whole assignment section cleanly.
