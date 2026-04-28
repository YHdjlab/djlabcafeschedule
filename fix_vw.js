const fs = require("fs");
let layout = fs.readFileSync("src/app/(dashboard)/layout.tsx", "utf8");
layout = layout.replace(
  'style={{marginLeft:"240px", maxWidth:"calc(100vw - 240px)", overflowX:"hidden"}}',
  'style={{marginLeft:"240px", maxWidth:"calc(100% - 240px)", overflowX:"hidden"}}'
);
fs.writeFileSync("src/app/(dashboard)/layout.tsx", layout, "utf8");
console.log("Fixed - 100% instead of 100vw");
