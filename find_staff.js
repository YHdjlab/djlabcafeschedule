const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Find the staff array line
const idx = ap.indexOf("staff:[");
console.log("staff:[ found at index:", idx);
console.log("Context:", ap.substring(idx, idx+300));
