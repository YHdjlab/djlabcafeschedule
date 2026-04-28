const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Bar and floor are interchangeable - expand eligible roles
ap = ap.replace(
  "                    const eligibleRoles = member.role === 'Supervisor' ? ['supervisor_floor','supervisor_bar','admin'] : member.role === 'Bar' ? ['bar','supervisor_bar'] : member.role === 'Available' ? ['floor','bar','supervisor_floor','supervisor_bar','admin'] : ['floor','supervisor_floor','admin']",
  "                    const eligibleRoles = member.role === 'Supervisor' ? ['supervisor_floor','supervisor_bar','admin'] : member.role === 'Available' ? ['floor','bar','supervisor_floor','supervisor_bar','admin'] : ['floor','bar','supervisor_floor','supervisor_bar','admin']"
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
