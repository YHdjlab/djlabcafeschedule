const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");
ap = ap.replace("a.slot_key?.match(/_h(d+)$/)", "a.slot_key?.match(/_h(\\d+)$/)");
fs.writeFileSync("src/components/schedule/availability-grid.tsx", ap, "utf8");
console.log("done");
