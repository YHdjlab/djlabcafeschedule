const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

ap = ap.replace(
  `staff:[
          supervisor_id&&{id:supervisor_id,role:'Supervisor',info:getStaffHours(supervisor_id, dateStr, rushStartH, rushEndH)},
          bar_staff_id&&{id:bar_staff_id,role:'Bar',info:getStaffHours(bar_staff_id, dateStr, rushStartH, rushEndH)},
          floor_staff1_id&&{id:floor_staff1_id,role:'Floor',info:getStaffHours(floor_staff1_id, dateStr, rushStartH, rushEndH)},
          floor_staff2_id&&{id:floor_staff2_id,role:'Floor',info:getStaffHours(floor_staff2_id, dateStr, rushStartH, rushEndH)},`,
  `staff:[
          supervisor_id&&{id:supervisor_id,role:'Supervisor',info:sup1Info},
          supervisor2_id&&{id:supervisor2_id,role:'Supervisor',info:sup2Info},
          bar_staff_id&&{id:bar_staff_id,role:'Bar',info:getStaffHours(bar_staff_id,dateStr,rushStartH,rushEndH)},
          floor_staff1_id&&{id:floor_staff1_id,role:'Floor',info:getStaffHours(floor_staff1_id,dateStr,rushStartH,rushEndH)},
          floor_staff2_id&&{id:floor_staff2_id,role:'Floor',info:getStaffHours(floor_staff2_id,dateStr,rushStartH,rushEndH)},`
);

// Also fix allInfos to include sup2Info
ap = ap.replace(
  `const allInfos=[sup1Info,sup2Info,bar_staff_id?getStaffHours(bar_staff_id,dateStr,rushStartH,rushEndH):null,floor_staff1_id?getStaffHours(floor_staff1_id,dateStr,rushStartH,rushEndH):null,floor_staff2_id?getStaffHours(floor_staff2_id,dateStr,rushStartH,rushEndH):null].filter(Boolean)`,
  `const allInfos=[sup1Info,sup2Info,bar_staff_id?getStaffHours(bar_staff_id,dateStr,rushStartH,rushEndH):null,floor_staff1_id?getStaffHours(floor_staff1_id,dateStr,rushStartH,rushEndH):null,floor_staff2_id?getStaffHours(floor_staff2_id,dateStr,rushStartH,rushEndH):null].filter(Boolean)`
);

// Also fix assignedIds to include supervisor2_id
ap = ap.replace(
  `const assignedIds=new Set([supervisor_id,supervisor2_id,bar_staff_id,floor_staff1_id,floor_staff2_id].filter(Boolean))`,
  `const assignedIds=new Set([supervisor_id,supervisor2_id,bar_staff_id,floor_staff1_id,floor_staff2_id].filter(Boolean))`
);

// Fix bar/floor assignment to prefer rush coverage
ap = ap.replace(
  `      const barPool=byLeast(availBars.filter((id:string)=>id!==supervisor_id&&id!==supervisor2_id))
      const bar_staff_id=barPool[0]||null
      if(bar_staff_id)assignCount[bar_staff_id]=(assignCount[bar_staff_id]||0)+8

      const floor1Pool=byLeast(availFloors.filter((id:string)=>id!==supervisor_id&&id!==supervisor2_id&&id!==bar_staff_id))
      const floor_staff1_id=floor1Pool[0]||null
      if(floor_staff1_id)assignCount[floor_staff1_id]=(assignCount[floor_staff1_id]||0)+8

      const floor2Pool=byLeast(availFloors.filter((id:string)=>id!==supervisor_id&&id!==supervisor2_id&&id!==bar_staff_id&&id!==floor_staff1_id))
      const floor_staff2_id=floor2Pool[0]||null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`,
  `      // Assign bar/floor - prefer staff who cover rush hours
      const coversRush=(id:string)=>{
        const avail=getAvail(id)
        return avail.some((h:number)=>h>=rushStartH&&h<rushEndH)
      }
      const byRushThenLeast=(ids:string[])=>[...ids].sort((a:string,b:string)=>{
        const ar=coversRush(a)?0:1, br=coversRush(b)?0:1
        if(ar!==br)return ar-br
        return(assignCount[a]||0)-(assignCount[b]||0)
      })

      const excluded=new Set([supervisor_id,supervisor2_id].filter(Boolean))
      const barCandidates=byRushThenLeast(availBars.filter((id:string)=>!excluded.has(id)))
      const bar_staff_id=barCandidates[0]||null
      if(bar_staff_id)assignCount[bar_staff_id]=(assignCount[bar_staff_id]||0)+8

      const excluded2=new Set([supervisor_id,supervisor2_id,bar_staff_id].filter(Boolean))
      const floor1Candidates=byRushThenLeast(availFloors.filter((id:string)=>!excluded2.has(id)))
      const floor_staff1_id=floor1Candidates[0]||null
      if(floor_staff1_id)assignCount[floor_staff1_id]=(assignCount[floor_staff1_id]||0)+8

      const excluded3=new Set([supervisor_id,supervisor2_id,bar_staff_id,floor_staff1_id].filter(Boolean))
      const floor2Candidates=byRushThenLeast(availFloors.filter((id:string)=>!excluded3.has(id)))
      const floor_staff2_id=floor2Candidates[0]||null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");

// Verify
const check = ap.indexOf("supervisor2_id&&{id:supervisor2_id");
console.log("supervisor2 in staff array:", check > 0 ? "YES at " + check : "NO - MISSING");
