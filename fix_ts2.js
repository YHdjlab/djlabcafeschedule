const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
ap = ap.replace(
  "const sup0HasAM=avail0.filter(h=>h>=8&&h<16).length>=4",
  "const sup0HasAM=avail0.filter((h:number)=>h>=8&&h<16).length>=4"
);
ap = ap.replace(
  "const sup0HasPM=avail0.filter(h=>h>=16&&h<24).length>=4",
  "const sup0HasPM=avail0.filter((h:number)=>h>=16&&h<24).length>=4"
);
ap = ap.replace(
  "const sup1HasAM=avail1.filter(h=>h>=8&&h<16).length>=4",
  "const sup1HasAM=avail1.filter((h:number)=>h>=8&&h<16).length>=4"
);
ap = ap.replace(
  "const sup1HasPM=avail1.filter(h=>h>=16&&h<24).length>=4",
  "const sup1HasPM=avail1.filter((h:number)=>h>=16&&h<24).length>=4"
);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
