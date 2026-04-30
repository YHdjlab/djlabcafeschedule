const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Strong bonus for shifts ending at close (24)
ap = ap.replace(
  `      const rushCovered=covered.filter((h:number)=>h>=rushStartH&&h<rushEndH).length
      // Rush coverage is HEAVILY weighted - shifts that span rush win
      // Close bonus < rush coverage so PM shift wins for fully flexible staff
      const closeBonus=shift.e===24?2:0
      const openBonus=shift.s===8?1:0
      const score=rushCovered*10+covered.length+closeBonus+openBonus`,
  `      const rushCovered=covered.filter((h:number)=>h>=rushStartH&&h<rushEndH).length
      // Closing time alignment is critical - if shift ends at 24, big bonus
      // Opens-at-8 also gets bonus for opening shifts
      const closeBonus=shift.e===24?15:0  // strong - prefer ending at close
      const openBonus=shift.s===8?5:0     // moderate - prefer opening at 8
      const score=rushCovered*10+covered.length+closeBonus+openBonus`
);

// Also update forcePMForFloor2 to prefer 16-24 window over 15-23
ap = ap.replace(
  `      // Helper: force PM shift if staff has evening availability
      const forcePMForFloor2=(id:string|null)=>{
        if(!id)return null
        const avail=getAvail(id)
        const eveningHours=avail.filter((h:number)=>h>=16&&h<=23)
        if(eveningHours.length>=4){
          return{startH:eveningHours[0],endH:eveningHours[eveningHours.length-1]+1,totalH:eveningHours[eveningHours.length-1]+1-eveningHours[0],hours:eveningHours}
        }
        return null
      }`,
  `      // Helper: force PM shift (4pm-12am) if staff has evening availability
      const forcePMForFloor2=(id:string|null)=>{
        if(!id)return null
        const avail=getAvail(id)
        // Strict 4pm-12am window (16-23)
        const pmHours=avail.filter((h:number)=>h>=16&&h<=23)
        if(pmHours.length>=4){
          return{startH:16,endH:24,totalH:8,hours:pmHours}
        }
        return null
      }`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
