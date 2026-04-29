const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
ap = ap.replace(
  "if(forceAM){const hrs=avail.filter(h=>h>=8&&h<16)",
  "if(forceAM){const hrs=avail.filter((h:number)=>h>=8&&h<16)"
);
ap = ap.replace(
  "if(forcePM){const hrs=avail.filter(h=>h>=16&&h<24)",
  "if(forcePM){const hrs=avail.filter((h:number)=>h>=16&&h<24)"
);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
