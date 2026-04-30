const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Move forcePMForFloor2 declaration to BEFORE bar/floor assignment
// First remove it from current location
const oldDecl = `      // Override floor_staff2 shift to PM if they have evening availability
      // This creates the rush-hour double coverage
      const forcePMForFloor2=(id:string|null)=>{
        if(!id)return null
        const avail=getAvail(id)
        const eveningHours=avail.filter((h:number)=>h>=16&&h<=23)
        if(eveningHours.length>=4){
          return{startH:eveningHours[0],endH:eveningHours[eveningHours.length-1]+1,totalH:eveningHours[eveningHours.length-1]+1-eveningHours[0],hours:eveningHours}
        }
        return null
      }`;

ap = ap.replace(oldDecl, "");

// Now insert it BEFORE the bar_staff_id assignment
ap = ap.replace(
  `      const bar_staff_id=sortedPool[0]||null
      if(bar_staff_id)assignCount[bar_staff_id]=(assignCount[bar_staff_id]||0)+8`,
  `      // Helper: force PM shift if staff has evening availability
      const forcePMForFloor2=(id:string|null)=>{
        if(!id)return null
        const avail=getAvail(id)
        const eveningHours=avail.filter((h:number)=>h>=16&&h<=23)
        if(eveningHours.length>=4){
          return{startH:eveningHours[0],endH:eveningHours[eveningHours.length-1]+1,totalH:eveningHours[eveningHours.length-1]+1-eveningHours[0],hours:eveningHours}
        }
        return null
      }

      const bar_staff_id=sortedPool[0]||null
      if(bar_staff_id)assignCount[bar_staff_id]=(assignCount[bar_staff_id]||0)+8`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
