const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
// Remove line 703 - the extra closing div
const newLines = [...lines.slice(0, 703), ...lines.slice(704)];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("fixed, lines:", newLines.length);
