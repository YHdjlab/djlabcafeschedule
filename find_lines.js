const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
lines.forEach((line, i) => {
  if (line.includes("availBars=byLeast") || line.includes("barPool") || line.includes("floor1Pool") || line.includes("floor2Pool") || line.includes("supervisor2_id=") || line.includes("issues:string")) {
    console.log((i+1) + ": " + line);
  }
});
