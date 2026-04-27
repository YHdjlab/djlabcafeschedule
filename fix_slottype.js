const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix slot_type when saving - map 'mixed' to 'off-rush'
ap = ap.replace(
  "      slot_type: slot.type,",
  "      slot_type: slot.type === 'mixed' ? 'off-rush' : slot.type,"
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("fixed");
