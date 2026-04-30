const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Replace the entire staff pool assignment with a clean version
ap = ap.replace(
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

      // Assign floor 2 (slot 3) - ONLY during rush hours or weekends (cost efficiency)
      // Off-rush = 1 supervisor + 1 staff is sufficient
      // Rush/weekend = full coverage needed
      const needsFullCoverage=isWeekend // weekends always full
      const floor2Pool=allStaffPool.filter((id:string)=>id!==bar_staff_id&&id!==floor_staff1_id)
      const floor_staff2_id=needsFullCoverage?(floor2Pool[0]||null):null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`,

  `      // STAFF ASSIGNMENT
      // All staff are cross-trained - assign based on:
      // 1. Who overlaps with supervisor windows (sup must have staff)
      // 2. Rush hour coverage
      // 3. Total hours available (more = more flexible = better)
      // 4. Fairness (least assigned this week)
      
      const excluded=new Set([supervisor_id,supervisor2_id].filter(Boolean) as string[])
      const nonSupPool=availStaff.filter((id:string)=>!excluded.has(id))

      // Score each staff member
      const scoreStaff=(id:string)=>{
        const avail=getAvail(id)
        // Overlap with each supervisor window
        let supOverlap=0
        if(sup1Info) supOverlap+=avail.filter((h:number)=>h>=sup1Info.startH&&h<sup1Info.endH).length
        if(sup2Info) supOverlap+=avail.filter((h:number)=>h>=sup2Info.startH&&h<sup2Info.endH).length
        const rush=avail.filter((h:number)=>h>=rushStartH&&h<rushEndH).length
        const total=avail.length
        const fair=-(assignCount[id]||0)
        // Weighted score: supervisor overlap is critical, then rush, then total, then fairness
        return supOverlap*100 + rush*10 + total*2 + fair
      }

      const sortedPool=[...nonSupPool].sort((a:string,b:string)=>scoreStaff(b)-scoreStaff(a))

      // Assign up to 3 staff slots
      // Weekdays off-rush: only 2 staff needed (bar + floor)
      // Weekdays with rush: 3 staff (bar + 2 floor)  
      // Weekends: 3 staff always
      const bar_staff_id=sortedPool[0]||null
      if(bar_staff_id)assignCount[bar_staff_id]=(assignCount[bar_staff_id]||0)+8

      const floor_staff1_id=sortedPool[1]||null
      if(floor_staff1_id)assignCount[floor_staff1_id]=(assignCount[floor_staff1_id]||0)+8

      // 3rd staff only on weekends
      const floor_staff2_id=isWeekend?(sortedPool[2]||null):null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
