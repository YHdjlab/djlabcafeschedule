const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Replace the getAvail function to work with hour-based keys
ap = ap.replace(
  "    const getAvail = (slotKey: string) => weekAvailability.filter((a: any) => a.slot_key === slotKey).map((a: any) => a.staff_id)",
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
    }`
);

// Fix the call to getAvail - pass slot instead of slot.key
ap = ap.replace(
  "      const avail = getAvail(slot.key)",
  "      const avail = getAvail(slot)"
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("fixed");
