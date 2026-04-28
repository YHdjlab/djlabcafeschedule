const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

ap = ap.replace(
  "                    const fieldName = member.role === 'Supervisor' ? 'supervisor_id' : member.role === 'Bar' ? 'bar_staff_id' : member.role === 'Available' ? null : member.id === slot.floor_staff1_id ? 'floor_staff1_id' : 'floor_staff2_id'",
  "                    const fieldName: string = member.role === 'Supervisor' ? 'supervisor_id' : member.role === 'Bar' ? 'bar_staff_id' : member.role === 'Available' ? '__bench__' : member.id === slot.floor_staff1_id ? 'floor_staff1_id' : 'floor_staff2_id'"
);

// Skip update if fieldName is bench
ap = ap.replace(
  `                              const updated = { ...gs, [fieldName]: newId }`,
  `                              const updated = fieldName === '__bench__' ? gs : { ...gs, [fieldName]: newId }`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
