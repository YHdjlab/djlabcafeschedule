const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
ap = ap.replace(
  '<div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">',
  '<div className="flex gap-2 flex-wrap pb-1">'
);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("fixed");
