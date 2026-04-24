const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
// Insert the missing function declaration at line 614
const newLines = [
  ...lines.slice(0, 614),
  "function ApprovalsTab({ pendingDaysOff, setPendingDaysOff, pendingSwaps, setPendingSwaps, pendingAttendance, setPendingAttendance, profile, supabase }: any) {",
  ...lines.slice(614)
];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("fixed");
