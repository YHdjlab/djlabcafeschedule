const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// After all staff shifts are computed, do a final gap-filling pass
// For each hour where supervisor is present but no staff, extend a flexible staff's shift
// to cover that hour
ap = ap.replace(
  `      // Helper: extend a staff shift to cover supervisor gaps
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
      }`,
  `      // Helper: extend a staff shift to cover supervisor gaps
      // Returns extended shift info if possible, otherwise original
      const extendToCoverSup=(staffId:string,baseShift:any,supStartH:number,supEndH:number)=>{
        if(!staffId||!baseShift)return baseShift
        const avail=getAvail(staffId)
        let newEnd=baseShift.endH
        for(let h=baseShift.endH;h<=supEndH;h++){
          if(avail.includes(h))newEnd=h+1
          else break
        }
        let newStart=baseShift.startH
        for(let h=baseShift.startH-1;h>=supStartH;h--){
          if(avail.includes(h))newStart=h
          else break
        }
        if(newStart!==baseShift.startH||newEnd!==baseShift.endH){
          return{startH:newStart,endH:newEnd,totalH:newEnd-newStart,hours:avail.filter((x:number)=>x>=newStart&&x<newEnd)}
        }
        return baseShift
      }

      // Helper: extend a staff shift backward to cover gap (start earlier)
      // Used when there's a hole between AM staff ending and PM staff starting
      const extendBackward=(staffId:string,baseShift:any,targetStartH:number)=>{
        if(!staffId||!baseShift)return baseShift
        const avail=getAvail(staffId)
        let newStart=baseShift.startH
        for(let h=baseShift.startH-1;h>=targetStartH;h--){
          if(avail.includes(h))newStart=h
          else break
        }
        if(newStart!==baseShift.startH){
          return{startH:newStart,endH:baseShift.endH,totalH:baseShift.endH-newStart,hours:avail.filter((x:number)=>x>=newStart&&x<baseShift.endH)}
        }
        return baseShift
      }`
);

// Apply backward extension to PM staff to fill the AM-PM gap
// floor1 (Lucciana usually) and floor2 (Cynthia usually) should pull their start earlier
// to meet wherever the bar staff ends
ap = ap.replace(
  `          (()=>{
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
          })(),`,
  `          (()=>{
            if(!floor_staff1_id)return null
            let info=(isFlexible(floor_staff1_id)?forcePMForFloor2(floor_staff1_id):null)||getStaffHours(floor_staff1_id,dateStr,rushStartH,rushEndH)
            if(sup2Info)info=extendToCoverSup(floor_staff1_id,info,sup2Info.startH,sup2Info.endH)
            // Pull start earlier to meet bar shift end (no AM-PM gap)
            if(bar_staff_id&&info){
              const barShift=getStaffHours(bar_staff_id,dateStr,rushStartH,rushEndH)
              if(barShift&&barShift.endH<info.startH){
                info=extendBackward(floor_staff1_id,info,barShift.endH)
              }
            }
            return{id:floor_staff1_id,role:'Floor',info}
          })(),
          (()=>{
            if(!floor_staff2_id)return null
            let info=(isFlexible(floor_staff2_id)?forcePMForFloor2(floor_staff2_id):null)||getStaffHours(floor_staff2_id,dateStr,rushStartH,rushEndH)
            // Pull start earlier to meet bar shift end (no AM-PM gap)
            if(bar_staff_id&&info){
              const barShift=getStaffHours(bar_staff_id,dateStr,rushStartH,rushEndH)
              if(barShift&&barShift.endH<info.startH){
                info=extendBackward(floor_staff2_id,info,barShift.endH)
              }
            }
            return{id:floor_staff2_id,role:'Floor',info}
          })(),`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
