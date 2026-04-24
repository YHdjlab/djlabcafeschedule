const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
// Find and show the current import line
const lines = ap.split("\n");
const importLine = lines.findIndex(l => l.includes("from 'lucide-react'"));
console.log("Import line", importLine, ":", lines[importLine]);
// Replace it
lines[importLine] = "import { Users, Settings, Calendar, CheckSquare, ArrowLeftRight, CalendarOff, Check, X, Clock, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'";
fs.writeFileSync("src/components/schedule/admin-panel.tsx", lines.join("\n"), "utf8");
console.log("Fixed");
