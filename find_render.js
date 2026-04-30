const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
lines.forEach((line, i) => {
  if (line.includes("DAYS.map") || line.includes("DAYS=") || (line.includes("day:") && line.includes("string"))) {
    console.log((i+1) + ": " + line.substring(0, 200));
  }
});
