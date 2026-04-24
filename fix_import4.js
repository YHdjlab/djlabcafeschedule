const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
const newLines = [
  ...lines.slice(0, 9),
  "import { Users, Settings, Calendar, CheckSquare, ArrowLeftRight, CalendarOff, Check, X, Clock, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'",
  ...lines.slice(11)
];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
for (let i = 8; i < 14; i++) console.log(i + ": " + newLines[i]);
