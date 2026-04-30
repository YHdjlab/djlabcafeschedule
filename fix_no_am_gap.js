const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix the two-pass: if no AM-only staff, push first flexible person to AM
// And if no PM-only, push first flexible to PM
// Order: AM person (any), then PM people (rest)
ap = ap.replace(
  `      // Build sorted pool: best AM-only person, best PM-only person, then flexible by score
      const sortedPool:string[]=[]
      if(amOnlyStaff[0])sortedPool.push(amOnlyStaff[0]) // bar slot - AM opener
      if(pmOnlyStaff[0])sortedPool.push(pmOnlyStaff[0]) // floor1 slot - PM rush
      // Then add flexible staff (they'll go to PM via forcePMForFloor2)
      flexStaff.forEach(id=>{if(!sortedPool.includes(id))sortedPool.push(id)})
      // Then any remaining AM/PM only staff
      amOnlyStaff.slice(1).forEach(id=>{if(!sortedPool.includes(id))sortedPool.push(id)})
      pmOnlyStaff.slice(1).forEach(id=>{if(!sortedPool.includes(id))sortedPool.push(id)})`,

  `      // Build sorted pool ensuring AM coverage exists
      const sortedPool:string[]=[]
      
      // Slot 0 (BAR) - someone to cover AM opening
      // Prefer AM-only person, fall back to flexible
      const amPerson=amOnlyStaff[0]||flexStaff[0]
      if(amPerson)sortedPool.push(amPerson)
      
      // Slot 1 (FLOOR1) - someone to cover PM rush
      // Prefer PM-only person, fall back to next flexible
      const pmPerson=pmOnlyStaff[0]||flexStaff.find(id=>id!==amPerson)
      if(pmPerson&&!sortedPool.includes(pmPerson))sortedPool.push(pmPerson)
      
      // Slot 2 (FLOOR2) - second PM person for rush double-up
      // Prefer remaining flexible, then PM-only
      const pmPerson2=flexStaff.find(id=>!sortedPool.includes(id))||pmOnlyStaff.find(id=>!sortedPool.includes(id))
      if(pmPerson2&&!sortedPool.includes(pmPerson2))sortedPool.push(pmPerson2)
      
      // Then everyone else
      ;[...amOnlyStaff,...pmOnlyStaff,...flexStaff].forEach(id=>{
        if(!sortedPool.includes(id))sortedPool.push(id)
      })`
);

// Also: when bar staff is FLEXIBLE (not AM-only), they should default to AM (8-16) shift
// not get forced to PM via forcePMForFloor2 (that's for floor only)
// The bar staff already gets natural shift via getStaffHours - no override needed
// But scoring picks PM as best for flexible - we need to override this for BAR slot

// Add a "force AM" helper for bar staff that's flexible
ap = ap.replace(
  `      // Helper: force PM shift (4pm-12am) if staff has evening availability
      const forcePMForFloor2=(id:string|null)=>{`,
  `      // Helper: force AM shift (8am-4pm) for flexible staff in BAR slot
      const forceAMForBar=(id:string|null)=>{
        if(!id)return null
        const avail=getAvail(id)
        const amHours=avail.filter((h:number)=>h>=8&&h<=15)
        if(amHours.length>=4){
          return{startH:8,endH:16,totalH:8,hours:amHours}
        }
        return null
      }

      // Helper: force PM shift (4pm-12am) if staff has evening availability
      const forcePMForFloor2=(id:string|null)=>{`
);

// Apply forceAMForBar to bar_staff if they're FLEXIBLE
ap = ap.replace(
  `          (()=>{
            if(!bar_staff_id)return null
            let info=getStaffHours(bar_staff_id,dateStr,rushStartH,rushEndH)
            // Extend bar shift to cover sup1 gap if possible
            if(sup1Info)info=extendToCoverSup(bar_staff_id,info,sup1Info.startH,sup1Info.endH)
            return{id:bar_staff_id,role:'Bar',info}
          })(),`,
  `          (()=>{
            if(!bar_staff_id)return null
            // If bar staff is flexible, force AM shift (covers opening)
            // Otherwise use their natural best shift
            let info=(isFlexible(bar_staff_id)?forceAMForBar(bar_staff_id):null)||getStaffHours(bar_staff_id,dateStr,rushStartH,rushEndH)
            // Extend bar shift to cover sup1 gap if possible
            if(sup1Info)info=extendToCoverSup(bar_staff_id,info,sup1Info.startH,sup1Info.endH)
            return{id:bar_staff_id,role:'Bar',info}
          })(),`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
