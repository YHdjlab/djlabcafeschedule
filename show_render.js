const fs = require("fs");
const ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
for (let i = 680; i < 705; i++) {
  console.log((i+1) + "|" + lines[i]);
}
