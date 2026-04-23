const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");

// Find generateSchedule start and end
let genStart = -1, genEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const generateSchedule = async () => {") && genStart === -1) genStart = i;
  if (genStart > -1 && lines[i].trim() === "}" && i > genStart + 10) {
    let next = i + 1;
    while (next < lines.length && lines[next].trim() === "") next++;
    if (lines[next] && lines[next].includes("const saveSchedule")) { genEnd = i; break; }
  }
}
console.log("generateSchedule:", genStart, "to", genEnd);
if (genStart === -1 || genEnd === -1) { console.log("Not found"); process.exit(1); }

const newGenerate = `  const generateSchedule = async () => {
    setGenerating(true)
    const monday = new Date(weekStart + 'T00:00:00')
    const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    const weekdayConfig = rushConfig?.find((r: any) => r.day_type === 'weekday')
    const rushStartH = parseInt((weekdayConfig?.rush_start || '15:00').split(':')[0])
    const rushEndH = parseInt((weekdayConfig?.rush_end || '21:00').split(':')[0])

    const supRoles = ['supervisor_floor','supervisor_bar']
    const floorRoles = ['floor','supervisor_floor']
    const barRoles = ['bar','supervisor_bar']

    // Get actual available hours for a staff member on a date
    const getStaffHours = (staffId: string, dateStr: string) => {
      const hours = weekAvailability
        .filter((a: any) => a.staff_id === staffId && a.slot_date === dateStr)
        .map((a: any) => { const m = a.slot_key.match(/_h(\\d+)$/); return m ? parseInt(m[1]) : -1 })
        .filter((h: number) => h >= 0)
        .sort((a: number, b: number) => a - b)
      if (!hours.length) return null
      return { startH: hours[0], endH: hours[hours.length - 1] + 1, totalH: hours[hours.length - 1] + 1 - hours[0], hours }
    }

    // Get all staff available on a date (have at least 1 hour)
    const getAvailableStaff = (dateStr: string) => {
      const staffSet = new Set<string>()
      weekAvailability.filter((a: any) => a.slot_date === dateStr).forEach((a: any) => staffSet.add(a.staff_id))
      return Array.from(staffSet)
    }

    // Determine if a staff member covers rush hours on a given day
    const coversRush = (staffId: string, dateStr: string, isWeekend: boolean) => {
      if (isWeekend) return true
      const info = getStaffHours(staffId, dateStr)
      if (!info) return false
      return info.hours.some((h: number) => h >= rushStartH && h < rushEndH)
    }

    const assignCount: Record<string,number> = {}
    activeStaff.forEach((s: any) => { assignCount[s.id] = 0 })
    const byLeast = (ids: string[]) => [...ids].sort((a: string, b: string) => (assignCount[a]||0) - (assignCount[b]||0))

    const built: any[] = []

    DAYS.forEach((day, i) => {
      const date = addDays(monday, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const isWeekend = i >= 5
      const availStaff = getAvailableStaff(dateStr)
      if (!availStaff.length) return

      // Separate by role
      const availSups = byLeast(availStaff.filter((id: string) => supRoles.includes(STAFF_MAP[id]?.role)))
      const availBars = byLeast(availStaff.filter((id: string) => barRoles.includes(STAFF_MAP[id]?.role)))
      const availFloors = byLeast(availStaff.filter((id: string) => floorRoles.includes(STAFF_MAP[id]?.role)))

      // For rush coverage - prefer staff who cover rush hours
      const rushSups = byLeast(availSups.filter((id: string) => coversRush(id, dateStr, isWeekend)))
      const rushBars = byLeast(availBars.filter((id: string) => coversRush(id, dateStr, isWeekend)))
      const rushFloors = byLeast(availFloors.filter((id: string) => coversRush(id, dateStr, isWeekend)))

      // Assign supervisor (prefer rush coverage)
      const supervisor_id = (rushSups[0] || availSups[0]) || null
      if (supervisor_id) assignCount[supervisor_id] = (assignCount[supervisor_id]||0) + 1

      // Assign bar (exclude supervisor)
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
      if (!floor_staff2_id && isWeekend) issues.push('Need 2nd floor for rush day')

      // Get actual hours for each assigned person
      const getInfo = (id: string | null) => id ? getStaffHours(id, dateStr) : null
      const supInfo = getInfo(supervisor_id)
      const barInfo = getInfo(bar_staff_id)
      const floor1Info = getInfo(floor_staff1_id)
      const floor2Info = getInfo(floor_staff2_id)

      // Calculate overall shift start/end for the day
      const allInfos = [supInfo, barInfo, floor1Info, floor2Info].filter(Boolean)
      const dayStart = allInfos.length ? Math.min(...allInfos.map((x: any) => x.startH)) : 8
      const dayEnd = allInfos.length ? Math.max(...allInfos.map((x: any) => x.endH)) : 24

      const fmtH = (h: number) => { if (h === 0 || h === 24) return '12am'; if (h < 12) return h + 'am'; if (h === 12) return '12pm'; return (h-12) + 'pm' }

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
        ].filter(Boolean),
        rushStartH, rushEndH, isWeekend, fmtH,
        status: issues.length ? 'flagged' : 'draft'
      })
    })

    setGeneratedSlots(built)
    setGenerating(false)
  }`;

const before = lines.slice(0, genStart);
const after = lines.slice(genEnd + 1);
const newLines = [...before, ...newGenerate.split("\n"), ...after];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("Done - " + newLines.length + " lines");
