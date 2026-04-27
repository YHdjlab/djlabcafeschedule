const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Make sure admin is included in supervisor roles for scheduling
ap = ap.replace(
  "    const supRoles = ['supervisor_floor','supervisor_bar']",
  "    const supRoles = ['supervisor_floor','supervisor_bar','admin']"
);
ap = ap.replace(
  "    const floorRoles = ['floor','supervisor_floor']",
  "    const floorRoles = ['floor','supervisor_floor','admin']"
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done - admin included in supervisor pool");
