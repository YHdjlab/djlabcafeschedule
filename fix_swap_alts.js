const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix alts - include ALL staff in slot (including bench) as swap candidates
// not just slotAvail (which is availability-based)
ap = ap.replace(
  `                    const alts = member.role === 'Available' ? [] : slotAvail.filter((sid: string) => {
                      if (sid === member.id) return false
                      if (!eligibleRoles.includes(STAFF_MAP[sid]?.role)) return false
                      if (sid === slot.supervisor_id) return false
                      if (sid === slot.bar_staff_id) return false
                      if (fieldName !== 'floor_staff1_id' && sid === slot.floor_staff1_id) return false
                      if (fieldName !== 'floor_staff2_id' && sid === slot.floor_staff2_id) return false
                      // Only show if they overlap with current member's hours
                      if (!info) return true
                      const theirHours = weekAvailability
                        .filter((a: any) => a.staff_id === sid && a.slot_date === slot.date)
                        .map((a: any) => { const m = a.slot_key.match(/_h(\\d+)$/); return m ? parseInt(m[1]) : -1 })
                        .filter((h: number) => h >= 0)
                      // Must overlap with at least half of current member hours
                      const overlap = theirHours.filter((h: number) => h >= info.startH && h < info.endH)
                      return overlap.length >= Math.ceil(info.totalH * 0.5)
                    })`,
  `                    // For Available bench staff - no swap button needed
                    // For assigned staff - can swap with anyone available that day with matching role
                    const allDayAvail = slot.staff.map((m: any) => m.id) // all staff in this day slot
                    const alts = member.role === 'Available' ? [] : slotAvail.filter((sid: string) => {
                      if (sid === member.id) return false
                      if (!eligibleRoles.includes(STAFF_MAP[sid]?.role)) return false
                      // Don't show someone already assigned to a different role (but bench is ok)
                      const isAssigned = (sid === slot.supervisor_id && fieldName !== 'supervisor_id') ||
                        (sid === slot.bar_staff_id && fieldName !== 'bar_staff_id') ||
                        (sid === slot.floor_staff1_id && fieldName !== 'floor_staff1_id') ||
                        (sid === slot.floor_staff2_id && fieldName !== 'floor_staff2_id')
                      if (isAssigned) return false
                      // Check availability overlap
                      if (!info) return true
                      const theirHours = weekAvailability
                        .filter((a: any) => a.staff_id === sid && a.slot_date === slot.date)
                        .map((a: any) => { const m = a.slot_key.match(/_h(\\d+)$/); return m ? parseInt(m[1]) : -1 })
                        .filter((h: number) => h >= 0)
                      const overlap = theirHours.filter((h: number) => h >= info.startH && h < info.endH)
                      return overlap.length >= Math.ceil(info.totalH * 0.5)
                    })`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
