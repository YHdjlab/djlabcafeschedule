const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Move getAvail outside generateSchedule by replacing the inline version with a reference
// and adding it as a component-level function before generateSchedule
const getAvailFn = `
  const getAvail = (slot: any) => {
    const startH = parseInt((slot.start || '08:00').split(':')[0])
    const endH = slot.end === '00:00' ? 24 : parseInt((slot.end || '23:00').split(':')[0])
    const staffWithAvail = new Set<string>()
    weekAvailability.forEach((a: any) => {
      if (a.slot_date === slot.date) {
        const match = a.slot_key.match(/_h(\\d+)$/)
        if (match) {
          const hour = parseInt(match[1])
          if (hour >= startH && hour < endH) staffWithAvail.add(a.staff_id)
        }
      }
    })
    return Array.from(staffWithAvail)
  }
`;

// Insert getAvail before generateSchedule
ap = ap.replace(
  "  const generateSchedule = async () => {",
  getAvailFn + "\n  const generateSchedule = async () => {"
);

// Remove the duplicate getAvail inside generateSchedule
ap = ap.replace(
  `    const getAvail = (slot: any) => {
      // slot has start/end times, check which staff have availability covering those hours
      const startH = parseInt((slot.start || '08:00').split(':')[0])
      const endH = slot.end === '00:00' ? 24 : parseInt((slot.end || '23:00').split(':')[0])
      const staffWithAvail = new Set<string>()
      weekAvailability.forEach((a: any) => {
        if (a.slot_date === slot.date) {
          const match = a.slot_key.match(/_h(\\d+)$/)
          if (match) {
            const hour = parseInt(match[1])
            if (hour >= startH && hour < endH) staffWithAvail.add(a.staff_id)
          }
        }
      })
      return Array.from(staffWithAvail)
    }`,
  "    // getAvail defined at component level"
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("Done");
