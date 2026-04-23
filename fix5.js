const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix implicit any types in filter callbacks
ap = ap.replace(/schedules\.filter\(s => s\./g, "schedules.filter((s: any) => s.");
ap = ap.replace(/weekSchedules\.filter\(s => s\./g, "weekSchedules.filter((s: any) => s.");
ap = ap.replace(/staff\.filter\(s => s\./g, "staff.filter((s: any) => s.");
ap = ap.replace(/staff\.filter\(\(s: any\) => s\./g, "staff.filter((s: any) => s.");
ap = ap.replace(/availability\.filter\(a => /g, "availability.filter((a: any) => ");
ap = ap.replace(/availability\.filter\(\(a: any\) => /g, "availability.filter((a: any) => ");
ap = ap.replace(/\.map\(a => a\./g, ".map((a: any) => a.");
ap = ap.replace(/\.map\(s => s\./g, ".map((s: any) => s.");
ap = ap.replace(/\.forEach\(s => \{/g, ".forEach((s: any) => {");

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("admin-panel types fixed");

