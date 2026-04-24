const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix Sunday not showing - remove the "if no staff return" early exit
ap = ap.replace(
  `      const availStaff = getAvailableStaff(dateStr)
      if (!availStaff.length) return`,
  `      const availStaff = getAvailableStaff(dateStr)`
);

// When no staff at all, still push a day entry with issues
ap = ap.replace(
  `      // Separate by role
      const availSups = byLeast(availStaff.filter((id: string) => supRoles.includes(STAFF_MAP[id]?.role)))`,
  `      // If no staff at all, push empty day
      if (!availStaff.length) {
        built.push({ key: day + '_day', date: dateStr, day, label: day, type: isWeekend ? 'rush' : 'mixed',
          start: '08:00', end: '00:00', startH: 8, endH: 24,
          supervisor_id: null, bar_staff_id: null, floor_staff1_id: null, floor_staff2_id: null,
          issues: ['No staff availability submitted for this day'],
          staff: [], rushStartH, rushEndH, isWeekend, fmtH, status: 'flagged' })
        return
      }

      // Separate by role
      const availSups = byLeast(availStaff.filter((id: string) => supRoles.includes(STAFF_MAP[id]?.role)))`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("Sunday fix done");
