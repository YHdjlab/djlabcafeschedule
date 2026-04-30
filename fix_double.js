const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Make PM shifts win in shift selection - sort SHIFTS so PM-rush ones come first
ap = ap.replace(
  `    // Prefer shifts that align with opening (8) or closing (24)
    const SHIFTS=[{s:8,e:16},{s:16,e:24},{s:8,e:14},{s:18,e:24},{s:12,e:20}]`,
  `    // Default shift options - rush coverage will be the deciding score
    const SHIFTS=[{s:16,e:24},{s:8,e:16},{s:12,e:20},{s:15,e:23},{s:18,e:24}]`
);

// Override: when assigning floor_staff2 (the 3rd person on duty), 
// force them to take PM shift if they're available for it (double-up during rush)
ap = ap.replace(
  `      // Rush hours always need 2 floor staff (1 sup + 1 bar + 2 floor)
      // Off-rush hours only need 1 staff total
      // Since the day spans both, we always assign 2 floor when a 3rd person is available
      const floor_staff2_id=sortedPool[2]||null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8`,
  `      // Floor staff 2 - the 3rd person should DOUBLE UP during rush hours
      // Pick whoever's best, but FORCE them to PM shift if they have evening availability
      const floor_staff2_id=sortedPool[2]||null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8

      // Override floor_staff2 shift to PM if they have evening availability
      // This creates the rush-hour double coverage
      const forcePMForFloor2=(id:string|null)=>{
        if(!id)return null
        const avail=getAvail(id)
        const eveningHours=avail.filter((h:number)=>h>=16&&h<=23)
        if(eveningHours.length>=4){
          return{startH:eveningHours[0],endH:eveningHours[eveningHours.length-1]+1,totalH:eveningHours[eveningHours.length-1]+1-eveningHours[0],hours:eveningHours}
        }
        return null
      }`
);

// Apply the PM override in the staff array building
ap = ap.replace(
  `          floor_staff2_id&&{id:floor_staff2_id,role:'Floor',info:getStaffHours(floor_staff2_id,dateStr,rushStartH,rushEndH)},`,
  `          floor_staff2_id&&{id:floor_staff2_id,role:'Floor',info:forcePMForFloor2(floor_staff2_id)||getStaffHours(floor_staff2_id,dateStr,rushStartH,rushEndH)},`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
