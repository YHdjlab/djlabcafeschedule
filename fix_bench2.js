const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

ap = ap.replace(
  `      // Find bench staff - available but not assigned
      const assignedIds = new Set([supervisor_id, bar_staff_id, floor_staff1_id, floor_staff2_id].filter(Boolean))
      const benchStaff = availStaff
        .filter((id: string) => !assignedIds.has(id))
        .map((id: string) => ({ id, role: 'Available', info: getStaffHours(id, dateStr) }))`,
  `      // Find bench staff - available but not assigned (only from STAFF_MAP to ensure they render)
      const assignedIds = new Set([supervisor_id, bar_staff_id, floor_staff1_id, floor_staff2_id].filter(Boolean))
      const benchStaff = availStaff
        .filter((id: string) => !assignedIds.has(id) && STAFF_MAP[id])
        .map((id: string) => ({ id, role: 'Available', info: getStaffHours(id, dateStr) }))`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
