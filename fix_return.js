const fs = require("fs");
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");
const lines = ag.split("\n");
const newLines = [...lines.slice(0, 201), "          return (", ...lines.slice(201)];
fs.writeFileSync("src/components/schedule/availability-grid.tsx", newLines.join("\n"), "utf8");
console.log("fixed");
