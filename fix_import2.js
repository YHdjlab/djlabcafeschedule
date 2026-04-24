const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
// Show lines 10-16
for (let i = 10; i < 17; i++) console.log(i + ": " + lines[i]);
// Find the full lucide import block and replace
let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("from 'lucide-react'") || (start > -1 && end === -1)) {
    if (start === -1) {
      // Find the start of this import
      let j = i;
      while (j > 0 && !lines[j].startsWith("import")) j--;
      start = j;
    }
    if (lines[i].includes("from 'lucide-react'")) { end = i; break; }
  }
}
console.log("Block:", start, "to", end);
const newLines = [
  ...lines.slice(0, start),
  "import { Users, Settings, Calendar, CheckSquare, ArrowLeftRight, CalendarOff, Check, X, Clock, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'",
  ...lines.slice(end + 1)
];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("Fixed - removed", (end - start), "lines");
