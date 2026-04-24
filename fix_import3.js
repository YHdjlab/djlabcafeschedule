const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
for (let i = 8; i < 16; i++) console.log(i + ": " + lines[i]);
// Replace lines 10-14 (the broken import + duplicate) with single clean import
const newLines = [
  ...lines.slice(0, 10),
  "import { Users, Settings, Calendar, CheckSquare, ArrowLeftRight, CalendarOff, Check, X, Clock, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'",
  ...lines.slice(14)
];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("Done");
