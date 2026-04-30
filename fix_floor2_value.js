const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Update floor_staff2 selection: skip if their hours overlap entirely with already-assigned staff
// We want floor_staff2 to ADD coverage, not duplicate it
ap = ap.replace(
  `      // Floor staff 2 - the 3rd person MUST add rush coverage
      // Skip if no candidate covers rush hours that aren't already covered by floor1
      const candidatesFor2=sortedPool.slice(2)
      // Among remaining candidates, pick the one with most rush hour availability
      const best2=candidatesFor2.sort((a:string,b:string)=>{
        const aRush=getAvail(a).filter((h:number)=>h>=rushStartH&&h<rushEndH).length
        const bRush=getAvail(b).filter((h:number)=>h>=rushStartH&&h<rushEndH).length
        if(aRush!==bRush)return bRush-aRush
        // Then by evening hours (16-24)
        const aEve=getAvail(a).filter((h:number)=>h>=16).length
        const bEve=getAvail(b).filter((h:number)=>h>=16).length
        return bEve-aEve
      })[0]||null

      // Only assign floor_staff2 if they add real rush value
      // Skip if they have <2 rush hours (off-rush is fine with just 2 staff)
      const candidate2RushHours=best2?getAvail(best2).filter((h:number)=>h>=rushStartH&&h<rushEndH).length:0
      const floor_staff2_id=candidate2RushHours>=2?best2:null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`,

  `      // Floor staff 2 - must ADD coverage that isn't already provided by bar+floor1
      // Calculate which hours are already covered by bar_staff and floor_staff1
      const coveredHours=new Set<number>()
      if(bar_staff_id){
        const barShift=getStaffHours(bar_staff_id,dateStr,rushStartH,rushEndH)
        if(barShift)for(let h=barShift.startH;h<barShift.endH;h++)coveredHours.add(h)
      }
      if(floor_staff1_id){
        const f1Shift=forcePMForFloor2(floor_staff1_id)||getStaffHours(floor_staff1_id,dateStr,rushStartH,rushEndH)
        if(f1Shift)for(let h=f1Shift.startH;h<f1Shift.endH;h++)coveredHours.add(h)
      }

      // Pick floor_staff2 that adds NEW rush coverage
      const candidatesFor2=sortedPool.slice(2)
      const best2=candidatesFor2.sort((a:string,b:string)=>{
        // Score by: NEW rush hours added (rush hours not yet covered)
        const aNewRush=getAvail(a).filter((h:number)=>h>=rushStartH&&h<rushEndH&&!coveredHours.has(h)).length
        const bNewRush=getAvail(b).filter((h:number)=>h>=rushStartH&&h<rushEndH&&!coveredHours.has(h)).length
        if(aNewRush!==bNewRush)return bNewRush-aNewRush
        // Then by adding rush coverage (doubling up)
        const aRush=getAvail(a).filter((h:number)=>h>=rushStartH&&h<rushEndH).length
        const bRush=getAvail(b).filter((h:number)=>h>=rushStartH&&h<rushEndH).length
        return bRush-aRush
      })[0]||null

      // Only assign floor_staff2 if they truly add value:
      // - They cover new rush hours (gap fill), OR
      // - They cover at least 3 rush hours (double-up worth it)
      const newRushHours=best2?getAvail(best2).filter((h:number)=>h>=rushStartH&&h<rushEndH&&!coveredHours.has(h)).length:0
      const totalRushHours=best2?getAvail(best2).filter((h:number)=>h>=rushStartH&&h<rushEndH).length:0
      const floor_staff2_id=(newRushHours>=2||totalRushHours>=3)?best2:null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
