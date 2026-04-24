const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
// Find and show lines around 610
for (let i = 605; i < 620; i++) console.log(i + ": " + lines[i]);
