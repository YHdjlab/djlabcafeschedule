const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

ap = ap.replace(
  `                              <option value="">+ Assign</option>
                              {!slot.supervisor_id && ['supervisor_floor','supervisor_bar','admin'].includes(STAFF_MAP[member.id]?.role) && <option value="Supervisor">As Supervisor</option>}
                              {!slot.bar_staff_id && <option value="Bar">As Bar</option>}
                              {!slot.floor_staff1_id && <option value="Floor1">As Floor</option>}
                              {slot.floor_staff1_id && !slot.floor_staff2_id && <option value="Floor2">As 2nd Floor</option>}`,
  `                              <option value="">+ Assign</option>
                              {!slot.supervisor_id && ['supervisor_floor','supervisor_bar','admin'].includes(STAFF_MAP[member.id]?.role) && <option value="Supervisor">As Supervisor</option>}
                              {!slot.bar_staff_id && <option value="Bar">As Bar</option>}
                              {!slot.floor_staff1_id && <option value="Floor1">As Floor</option>}
                              {slot.floor_staff1_id && !slot.floor_staff2_id && <option value="Floor2">As 2nd Floor</option>}
                              {/* Overlap options - when all slots full, can still add to cover shift overlap */}
                              {slot.supervisor_id && slot.bar_staff_id && slot.floor_staff1_id && slot.floor_staff2_id && (
                                <>
                                  {['supervisor_floor','supervisor_bar','admin'].includes(STAFF_MAP[member.id]?.role) && <option value="Supervisor">Cover as Supervisor</option>}
                                  <option value="Bar">Cover as Bar</option>
                                  <option value="Floor2">Cover as Floor</option>
                                </>
                              )}`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
