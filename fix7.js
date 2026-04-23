const fs = require("fs");
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");
ag = ag.replace("const slots = []", "const slots: any[] = []");
ag = ag.replace(/rushConfig\.find\(r => /g, "rushConfig.find((r: any) => ");
fs.writeFileSync("src/components/schedule/availability-grid.tsx", ag, "utf8");

let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
ap = ap.replace(/const slots: any\[\] = \[\]/g, "const slots: any[] = []");
ap = ap.replace(/const slots = \[\]/g, "const slots: any[] = []");
ap = ap.replace(/const issues: string\[\] = \[\]/g, "const issues: string[] = []");
ap = ap.replace(/rushConfig\.find\(r => /g, "rushConfig.find((r: any) => ");
ap = ap.replace(/rushConfig\.find\(\(r: any\) => /g, "rushConfig.find((r: any) => ");
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("Done");

