const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Find all staff:[ occurrences
let idx = 0;
while(true) {
  idx = ap.indexOf("staff:[", idx);
  if(idx === -1) break;
  console.log("Found at:", idx);
  console.log(ap.substring(idx, idx+200));
  console.log("---");
  idx++;
}
