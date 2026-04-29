const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
ap = ap.replace(
  "const rc={Supervisor:'#3B82F6',Bar:'#A855F7',Floor:'#22C55E',Available:'#636366'}[member.role]||'#636366'",
  "const rc=({Supervisor:'#3B82F6',Bar:'#A855F7',Floor:'#22C55E',Available:'#636366'} as any)[member.role]||'#636366'"
);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("fixed");
