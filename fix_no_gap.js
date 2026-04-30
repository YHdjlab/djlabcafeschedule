const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// After all assignments, validate that every supervisor hour has at least 1 staff overlapping
// If gap exists, extend a staff shift to cover it
ap = ap.replace(
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
      }`,
  `      // Helper: force PM shift (4pm-12am) if staff has evening availability
      const forcePMForFloor2=(id:string|null)=>{
        if(!id)return null
        const avail=getAvail(id)
        const pmHours=avail.filter((h:number)=>h>=16&&h<=23)
        if(pmHours.length>=4){
          return{startH:16,endH:24,totalH:8,hours:pmHours}
        }
        return null
      }

      // Helper: extend a staff shift to cover supervisor gaps
      // Returns extended shift info if possible, otherwise original
      const extendToCoverSup=(staffId:string,baseShift:any,supStartH:number,supEndH:number)=>{
        if(!staffId||!baseShift)return baseShift
        const avail=getAvail(staffId)
        // Check if there are uncovered supervisor hours we could fill
        // Try extending shift end to cover up to supEndH
        let newEnd=baseShift.endH
        for(let h=baseShift.endH;h<=supEndH;h++){
          if(avail.includes(h))newEnd=h+1
          else break
        }
        // Try extending shift start to cover from supStartH
        let newStart=baseShift.startH
        for(let h=baseShift.startH-1;h>=supStartH;h--){
          if(avail.includes(h))newStart=h
          else break
        }
        if(newStart!==baseShift.startH||newEnd!==baseShift.endH){
          return{startH:newStart,endH:newEnd,totalH:newEnd-newStart,hours:avail.filter((x:number)=>x>=newStart&&x<newEnd)}
        }
        return baseShift
      }`
);

// Apply gap-coverage extension to bar and floor staff shifts based on supervisor windows
// Find the line that builds the staff array and wrap shift calculations
ap = ap.replace(
  `          bar_staff_id&&{id:bar_staff_id,role:'Bar',info:getStaffHours(bar_staff_id,dateStr,rushStartH,rushEndH)},
          floor_staff1_id&&{id:floor_staff1_id,role:'Floor',info:(isFlexible(floor_staff1_id)?forcePMForFloor2(floor_staff1_id):null)||getStaffHours(floor_staff1_id,dateStr,rushStartH,rushEndH)},
          floor_staff2_id&&{id:floor_staff2_id,role:'Floor',info:(isFlexible(floor_staff2_id)?forcePMForFloor2(floor_staff2_id):null)||getStaffHours(floor_staff2_id,dateStr,rushStartH,rushEndH)},`,
  `          (()=>{
            if(!bar_staff_id)return null
            let info=getStaffHours(bar_staff_id,dateStr,rushStartH,rushEndH)
            // Extend bar shift to cover sup1 gap if possible
            if(sup1Info)info=extendToCoverSup(bar_staff_id,info,sup1Info.startH,sup1Info.endH)
            return{id:bar_staff_id,role:'Bar',info}
          })(),
          (()=>{
            if(!floor_staff1_id)return null
            let info=(isFlexible(floor_staff1_id)?forcePMForFloor2(floor_staff1_id):null)||getStaffHours(floor_staff1_id,dateStr,rushStartH,rushEndH)
            // Extend floor1 shift to cover sup2 gap if possible
            if(sup2Info)info=extendToCoverSup(floor_staff1_id,info,sup2Info.startH,sup2Info.endH)
            return{id:floor_staff1_id,role:'Floor',info}
          })(),
          (()=>{
            if(!floor_staff2_id)return null
            let info=(isFlexible(floor_staff2_id)?forcePMForFloor2(floor_staff2_id):null)||getStaffHours(floor_staff2_id,dateStr,rushStartH,rushEndH)
            return{id:floor_staff2_id,role:'Floor',info}
          })(),`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
