const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// After building the 4 assigned staff, add remaining available staff as "bench"
ap = ap.replace(
  `      built.push({
        key: day + '_day',
        date: dateStr,
        day,
        label: day,
        type: isWeekend ? 'rush' : 'mixed',
        start: dayStart + ':00',
        end: dayEnd === 24 ? '00:00' : dayEnd + ':00',
        startH: dayStart,
        endH: dayEnd,
        supervisor_id, bar_staff_id, floor_staff1_id, floor_staff2_id,
        issues,
        staff: [
          supervisor_id && { id: supervisor_id, role: 'Supervisor', info: supInfo },
          bar_staff_id && { id: bar_staff_id, role: 'Bar', info: barInfo },
          floor_staff1_id && { id: floor_staff1_id, role: 'Floor', info: floor1Info },
          floor_staff2_id && { id: floor_staff2_id, role: 'Floor', info: floor2Info },
        ].filter(Boolean),
        rushStartH, rushEndH, isWeekend, fmtH,
        status: issues.length ? 'flagged' : 'draft'
      })`,
  `      // Find bench staff - available but not assigned
      const assignedIds = new Set([supervisor_id, bar_staff_id, floor_staff1_id, floor_staff2_id].filter(Boolean))
      const benchStaff = availStaff
        .filter((id: string) => !assignedIds.has(id))
        .map((id: string) => ({ id, role: 'Available', info: getStaffHours(id, dateStr) }))

      built.push({
        key: day + '_day',
        date: dateStr,
        day,
        label: day,
        type: isWeekend ? 'rush' : 'mixed',
        start: dayStart + ':00',
        end: dayEnd === 24 ? '00:00' : dayEnd + ':00',
        startH: dayStart,
        endH: dayEnd,
        supervisor_id, bar_staff_id, floor_staff1_id, floor_staff2_id,
        issues,
        staff: [
          supervisor_id && { id: supervisor_id, role: 'Supervisor', info: supInfo },
          bar_staff_id && { id: bar_staff_id, role: 'Bar', info: barInfo },
          floor_staff1_id && { id: floor_staff1_id, role: 'Floor', info: floor1Info },
          floor_staff2_id && { id: floor_staff2_id, role: 'Floor', info: floor2Info },
          ...benchStaff,
        ].filter(Boolean),
        rushStartH, rushEndH, isWeekend, fmtH,
        status: issues.length ? 'flagged' : 'draft'
      })`
);

// Add styling for 'Available' role in the card
ap = ap.replace(
  `                    const roleColor = member.role === 'Supervisor' ? 'bg-blue-500' : member.role === 'Bar' ? 'bg-purple-500' : 'bg-green-500'
                    const roleBg = member.role === 'Supervisor' ? 'bg-blue-50 border-blue-100' : member.role === 'Bar' ? 'bg-purple-50 border-purple-100' : 'bg-green-50 border-green-100'
                    const roleTextColor = member.role === 'Supervisor' ? 'text-blue-600' : member.role === 'Bar' ? 'text-purple-600' : 'text-green-600'`,
  `                    const roleColor = member.role === 'Supervisor' ? 'bg-blue-500' : member.role === 'Bar' ? 'bg-purple-500' : member.role === 'Available' ? 'bg-gray-400' : 'bg-green-500'
                    const roleBg = member.role === 'Supervisor' ? 'bg-blue-50 border-blue-100' : member.role === 'Bar' ? 'bg-purple-50 border-purple-100' : member.role === 'Available' ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-100'
                    const roleTextColor = member.role === 'Supervisor' ? 'text-blue-600' : member.role === 'Bar' ? 'text-purple-600' : member.role === 'Available' ? 'text-gray-500' : 'text-green-600'`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
