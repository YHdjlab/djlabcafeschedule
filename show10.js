const fs = require("fs");
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");
const lines = ag.split("\n");
for (let i = 196; i < 208; i++) console.log(i + ": " + lines[i]);
