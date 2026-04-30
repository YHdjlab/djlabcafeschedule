const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Add "Extra Staff" option that always shows for bench staff
// This allows assigning unlimited extra people beyond the 4 fixed slots
ap = ap.replace(
  `                                {!slot.supervisor_id&&s.role==='supervisor'&&<option value="Supervisor">As Supervisor</option>}
                                {!slot.bar_staff_id&&<option value="Bar">As Bar</option>}
                                {!slot.floor_staff1_id&&<option value="Floor1">As Floor</option>}
                                {slot.floor_staff1_id&&!slot.floor_staff2_id&&<option value="Floor2">As 2nd Floor</option>}`,
  `                                {!slot.supervisor_id&&s.role==='supervisor'&&<option value="Supervisor">As Supervisor</option>}
                                {!slot.bar_staff_id&&<option value="Bar">As Bar</option>}
                                {!slot.floor_staff1_id&&<option value="Floor1">As Floor</option>}
                                {slot.floor_staff1_id&&!slot.floor_staff2_id&&<option value="Floor2">As 2nd Floor</option>}
                                {slot.floor_staff1_id&&slot.floor_staff2_id&&<option value="Extra">As Extra Staff</option>}`
);

// Update the assign handler to support "Extra" assignment
ap = ap.replace(
  `                                const fm:Record<string,string>={Supervisor:'supervisor_id',Bar:'bar_staff_id',Floor1:'floor_staff1_id',Floor2:'floor_staff2_id'}
                                const fld=fm[ar];if(!fld)return
                                setGeneratedSlots((prev:any[])=>prev.map((gs:any)=>{
                                  if(gs.key!==slot.key)return gs
                                  const newRole=ar==='Floor1'||ar==='Floor2'?'Floor':ar
                                  const newStaff=gs.staff.map((m:any)=>m.id===member.id?{...m,role:newRole,info:getStaffHours(m.id,gs.date,gs.rushStartH,gs.rushEndH)}:m)
                                  return{...gs,[fld]:member.id,staff:newStaff}
                                }))`,
  `                                const fm:Record<string,string>={Supervisor:'supervisor_id',Bar:'bar_staff_id',Floor1:'floor_staff1_id',Floor2:'floor_staff2_id'}
                                setGeneratedSlots((prev:any[])=>prev.map((gs:any)=>{
                                  if(gs.key!==slot.key)return gs
                                  const newRole=ar==='Floor1'||ar==='Floor2'||ar==='Extra'?'Floor':ar
                                  const newStaff=gs.staff.map((m:any)=>m.id===member.id?{...m,role:newRole,info:getStaffHours(m.id,gs.date,gs.rushStartH,gs.rushEndH)}:m)
                                  if(ar==='Extra'){
                                    // Add as extra - just change role to Floor, no field update
                                    return{...gs,staff:newStaff,extra_staff:[...(gs.extra_staff||[]),member.id]}
                                  }
                                  const fld=fm[ar];if(!fld)return gs
                                  return{...gs,[fld]:member.id,staff:newStaff}
                                }))`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
