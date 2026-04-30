const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Update scoring: penalize fully-flexible staff for AM-only assignments
// We want flexible staff to go PM (where rush is) and AM-only staff to fill AM
// 
// New rule: when scoring, BOOST staff who can ONLY do PM or have evening hours
// This pushes them to be picked first (top of pool = bar slot = often AM)
// Actually we want the OPPOSITE - rigid staff go to slots first, flexible staff fill rush

// Better approach: change WHICH slot people go in
// Slot 0 (bar) = currently top scorer = often AM opener
// Slot 1 (floor1) = currently #2 scorer
// Slot 2 (floor2) = currently #3 with PM force

// New approach: do TWO passes
// Pass 1: identify AM-only and PM-only staff (rigid availability) - assign them to their slot
// Pass 2: assign flexible staff to fill remaining slots, preferring PM rush coverage

ap = ap.replace(
  `      const sortedPool=availStaff.filter((id:string)=>!excludedSet.has(id)).sort((a:string,b:string)=>scoreStaff(b)-scoreStaff(a))
      console.log(day,'scores:',sortedPool.map((id:string)=>STAFF_MAP[id]?.full_name+':'+scoreStaff(id)))`,
  `      // Two-pass assignment: rigid staff first, then flexible staff
      // Rigid AM-only = available 8-15 but not 16-24
      // Rigid PM-only = available 16-24 but not 8-15  
      // Flexible = available both AM and PM
      const isAMOnly=(id:string)=>{
        const av=getAvail(id)
        const am=av.filter((h:number)=>h>=8&&h<16).length
        const pm=av.filter((h:number)=>h>=16&&h<24).length
        return am>=4&&pm<4
      }
      const isPMOnly=(id:string)=>{
        const av=getAvail(id)
        const am=av.filter((h:number)=>h>=8&&h<16).length
        const pm=av.filter((h:number)=>h>=16&&h<24).length
        return pm>=4&&am<4
      }
      const isFlexible=(id:string)=>{
        const av=getAvail(id)
        const am=av.filter((h:number)=>h>=8&&h<16).length
        const pm=av.filter((h:number)=>h>=16&&h<24).length
        return am>=4&&pm>=4
      }

      const pool=availStaff.filter((id:string)=>!excludedSet.has(id))
      
      // Sort: AM-only people get priority for AM slot (since they have no choice)
      // PM-only people get priority for PM slot
      // Flexible people fill remaining slots, preferring PM (rush)
      const amOnlyStaff=pool.filter(isAMOnly).sort((a:string,b:string)=>scoreStaff(b)-scoreStaff(a))
      const pmOnlyStaff=pool.filter(isPMOnly).sort((a:string,b:string)=>scoreStaff(b)-scoreStaff(a))
      const flexStaff=pool.filter(isFlexible).sort((a:string,b:string)=>scoreStaff(b)-scoreStaff(a))

      // Build sorted pool: best AM-only person, best PM-only person, then flexible by score
      const sortedPool:string[]=[]
      if(amOnlyStaff[0])sortedPool.push(amOnlyStaff[0]) // bar slot - AM opener
      if(pmOnlyStaff[0])sortedPool.push(pmOnlyStaff[0]) // floor1 slot - PM rush
      // Then add flexible staff (they'll go to PM via forcePMForFloor2)
      flexStaff.forEach(id=>{if(!sortedPool.includes(id))sortedPool.push(id)})
      // Then any remaining AM/PM only staff
      amOnlyStaff.slice(1).forEach(id=>{if(!sortedPool.includes(id))sortedPool.push(id)})
      pmOnlyStaff.slice(1).forEach(id=>{if(!sortedPool.includes(id))sortedPool.push(id)})

      console.log(day,'sortedPool:',sortedPool.map((id:string)=>STAFF_MAP[id]?.full_name+'('+(isAMOnly(id)?'AM':isPMOnly(id)?'PM':'FLEX')+')'))`
);

// Also: force PM for any FLEX staff in floor1 or floor2 slots
ap = ap.replace(
  `          floor_staff1_id&&{id:floor_staff1_id,role:'Floor',info:forcePMForFloor2(floor_staff1_id)||getStaffHours(floor_staff1_id,dateStr,rushStartH,rushEndH)},
          floor_staff2_id&&{id:floor_staff2_id,role:'Floor',info:forcePMForFloor2(floor_staff2_id)||getStaffHours(floor_staff2_id,dateStr,rushStartH,rushEndH)},`,
  `          floor_staff1_id&&{id:floor_staff1_id,role:'Floor',info:(isFlexible(floor_staff1_id)?forcePMForFloor2(floor_staff1_id):null)||getStaffHours(floor_staff1_id,dateStr,rushStartH,rushEndH)},
          floor_staff2_id&&{id:floor_staff2_id,role:'Floor',info:(isFlexible(floor_staff2_id)?forcePMForFloor2(floor_staff2_id):null)||getStaffHours(floor_staff2_id,dateStr,rushStartH,rushEndH)},`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
