const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

ap = ap.replace(
  `                    const eligibleRoles = member.role === 'Supervisor' ? ['supervisor_floor','supervisor_bar'] : member.role === 'Bar' ? ['bar','supervisor_bar'] : ['floor','supervisor_floor']
                    const fieldName = member.role === 'Supervisor' ? 'supervisor_id' : member.role === 'Bar' ? 'bar_staff_id' : member.id === slot.floor_staff1_id ? 'floor_staff1_id' : 'floor_staff2_id'`,
  `                    const memberActualRole = STAFF_MAP[member.id]?.role || ''
                    const eligibleRoles = member.role === 'Supervisor' ? ['supervisor_floor','supervisor_bar','admin'] : member.role === 'Bar' ? ['bar','supervisor_bar'] : member.role === 'Available' ? ['floor','bar','supervisor_floor','supervisor_bar','admin'] : ['floor','supervisor_floor','admin']
                    const fieldName = member.role === 'Supervisor' ? 'supervisor_id' : member.role === 'Bar' ? 'bar_staff_id' : member.role === 'Available' ? null : member.id === slot.floor_staff1_id ? 'floor_staff1_id' : 'floor_staff2_id'`
);

// For Available members, don't show swap (they are the swap candidates)
// Instead show an "Assign" button that lets GM assign them to a role
ap = ap.replace(
  `                    const alts = slotAvail.filter((sid: string) => {
                      if (sid === member.id) return false
                      if (!eligibleRoles.includes(STAFF_MAP[sid]?.role)) return false
                      if (sid === slot.supervisor_id) return false
                      if (sid === slot.bar_staff_id) return false
                      if (fieldName !== 'floor_staff1_id' && sid === slot.floor_staff1_id) return false
                      if (fieldName !== 'floor_staff2_id' && sid === slot.floor_staff2_id) return false`,
  `                    const alts = member.role === 'Available' ? [] : slotAvail.filter((sid: string) => {
                      if (sid === member.id) return false
                      if (!eligibleRoles.includes(STAFF_MAP[sid]?.role)) return false
                      if (sid === slot.supervisor_id) return false
                      if (sid === slot.bar_staff_id) return false
                      if (fieldName !== 'floor_staff1_id' && sid === slot.floor_staff1_id) return false
                      if (fieldName !== 'floor_staff2_id' && sid === slot.floor_staff2_id) return false`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
