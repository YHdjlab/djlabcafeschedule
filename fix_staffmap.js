const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
ap = ap.replace(
  "const STAFF_MAP = Object.fromEntries([activeStaff.map((s: any) => [s.id, s])])",
  "const STAFF_MAP = Object.fromEntries(activeStaff.map((s: any) => [s.id, s]))"
);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("fixed");
