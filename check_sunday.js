const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// The DAYS array goes Mon-Sun (0-6) which is correct
// The issue is weekStart calculation - it uses diff = day===0 ? 1 : 8-day
// On Friday (day=5): diff = 8-5 = 3, so next Monday = Apr 27 - correct
// But getStaffHours for Sunday might be using wrong date
// Let me check - addDays(monday, 6) = Sunday Apr 3 - should be correct
// The real issue: weekStart state init uses "next monday" but today Apr 24 is Friday
// diff = 8-5 = 3, next.setDate(24+3) = Apr 27 - correct

// Actually the Sunday issue might be that getAvailableStaff returns empty for Sunday
// because seed only seeded Mon-Sat for non-supervisors
// Fix: ensure seed covers all 7 days, and fix the floor staff weekend availability

console.log("Checking admin panel for Sunday issue...");
const lines = ap.split("\n");
// Find DAYS array in generateSchedule
const daysLine = lines.findIndex(l => l.includes("'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'") && l.includes("DAYS ="));
console.log("DAYS line:", daysLine, lines[daysLine]);

// The issue is likely that floor/bar staff have no availability on Sunday in seed
// Already fixed by reseeding - but let us also check the forEach goes to index 6
const forEachLine = lines.findIndex(l => l.includes("DAYS.forEach((day, i) =>"));
console.log("forEach line:", forEachLine, lines[forEachLine]);
