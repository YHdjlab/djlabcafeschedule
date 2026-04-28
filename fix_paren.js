const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
// Remove line 710 (extra closing paren)
const newLines = [...lines.slice(0, 709), ...lines.slice(710)];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("fixed");
