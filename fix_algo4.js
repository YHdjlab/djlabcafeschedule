const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Replace bar/floor assignment with smarter version
// Rule: treat ALL non-supervisor available staff as a pool
// Assign them based on: rush coverage > supervisor overlap > hours fairness
// Role (bar/floor) is secondary - all staff can work both
ap = ap.replace(
  `      const excluded=new Set([supervisor_id,supervisor2_id].filter(Boolean))
      // Bar: prefer bar-role staff, but any staff can cover bar
      const barCandidates=byRushThenLeast([
        ...availBars.filter((id:string)=>!excluded.has(id)),
        ...availFloors.filter((id:string)=>!excluded.has(id))
      ].filter((id:string,idx:number,arr:string[])=>arr.indexOf(id)===idx))
      const bar_staff_id=barCandidates[0]||null
      if(bar_staff_id)assignCount[bar_staff_id]=(assignCount[bar_staff_id]||0)+8

      // Floor assignment: prefer floor role, but use any available staff if needed
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
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`,

  `      // All non-supervisor staff pool - sorted by:
      // 1. Overlap with supervisor hours (supervisors must have staff with them)
      // 2. Rush hour coverage
      // 3. Total available hours
      // 4. Fairness (least assigned)
      const supWindows:Array<{s:number,e:number}>=[]
      if(sup1Info)supWindows.push({s:sup1Info.startH,e:sup1Info.endH})
      if(sup2Info)supWindows.push({s:sup2Info.startH,e:sup2Info.endH})

      const overlapWithSups=(id:string)=>{
        const avail=getAvail(id)
        return supWindows.reduce((total:{s:number,e:number},win:{s:number,e:number})=>
          ({s:0,e:total.e+avail.filter((h:number)=>h>=win.s&&h<win.e).length}),{s:0,e:0}).e
      }

      const excluded=new Set([supervisor_id,supervisor2_id].filter(Boolean) as string[])
      const allStaffPool=byRushThenLeast(
        availStaff.filter((id:string)=>!excluded.has(id))
      ).sort((a:string,b:string)=>{
        // Primary: overlap with supervisor windows
        const overlapDiff=overlapWithSups(b)-overlapWithSups(a)
        if(overlapDiff!==0)return overlapDiff
        // Secondary: rush coverage
        const rushDiff=rushHoursCovered(b)-rushHoursCovered(a)
        if(rushDiff!==0)return rushDiff
        // Tertiary: fairness
        return(assignCount[a]||0)-(assignCount[b]||0)
      })

      // Assign bar (slot 1) - prefer bar-role but anyone can do it
      const barPreferred=[...allStaffPool.filter((id:string)=>STAFF_MAP[id]?.role==='bar'),...allStaffPool.filter((id:string)=>STAFF_MAP[id]?.role!=='bar')]
      const bar_staff_id=barPreferred[0]||null
      if(bar_staff_id)assignCount[bar_staff_id]=(assignCount[bar_staff_id]||0)+8

      // Assign floor 1 (slot 2)
      const floor1Pool=allStaffPool.filter((id:string)=>id!==bar_staff_id)
      const floorPreferred1=[...floor1Pool.filter((id:string)=>STAFF_MAP[id]?.role==='floor'),...floor1Pool.filter((id:string)=>STAFF_MAP[id]?.role!=='floor')]
      const floor_staff1_id=floorPreferred1[0]||null
      if(floor_staff1_id)assignCount[floor_staff1_id]=(assignCount[floor_staff1_id]||0)+8

      // Assign floor 2 (slot 3) - only if weekend or enough staff
      const floor2Pool=allStaffPool.filter((id:string)=>id!==bar_staff_id&&id!==floor_staff1_id)
      const floor_staff2_id=floor2Pool[0]||null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
