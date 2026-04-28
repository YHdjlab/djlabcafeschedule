const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
for (let i = 550; i < 670; i++) console.log(i + ": " + lines[i]);
