const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
// Remove lines 86-88 (extra closing divs from bad replace)
const newLines = [...lines.slice(0, 86), ...lines.slice(89)];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("fixed");
