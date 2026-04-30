const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Replace floor_staff2 selection with smarter logic
// Only pick floor_staff2 if they ADD rush coverage beyond what's already assigned
ap = ap.replace(
  `      // Floor staff 2 - the 3rd person should DOUBLE UP during rush hours
      // Pick whoever's best, but FORCE them to PM shift if they have evening availability
      const floor_staff2_id=sortedPool[2]||null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`,
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
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
