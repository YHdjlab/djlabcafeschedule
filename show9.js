const fs = require("fs");
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");
const lines = ag.split("\n");
for (let i = 198; i < 215; i++) console.log(i + ": " + lines[i]);
