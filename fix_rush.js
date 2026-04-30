const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix 1: endH should be hours[last]+1 not hours[last] - hour 23 means working 23-24 = ends at 24 (12am)
// Actually look at code: endH:hrs[hrs.length-1]+1 - this is correct
// The issue is the SHIFT options: PM is {s:16,e:24} - so PM shift should pick hour 16 onward
// For Lucciana available 15-23: AM filter (8-16) catches only 15 = 1h, fails 4h threshold
// MID (12-20) catches 15,16,17,18,19 = 5h ✓
// 15-23 (new) catches 15-22 = 8h ✓ - this gets picked
// So she's getting 15-23 which displays as 3pm-11pm
// 
// SOLUTION: prefer shifts that end at closing time (24) over ones that don't
// Update SHIFTS to prioritize shifts ending at close

ap = ap.replace(
  `    const SHIFTS=[{s:8,e:16},{s:12,e:20},{s:15,e:23},{s:16,e:24}]`,
  `    // Prefer shifts that align with opening (8) or closing (24)
    const SHIFTS=[{s:8,e:16},{s:16,e:24},{s:8,e:14},{s:18,e:24},{s:12,e:20}]`
);

// Update scoring to give bonus for shifts ending at close (24) when there's evening rush
ap = ap.replace(
  `      const rushCovered=covered.filter((h:number)=>h>=rushStartH&&h<rushEndH).length
      const score=covered.length+rushCovered*2`,
  `      const rushCovered=covered.filter((h:number)=>h>=rushStartH&&h<rushEndH).length
      // Bonus for shifts that end at close (24) - keeps people till closing
      const closeBonus=shift.e===24?3:0
      // Bonus for shifts starting at open (8)
      const openBonus=shift.s===8?2:0
      const score=covered.length+rushCovered*3+closeBonus+openBonus`
);

// Fix 2: Add 2nd floor staff during weekday rush (not just weekends)
// Rush days = 3pm-9pm has 4+ hours of rush coverage potential
ap = ap.replace(
  `      const floor_staff2_id=isWeekend?(sortedPool[2]||null):null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`,
  `      // Add 2nd floor staff if:
      // - Weekend (full rush)
      // - OR there's a 3rd person available who covers rush hours significantly
      const thirdPerson=sortedPool[2]
      const thirdCoversRush=thirdPerson?(()=>{
        const av=getAvail(thirdPerson)
        return av.filter((h:number)=>h>=rushStartH&&h<rushEndH).length>=3
      })():false
      const floor_staff2_id=isWeekend?(sortedPool[2]||null):(thirdCoversRush?thirdPerson:null)
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
