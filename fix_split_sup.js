const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Replace the supervisor assignment logic to support split coverage
ap = ap.replace(
  `      const availSups=byLeast(availStaff.filter(id=>['supervisor','supervisor_floor','supervisor_bar'].includes(STAFF_MAP[id]?.role)))
      const availBars=byLeast(availStaff.filter(id=>['bar'].includes(STAFF_MAP[id]?.role)))
      const availFloors=byLeast(availStaff.filter(id=>['floor'].includes(STAFF_MAP[id]?.role)))
      const allNonSup=byLeast(availStaff.filter(id=>STAFF_MAP[id]?.role!=='supervisor'))

      const supervisor_id=availSups[0]||null
      if(supervisor_id)assignCount[supervisor_id]=(assignCount[supervisor_id]||0)+8

      const barPool=byLeast(availBars.filter(id=>id!==supervisor_id))
      const bar_staff_id=barPool[0]||null
      if(bar_staff_id)assignCount[bar_staff_id]=(assignCount[bar_staff_id]||0)+8

      const floor1Pool=byLeast(availFloors.filter(id=>id!==supervisor_id&&id!==bar_staff_id))
      const floor_staff1_id=floor1Pool[0]||null
      if(floor_staff1_id)assignCount[floor_staff1_id]=(assignCount[floor_staff1_id]||0)+8

      const floor2Pool=byLeast(availFloors.filter(id=>id!==supervisor_id&&id!==bar_staff_id&&id!==floor_staff1_id))
      const floor_staff2_id=floor2Pool[0]||null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8

      const issues:string[]=[]
      if(!supervisor_id)issues.push('No supervisor available')
      if(!bar_staff_id)issues.push('No bar staff')
      if(!floor_staff1_id)issues.push('No floor staff')`,

  `      const isSup=(id:string)=>['supervisor','supervisor_floor','supervisor_bar'].includes(STAFF_MAP[id]?.role)
      const availSups=byLeast(availStaff.filter(isSup))
      const availBars=byLeast(availStaff.filter(id=>STAFF_MAP[id]?.role==='bar'))
      const availFloors=byLeast(availStaff.filter(id=>STAFF_MAP[id]?.role==='floor'))

      // Assign primary supervisor (best rush coverage)
      const getShift=(id:string)=>getStaffHours(id,dateStr,rushStartH,rushEndH)
      const supervisor_id=availSups[0]||null
      if(supervisor_id)assignCount[supervisor_id]=(assignCount[supervisor_id]||0)+8

      // Assign secondary supervisor if first doesn't cover full day
      // e.g. Miled 8-16, JP 16-24
      const sup1Shift=supervisor_id?getShift(supervisor_id):null
      const needsSecondSup=!sup1Shift||(sup1Shift.startH>8&&sup1Shift.endH<23)
      const supervisor2_id=needsSecondSup?availSups.find((id:string)=>{
        if(id===supervisor_id)return false
        const sh=getShift(id)
        if(!sh)return false
        // Check if this supervisor covers hours not covered by first
        if(!sup1Shift)return true
        return sh.startH<sup1Shift.startH||sh.endH>sup1Shift.endH
      })||null:null
      if(supervisor2_id)assignCount[supervisor2_id]=(assignCount[supervisor2_id]||0)+8

      const barPool=byLeast(availBars.filter((id:string)=>id!==supervisor_id&&id!==supervisor2_id))
      const bar_staff_id=barPool[0]||null
      if(bar_staff_id)assignCount[bar_staff_id]=(assignCount[bar_staff_id]||0)+8

      const floor1Pool=byLeast(availFloors.filter((id:string)=>id!==supervisor_id&&id!==supervisor2_id&&id!==bar_staff_id))
      const floor_staff1_id=floor1Pool[0]||null
      if(floor_staff1_id)assignCount[floor_staff1_id]=(assignCount[floor_staff1_id]||0)+8

      const floor2Pool=byLeast(availFloors.filter((id:string)=>id!==supervisor_id&&id!==supervisor2_id&&id!==bar_staff_id&&id!==floor_staff1_id))
      const floor_staff2_id=floor2Pool[0]||null
      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8

      const issues:string[]=[]
      if(!supervisor_id)issues.push('No supervisor available')
      if(!bar_staff_id)issues.push('No bar staff')
      if(!floor_staff1_id)issues.push('No floor staff')`
);

// Add supervisor2 to assignedIds and staff list
ap = ap.replace(
  `      const assignedIds=new Set([supervisor_id,bar_staff_id,floor_staff1_id,floor_staff2_id].filter(Boolean))`,
  `      const assignedIds=new Set([supervisor_id,supervisor2_id,bar_staff_id,floor_staff1_id,floor_staff2_id].filter(Boolean))`
);
ap = ap.replace(
  `        staff:[
          supervisor_id&&{id:supervisor_id,role:'Supervisor',info:getStaffHours(supervisor_id,dateStr,rushStartH,rushEndH)},`,
  `        staff:[
          supervisor_id&&{id:supervisor_id,role:'Supervisor',info:getStaffHours(supervisor_id,dateStr,rushStartH,rushEndH)},
          supervisor2_id&&{id:supervisor2_id,role:'Supervisor',info:getStaffHours(supervisor2_id,dateStr,rushStartH,rushEndH)},`
);
ap = ap.replace(
  `        supervisor_id, bar_staff_id, floor_staff1_id, floor_staff2_id, issues, rushStartH, rushEndH, fmtH,`,
  `        supervisor_id, supervisor2_id, bar_staff_id, floor_staff1_id, floor_staff2_id, issues, rushStartH, rushEndH, fmtH,`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
