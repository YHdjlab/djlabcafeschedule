const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Replace entire supervisor assignment block
ap = ap.replace(
  `      const isSup=(id:string)=>['supervisor','supervisor_floor','supervisor_bar'].includes(STAFF_MAP[id]?.role)
      const availSups=byLeast(availStaff.filter(isSup))
      const availBars=byLeast(availStaff.filter(id=>STAFF_MAP[id]?.role==='bar'))
      const availFloors=byLeast(availStaff.filter(id=>STAFF_MAP[id]?.role==='floor'))

      // Assign primary supervisor (best rush coverage)
      const getShift=(id:string)=>getStaffHours(id,dateStr,rushStartH,rushEndH)
      const supervisor_id=availSups[0]||null
      if(supervisor_id)assignCount[supervisor_id]=(assignCount[supervisor_id]||0)+8

      // Always try to assign a second supervisor for full-day coverage
      // sup1 does AM/MID, sup2 does the remaining window
      const sup1Shift=supervisor_id?getShift(supervisor_id):null
      const supervisor2_id=availSups.length>1?(()=>{
        // Find sup that covers different hours than sup1
        for(const id of availSups){
          if(id===supervisor_id)continue
          const sh=getShift(id)
          if(!sh)continue
          // Prefer someone whose shift doesn't fully overlap with sup1
          if(!sup1Shift)return id
          const overlapH=Math.max(0,Math.min(sup1Shift.endH,sh.endH)-Math.max(sup1Shift.startH,sh.startH))
          if(overlapH<4)return id // less than 4h overlap = good split
        }
        // If no good split found, still assign second sup for redundancy on weekends
        if(isWeekend&&availSups.length>1){
          return availSups.find((id:string)=>id!==supervisor_id)||null
        }
        return null
      })():null
      if(supervisor2_id)assignCount[supervisor2_id]=(assignCount[supervisor2_id]||0)+8`,

  `      const isSup=(id:string)=>['supervisor','supervisor_floor','supervisor_bar'].includes(STAFF_MAP[id]?.role)
      const availSups=byLeast(availStaff.filter(isSup))
      const availBars=byLeast(availStaff.filter(id=>STAFF_MAP[id]?.role==='bar'))
      const availFloors=byLeast(availStaff.filter(id=>STAFF_MAP[id]?.role==='floor'))

      // Get available hours array for a staff member
      const getAvail=(id:string)=>weekAvailability.filter((a:any)=>a.staff_id===id&&a.slot_date===dateStr).map((a:any)=>{const m=a.slot_key.match(/_h(\\d+)$/);return m?parseInt(m[1]):-1}).filter((h:number)=>h>=0).sort((a:number,b:number)=>a-b)

      // Assign supervisors with forced AM/PM split when both available
      let supervisor_id:string|null=null
      let supervisor2_id:string|null=null

      if(availSups.length===0){
        // no supervisors
      } else if(availSups.length===1){
        supervisor_id=availSups[0]
        assignCount[supervisor_id]=(assignCount[supervisor_id]||0)+8
      } else {
        // Try to split: one AM (8-16), one PM (16-24)
        const sup0=availSups[0], sup1=availSups[1]
        const avail0=getAvail(sup0), avail1=getAvail(sup1)
        const sup0HasAM=avail0.filter(h=>h>=8&&h<16).length>=4
        const sup0HasPM=avail0.filter(h=>h>=16&&h<24).length>=4
        const sup1HasAM=avail1.filter(h=>h>=8&&h<16).length>=4
        const sup1HasPM=avail1.filter(h=>h>=16&&h<24).length>=4

        if(sup0HasAM&&sup1HasPM){
          // sup0 AM, sup1 PM
          supervisor_id=sup0; supervisor2_id=sup1
        } else if(sup1HasAM&&sup0HasPM){
          // sup1 AM, sup0 PM
          supervisor_id=sup1; supervisor2_id=sup0
        } else if(sup0HasAM&&sup0HasPM&&sup1HasAM&&sup1HasPM){
          // Both fully flexible - force split: byLeast[0] gets AM, byLeast[1] gets PM
          supervisor_id=sup0; supervisor2_id=sup1
        } else {
          // Can't split cleanly - just assign whoever covers rush
          supervisor_id=availSups[0]
        }
        if(supervisor_id)assignCount[supervisor_id]=(assignCount[supervisor_id]||0)+8
        if(supervisor2_id)assignCount[supervisor2_id]=(assignCount[supervisor2_id]||0)+8
      }

      // Override getStaffHours for split supervisors to force AM/PM
      const getShiftForSup=(id:string,forceAM:boolean,forcePM:boolean)=>{
        const avail=getAvail(id)
        if(!avail.length)return null
        if(forceAM){const hrs=avail.filter(h=>h>=8&&h<16);if(hrs.length)return{startH:hrs[0],endH:hrs[hrs.length-1]+1,totalH:hrs[hrs.length-1]+1-hrs[0],hours:hrs}}
        if(forcePM){const hrs=avail.filter(h=>h>=16&&h<24);if(hrs.length)return{startH:hrs[0],endH:hrs[hrs.length-1]+1,totalH:hrs[hrs.length-1]+1-hrs[0],hours:hrs}}
        return getStaffHours(id,dateStr,rushStartH,rushEndH)
      }
      const bothFlexible=availSups.length>=2
      const sup1Info=supervisor_id?getShiftForSup(supervisor_id,bothFlexible,false):null
      const sup2Info=supervisor2_id?getShiftForSup(supervisor2_id,false,bothFlexible):null`
);

// Update staff array to use sup1Info and sup2Info
ap = ap.replace(
  `        staff:[
          supervisor_id&&{id:supervisor_id,role:'Supervisor',info:getStaffHours(supervisor_id,dateStr,rushStartH,rushEndH)},
          supervisor2_id&&{id:supervisor2_id,role:'Supervisor',info:getStaffHours(supervisor2_id,dateStr,rushStartH,rushEndH)},`,
  `        staff:[
          supervisor_id&&{id:supervisor_id,role:'Supervisor',info:sup1Info},
          supervisor2_id&&{id:supervisor2_id,role:'Supervisor',info:sup2Info},`
);

// Update allInfos to use sup1Info and sup2Info
ap = ap.replace(
  `      const allInfos=[supervisor_id,bar_staff_id,floor_staff1_id,floor_staff2_id].filter(Boolean).map(id=>getStaffHours(id!,dateStr,rushStartH,rushEndH)).filter(Boolean)`,
  `      const allInfos=[sup1Info,sup2Info,bar_staff_id?getStaffHours(bar_staff_id,dateStr,rushStartH,rushEndH):null,floor_staff1_id?getStaffHours(floor_staff1_id,dateStr,rushStartH,rushEndH):null,floor_staff2_id?getStaffHours(floor_staff2_id,dateStr,rushStartH,rushEndH):null].filter(Boolean)`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
