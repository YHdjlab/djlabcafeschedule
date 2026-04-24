const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
ap = ap.replace(
  "issues: ['No staff availability submitted for this day'],\n          staff: [], rushStartH, rushEndH, isWeekend, fmtH, status: 'flagged' })",
  "issues: ['No staff availability submitted for this day'],\n          staff: [], rushStartH, rushEndH, isWeekend, fmtH: (h: number) => { if (h === 0 || h === 24) return '12am'; if (h < 12) return h + 'am'; if (h === 12) return '12pm'; return (h-12) + 'pm' }, status: 'flagged' })"
);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("fixed");
