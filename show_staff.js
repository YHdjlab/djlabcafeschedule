const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Show full staff array
const idx = ap.indexOf("staff:[", 20000);
console.log(ap.substring(idx, idx+500));
