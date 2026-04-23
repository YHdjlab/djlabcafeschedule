const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");

// Find generateSchedule function start and end
let genStart = -1, genEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const generateSchedule = async () => {") && genStart === -1) genStart = i;
  if (genStart > -1 && lines[i] === "  }" && i > genStart + 5) {
    // Check if next non-empty line is saveSchedule
    let next = i + 1;
    while (next < lines.length && lines[next].trim() === "") next++;
    if (lines[next] && (lines[next].includes("const saveSchedule") || lines[next].includes("setSaving"))) {
      genEnd = i;
      break;
    }
  }
}
console.log("generateSchedule:", genStart, "to", genEnd);

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
    const assignCount: Record<string,number> = {}
    activeStaff.forEach((s: any) => { assignCount[s.id] = 0 })
    const byLeast = (ids: string[]) => [...ids].sort((a: any, b: any) => (assignCount[a]||0) - (assignCount[b]||0))

    // For each staff member, find their available hours per day
    const getStaffHoursForDay = (staffId: string, dateStr: string) => {
      const hours = weekAvailability
        .filter((a: any) => a.staff_id === staffId && a.slot_date === dateStr)
        .map((a: any) => { const m = a.slot_key.match(/_h(\\d+)$/); return m ? parseInt(m[1]) : -1 })
        .filter((h: number) => h >= 0)
        .sort((a: number, b: number) => a - b)
      return hours
    }

    const getStaffRange = (staffId: string, dateStr: string) => {
      const hours = getStaffHoursForDay(staffId, dateStr)
      if (!hours.length) return null
      return { start: hours[0], end: hours[hours.length - 1] + 1, hours }
    }

    // For a slot time range, get staff available for ALL hours in that range
    const getAvailForRange = (dateStr: string, startH: number, endH: number) => {
      const staffWithAvail = new Set<string>()
      weekAvailability.forEach((a: any) => {
        if (a.slot_date === dateStr) {
          const match = a.slot_key.match(/_h(\\d+)$/)
          if (match) {
            const hour = parseInt(match[1])
            if (hour >= startH && hour < endH) staffWithAvail.add(a.staff_id)
          }
        }
      })
      // Only include staff available for majority of hours (at least half)
      const rangeHours = endH - startH
      return Array.from(staffWithAvail).filter(sid => {
        const staffHours = getStaffHoursForDay(sid, dateStr).filter((h: number) => h >= startH && h < endH)
        return staffHours.length >= Math.ceil(rangeHours * 0.5)
      })
    }

    const slots: any[] = []
    DAYS.forEach((day, i) => {
      const date = addDays(monday, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const isWeekend = i >= 5

      if (isWeekend) {
        // Weekend: one full rush day
        slots.push({
          key: day + '_full', date: dateStr, day, type: 'rush',
          start: '08:00', end: '00:00',
          startH: 8, endH: 24,
          label: day + ' Full Day'
        })
      } else {
        // Weekday: off-rush morning, rush, off-rush evening
        // Only create a slot if there's availability in that window
        const morningAvail = getAvailForRange(dateStr, 8, rushStartH)
        const rushAvail = getAvailForRange(dateStr, rushStartH, rushEndH)
        const eveningAvail = getAvailForRange(dateStr, rushEndH, 24)

        if (morningAvail.length > 0) {
          slots.push({ key: day + '_morning', date: dateStr, day, type: 'off-rush', start: '08:00', end: rushStartH + ':00', startH: 8, endH: rushStartH, label: day + ' Morning' })
        }
        if (rushAvail.length > 0) {
          slots.push({ key: day + '_rush', date: dateStr, day, type: 'rush', start: rushStartH + ':00', end: rushEndH + ':00', startH: rushStartH, endH: rushEndH, label: day + ' Rush' })
        }
        if (eveningAvail.length > 0) {
          slots.push({ key: day + '_evening', date: dateStr, day, type: 'off-rush', start: rushEndH + ':00', end: '00:00', startH: rushEndH, endH: 24, label: day + ' Evening' })
        }
      }
    })

    const built = slots.map((slot: any) => {
      const avail = getAvailForRange(slot.date, slot.startH, slot.endH)
      const sups = byLeast(avail.filter((id: string) => supRoles.includes(STAFF_MAP[id]?.role)))
      const bars = byLeast(avail.filter((id: string) => barRoles.includes(STAFF_MAP[id]?.role)))
      const floors = byLeast(avail.filter((id: string) => floorRoles.includes(STAFF_MAP[id]?.role)))
      const issues: string[] = []

      let supervisor_id = sups[0] || null
      if (!supervisor_id) issues.push('No supervisor available')
      else assignCount[supervisor_id] = (assignCount[supervisor_id]||0) + 1

      const barCandidates = bars.filter((id: string) => id !== supervisor_id)
      let bar_staff_id = barCandidates[0] || null
      if (!bar_staff_id) issues.push('No bar staff available')
      else assignCount[bar_staff_id] = (assignCount[bar_staff_id]||0) + 1

      const floorCandidates = floors.filter((id: string) => id !== supervisor_id && id !== bar_staff_id)
      let floor_staff1_id = floorCandidates[0] || null
      if (!floor_staff1_id) issues.push('No floor staff available')
      else assignCount[floor_staff1_id] = (assignCount[floor_staff1_id]||0) + 1

      let floor_staff2_id = null
      if (slot.type === 'rush') {
        const f2 = floorCandidates.filter((id: string) => id !== floor_staff1_id)[0] || null
        if (!f2) issues.push('Need 2nd floor for rush')
        else { floor_staff2_id = f2; assignCount[f2] = (assignCount[f2]||0) + 1 }
      }

      // Calculate actual hours per assigned staff
      const getActualHours = (staffId: string) => {
        if (!staffId) return null
        const range = getStaffRange(staffId, slot.date)
        if (!range) return null
        const actualStart = Math.max(range.start, slot.startH)
        const actualEnd = Math.min(range.end, slot.endH)
        return { start: actualStart, end: actualEnd, hours: actualEnd - actualStart }
      }

      return {
        ...slot,
        supervisor_id, bar_staff_id, floor_staff1_id, floor_staff2_id, issues,
        status: issues.length ? 'flagged' : 'draft',
        actualHours: {
          supervisor: getActualHours(supervisor_id),
          bar: getActualHours(bar_staff_id),
          floor1: getActualHours(floor_staff1_id),
          floor2: getActualHours(floor_staff2_id),
        }
      }
    })

    setGeneratedSlots(built)
    setGenerating(false)
  }`;

const before = lines.slice(0, genStart);
const after = lines.slice(genEnd + 1);
const newLines = [...before, ...newGenerate.split("\n"), ...after];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("Done - " + newLines.length + " lines");
console.log("genStart:", genStart, "genEnd:", genEnd);
