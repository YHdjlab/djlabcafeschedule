const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Replace the floor/bar assignment logic to allow cross-covering
ap = ap.replace(
  `      // Assign bar (exclude supervisor)
      const barPool = byLeast(availBars.filter((id: string) => id !== supervisor_id))
      const rushBarPool = byLeast(rushBars.filter((id: string) => id !== supervisor_id))
      const bar_staff_id = (rushBarPool[0] || barPool[0]) || null
      if (bar_staff_id) assignCount[bar_staff_id] = (assignCount[bar_staff_id]||0) + 1

      // Assign floor 1
      const floorPool = byLeast(availFloors.filter((id: string) => id !== supervisor_id && id !== bar_staff_id))
      const rushFloorPool = byLeast(rushFloors.filter((id: string) => id !== supervisor_id && id !== bar_staff_id))
      const floor_staff1_id = (rushFloorPool[0] || floorPool[0]) || null
      if (floor_staff1_id) assignCount[floor_staff1_id] = (assignCount[floor_staff1_id]||0) + 1

      // Assign floor 2 (rush requires 2 floor staff)
      const floor2Pool = byLeast(floorPool.filter((id: string) => id !== floor_staff1_id))
      const floor_staff2_id = floor2Pool[0] || null
      if (floor_staff2_id) assignCount[floor_staff2_id] = (assignCount[floor_staff2_id]||0) + 1

      // Build issues
      const issues: string[] = []
      if (!supervisor_id) issues.push('No supervisor available')
      if (!bar_staff_id) issues.push('No bar staff available')
      if (!floor_staff1_id) issues.push('No floor staff available')
      if (!floor_staff2_id && isWeekend) issues.push('Need 2nd floor for rush day')`,

  `      // Assign bar (exclude supervisor) - floor staff can cover bar if needed
      const barPool = byLeast(availBars.filter((id: string) => id !== supervisor_id))
      const rushBarPool = byLeast(rushBars.filter((id: string) => id !== supervisor_id))
      const flexBarPool = byLeast(availFloors.filter((id: string) => id !== supervisor_id && !barPool.length))
      const bar_staff_id = (rushBarPool[0] || barPool[0] || flexBarPool[0]) || null
      const barIsCovering = bar_staff_id && !barPool.includes(bar_staff_id) && !rushBarPool.includes(bar_staff_id)
      if (bar_staff_id) assignCount[bar_staff_id] = (assignCount[bar_staff_id]||0) + 1

      // Assign floor 1 - bar staff can cover floor if needed
      const floorPool = byLeast(availFloors.filter((id: string) => id !== supervisor_id && id !== bar_staff_id))
      const rushFloorPool = byLeast(rushFloors.filter((id: string) => id !== supervisor_id && id !== bar_staff_id))
      const flexFloorPool = byLeast(availBars.filter((id: string) => id !== supervisor_id && id !== bar_staff_id && !floorPool.length))
      const floor_staff1_id = (rushFloorPool[0] || floorPool[0] || flexFloorPool[0]) || null
      const floor1IsCovering = floor_staff1_id && !floorPool.includes(floor_staff1_id) && !rushFloorPool.includes(floor_staff1_id)
      if (floor_staff1_id) assignCount[floor_staff1_id] = (assignCount[floor_staff1_id]||0) + 1

      // Assign floor 2 - bar staff can cover floor if needed
      const floor2Pool = byLeast([...floorPool, ...availBars].filter((id: string) => id !== floor_staff1_id && id !== bar_staff_id && id !== supervisor_id))
      const floor_staff2_id = floor2Pool[0] || null
      const floor2IsCovering = floor_staff2_id && !floorPool.includes(floor_staff2_id)
      if (floor_staff2_id) assignCount[floor_staff2_id] = (assignCount[floor_staff2_id]||0) + 1

      // Build issues
      const issues: string[] = []
      if (!supervisor_id) issues.push('No supervisor available')
      if (!bar_staff_id) issues.push('No bar staff available')
      else if (barIsCovering) issues.push(STAFF_MAP[bar_staff_id]?.full_name?.split(' ')[0] + ' (Floor) covering Bar today')
      if (!floor_staff1_id) issues.push('No floor staff available')
      else if (floor1IsCovering) issues.push(STAFF_MAP[floor_staff1_id]?.full_name?.split(' ')[0] + ' (Bar) covering Floor today')
      if (floor2IsCovering && floor_staff2_id) issues.push(STAFF_MAP[floor_staff2_id]?.full_name?.split(' ')[0] + ' (Bar) covering Floor today')
      if (!floor_staff2_id && isWeekend) issues.push('Need 2nd floor for rush day')`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("Done");
