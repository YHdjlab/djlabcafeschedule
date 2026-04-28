const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
// Remove lines 661-696 (the old swap select after timeline)
const newLines = [
  ...lines.slice(0, 661),
  ...lines.slice(697)
];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("removed old swap, total lines:", newLines.length);
