const fs = require("fs");

// Only fix card-level overflow-hidden that clips content
// Leave timeline bars, progress bars, rounded pills alone

// 1. admin-panel - day card
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
ap = ap.replace(
  "<div key={slot.key} className={cn('bg-white rounded-2xl overflow-hidden shadow-sm w-full'",
  "<div key={slot.key} className={cn('bg-white rounded-2xl shadow-sm w-full'"
);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("admin-panel fixed");

// 2. schedule-view - day card
let sv = fs.readFileSync("src/components/schedule/schedule-view.tsx", "utf8");
sv = sv.replace(
  '<div key={dateStr} className="bg-white rounded-3xl overflow-hidden shadow-sm"',
  '<div key={dateStr} className="bg-white rounded-3xl shadow-sm border border-black/5"'
);
fs.writeFileSync("src/components/schedule/schedule-view.tsx", sv, "utf8");
console.log("schedule-view fixed");

// 3. availability-grid - day card
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");
ag = ag.replace(
  "className={cn('bg-white rounded-3xl border overflow-hidden shadow-sm',",
  "className={cn('bg-white rounded-3xl border shadow-sm',"
);
fs.writeFileSync("src/components/schedule/availability-grid.tsx", ag, "utf8");
console.log("availability-grid fixed");

// 4. dashboard page - cards with overflow-hidden
let dp = fs.readFileSync("src/app/(dashboard)/dashboard/page.tsx", "utf8");
dp = dp.replace(
  /<div className="bg-white rounded-2xl border border-black\/5 overflow-hidden">/g,
  '<div className="bg-white rounded-2xl border border-black/5">'
);
fs.writeFileSync("src/app/(dashboard)/dashboard/page.tsx", dp, "utf8");
console.log("dashboard fixed");
