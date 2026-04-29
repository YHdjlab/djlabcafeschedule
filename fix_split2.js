const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix 1: supervisor2 assignment - if sup1 does AM, assign sup2 to PM
ap = ap.replace(
  `      // Assign secondary supervisor if first doesn't cover full day
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
      if(supervisor2_id)assignCount[supervisor2_id]=(assignCount[supervisor2_id]||0)+8`,

  `      // Always try to assign a second supervisor for full-day coverage
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
      if(supervisor2_id)assignCount[supervisor2_id]=(assignCount[supervisor2_id]||0)+8`
);

// Fix 2: Assign button - fix the field mapping for floor assignments
ap = ap.replace(
  `                                const fm:Record<string,string>={Supervisor:'supervisor_id',Bar:'bar_staff_id',Floor1:'floor_staff1_id',Floor2:'floor_staff2_id'}
                                const fld=fm[ar];if(!fld)return
                                setGeneratedSlots(prev=>prev.map(gs=>gs.key!==slot.key?gs:{...gs,[fld]:member.id,staff:gs.staff.map((m:any)=>m.id===member.id?{...m,role:ar==='Floor1'||ar==='Floor2'?'Floor':ar}:m)}))`,
  `                                const fm:Record<string,string>={Supervisor:'supervisor_id',Bar:'bar_staff_id',Floor1:'floor_staff1_id',Floor2:'floor_staff2_id'}
                                const fld=fm[ar];if(!fld)return
                                setGeneratedSlots((prev:any[])=>prev.map((gs:any)=>{
                                  if(gs.key!==slot.key)return gs
                                  const newRole=ar==='Floor1'||ar==='Floor2'?'Floor':ar
                                  const newStaff=gs.staff.map((m:any)=>m.id===member.id?{...m,role:newRole,info:getStaffHours(m.id,gs.date,gs.rushStartH,gs.rushEndH)}:m)
                                  return{...gs,[fld]:member.id,staff:newStaff}
                                }))`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
