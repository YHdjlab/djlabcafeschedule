const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix rushHoursCovered - the issue is getAvail only returns AVAILABLE hours
// but weekAvailability is already filtered to available:true so this should work
// The real issue: Lucciana has role 'bar' but availFloors filters role==='floor'
// Lucciana should be in availBars not availFloors
// Monday: bar=Lucciana+Cynthia, floor=Rouba+Cleo
// But Cleo and Rouba are floor, Lucciana and Cynthia are bar
// So floor1=Rouba(8-11,3h rush=0), floor2=Cleo(20-24,4h,rush=0)
// We need to allow bar staff to cover floor when no floor available for rush

// The REAL fix: when assigning floor staff, also consider bar staff as backup
// AND sort ALL candidates by rush coverage regardless of role
ap = ap.replace(
  `      const excluded2=new Set([supervisor_id,supervisor2_id,bar_staff_id].filter(Boolean))
      const floor1Candidates=byRushThenLeast(availFloors.filter((id:string)=>!excluded2.has(id)))
      const floor_staff1_id=floor1Candidates[0]||null
      if(floor_staff1_id)assignCount[floor_staff1_id]=(assignCount[floor_staff1_id]||0)+8

      const excluded3=new Set([supervisor_id,supervisor2_id,bar_staff_id,floor_staff1_id].filter(Boolean))
      const floor2Candidates=byRushThenLeast(availFloors.filter((id:string)=>!excluded3.has(id)))
      const floor_staff2_id=floor2Candidates[0]||null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`,
  `      // Floor assignment: prefer floor role, but use any available staff if needed
      // Always sort by rush coverage first
      const excluded2=new Set([supervisor_id,supervisor2_id,bar_staff_id].filter(Boolean))
      const floorCandidates=byRushThenLeast([
        ...availFloors.filter((id:string)=>!excluded2.has(id)),
        // Add remaining bar staff as backup floor coverage
        ...availBars.filter((id:string)=>!excluded2.has(id)&&id!==bar_staff_id)
      ].filter((id:string,idx:number,arr:string[])=>arr.indexOf(id)===idx)) // dedupe
      const floor_staff1_id=floorCandidates[0]||null
      if(floor_staff1_id)assignCount[floor_staff1_id]=(assignCount[floor_staff1_id]||0)+8

      const excluded3=new Set([supervisor_id,supervisor2_id,bar_staff_id,floor_staff1_id].filter(Boolean))
      const floor2Candidates=byRushThenLeast([
        ...availFloors.filter((id:string)=>!excluded3.has(id)),
        ...availBars.filter((id:string)=>!excluded3.has(id))
      ].filter((id:string,idx:number,arr:string[])=>arr.indexOf(id)===idx))
      const floor_staff2_id=floor2Candidates[0]||null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`
);

// Fix bar assignment too - prefer rush coverage for bar as well
ap = ap.replace(
  `      const excluded=new Set([supervisor_id,supervisor2_id].filter(Boolean))
      const barCandidates=byRushThenLeast(availBars.filter((id:string)=>!excluded.has(id)))
      const bar_staff_id=barCandidates[0]||null
      if(bar_staff_id)assignCount[bar_staff_id]=(assignCount[bar_staff_id]||0)+8`,
  `      const excluded=new Set([supervisor_id,supervisor2_id].filter(Boolean))
      // Bar: prefer bar-role staff, but any staff can cover bar
      const barCandidates=byRushThenLeast([
        ...availBars.filter((id:string)=>!excluded.has(id)),
        ...availFloors.filter((id:string)=>!excluded.has(id))
      ].filter((id:string,idx:number,arr:string[])=>arr.indexOf(id)===idx))
      const bar_staff_id=barCandidates[0]||null
      if(bar_staff_id)assignCount[bar_staff_id]=(assignCount[bar_staff_id]||0)+8`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
