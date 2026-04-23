const fs = require("fs");

// Fix swap-manager line 67
let sm = fs.readFileSync("src/components/schedule/swap-manager.tsx", "utf8");
sm = sm.replace(/\.select\(\*,([^)]+)\)\.single\(\)/g, ".select(\"*, staff_a:staff_a_id(full_name), staff_b:staff_b_id(full_name)\").single()");
fs.writeFileSync("src/components/schedule/swap-manager.tsx", sm, "utf8");
console.log("swap-manager fixed");

// Fix availability-grid template literals
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");
ag = ag.replace(/key: \$\{day\}_full/g, "key: day + \"_full\"");
ag = ag.replace(/label: \$\{day\} Full Day/g, "label: day + \" Full Day\"");
ag = ag.replace(/key: \$\{day\}_morning/g, "key: day + \"_morning\"");
ag = ag.replace(/label: \$\{day\} Morning/g, "label: day + \" Morning\"");
ag = ag.replace(/key: \$\{day\}_rush/g, "key: day + \"_rush\"");
ag = ag.replace(/label: \$\{day\} Rush/g, "label: day + \" Rush\"");
ag = ag.replace(/key: \$\{day\}_evening/g, "key: day + \"_evening\"");
ag = ag.replace(/label: \$\{day\} Evening/g, "label: day + \" Evening\"");
fs.writeFileSync("src/components/schedule/availability-grid.tsx", ag, "utf8");
console.log("availability-grid fixed");

// Fix dashboard className template literal
let db = fs.readFileSync("src/app/(dashboard)/dashboard/page.tsx", "utf8");
db = db.replace(/className=\{p-2\.5 rounded-xl \}/g, "className={\"p-2.5 rounded-xl \" + action.color}");
fs.writeFileSync("src/app/(dashboard)/dashboard/page.tsx", db, "utf8");
console.log("dashboard fixed");

// Fix attendance timeStr
let at = fs.readFileSync("src/components/schedule/attendance-manager.tsx", "utf8");
at = at.replace(/const timeStr = \$\{[^}]+\}:[^\n]*/g, "const timeStr = String(hour).padStart(2,\"0\") + \":\" + String(beirutTime.getUTCMinutes()).padStart(2,\"0\")");
fs.writeFileSync("src/components/schedule/attendance-manager.tsx", at, "utf8");
console.log("attendance-manager fixed");

// Show remaining issues
const targets = [
  "src/components/schedule/swap-manager.tsx",
  "src/components/schedule/availability-grid.tsx",
  "src/app/(dashboard)/dashboard/page.tsx",
  "src/components/schedule/attendance-manager.tsx"
];
targets.forEach(f => {
  const lines = fs.readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (line.includes(".select(*,") || line.includes("key: ${") || line.includes("label: ${") || line.includes("className={p-") || line.includes("timeStr = ${")) {
      console.log("STILL BROKEN " + f + " line " + (i+1) + ": " + line.trim());
    }
  });
});
console.log("Done - running build");

