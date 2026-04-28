const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

ap = ap.replace(
  `                              const newHours = weekAvailability
                                .filter((a: any) => a.staff_id === newId && a.slot_date === gs.date)
                                .map((a: any) => { const match = a.slot_key.match(/_h(\\d+)$/); return match ? parseInt(match[1]) : -1 })
                                .filter((h: number) => h >= 0)
                                .sort((a: number, b: number) => a - b)
                              const newInfo = newHours.length ? { startH: newHours[0], endH: newHours[newHours.length-1]+1, totalH: newHours[newHours.length-1]+1-newHours[0], hours: newHours } : null
                              const newStaff = gs.staff.map((m: any) => m.id === member.id ? { ...m, id: newId, info: newInfo } : m)`,
  `                              const newHours = weekAvailability
                                .filter((a: any) => a.staff_id === newId && a.slot_date === gs.date)
                                .map((a: any) => { const match = a.slot_key.match(/_h(\\d+)$/); return match ? parseInt(match[1]) : -1 })
                                .filter((h: number) => h >= 0)
                                .sort((a: number, b: number) => a - b)
                              const newInfo = newHours.length ? { startH: newHours[0], endH: newHours[newHours.length-1]+1, totalH: newHours[newHours.length-1]+1-newHours[0], hours: newHours } : null
                              // Replace member, remove new person from bench if they were there
                              const newStaff = gs.staff
                                .map((m: any) => m.id === member.id ? { ...m, id: newId, info: newInfo } : m)
                                .filter((m: any, idx: number, arr: any[]) => arr.findIndex((x: any) => x.id === m.id) === idx)`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
