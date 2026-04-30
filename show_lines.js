const fs = require("fs");
const ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
for (let i = 360; i < 385; i++) {
  console.log((i+1) + "|" + JSON.stringify(lines[i]));
}
