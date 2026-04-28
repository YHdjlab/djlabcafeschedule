const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");

// Fix: line 610 closes the flex div but swap button should be there
// Current structure:
// 602: <div flex top row>
// 606:   <div flex items>
// 610:   </div>   <- closes flex items
// 611: </div>     <- closes top row - BUT swap button is missing here!
// 612: timeline div
// 659:   </div>   <- extra close
// 660: </div>     <- closes timeline

// Add swap button before line 611, remove extra div at 659
const newLines = [
  ...lines.slice(0, 610),
  `                          {alts.length > 0 && (
                            <select value="" onChange={e => {
                              if (!e.target.value) return
                              const newId = e.target.value
                              setGeneratedSlots((prev: any[]) => prev.map((gs: any) => {
                                if (gs.key !== slot.key) return gs
                                const newHours = weekAvailability
                                  .filter((a: any) => a.staff_id === newId && a.slot_date === gs.date)
                                  .map((a: any) => { const match = a.slot_key.match(/_h(\\d+)$/); return match ? parseInt(match[1]) : -1 })
                                  .filter((h: number) => h >= 0)
                                  .sort((a: number, b: number) => a - b)
                                const newInfo = newHours.length ? { startH: newHours[0], endH: newHours[newHours.length-1]+1, totalH: newHours[newHours.length-1]+1-newHours[0], hours: newHours } : null
                                const oldMember = { id: member.id, role: 'Available', info: member.info }
                                const newStaff = gs.staff
                                  .map((m: any) => {
                                    if (m.id === member.id) return { ...m, id: newId, info: newInfo }
                                    if (m.id === newId) return null
                                    return m
                                  })
                                  .filter(Boolean)
                                const alreadyInStaff = newStaff.some((m: any) => m.id === oldMember.id)
                                if (!alreadyInStaff) newStaff.push(oldMember)
                                return { ...(fieldName === '__bench__' ? gs : { ...gs, [fieldName]: newId }), staff: newStaff }
                              }))
                            }}
                              className={cn("text-xs rounded-xl px-2 py-1 border-2 cursor-pointer font-bold bg-white flex-shrink-0", roleTextColor, "border-current/30")}>
                              <option value="">Swap</option>
                              {alts.map((sid: string) => (
                                <option key={sid} value={sid}>{STAFF_MAP[sid]?.full_name?.split(' ')[0]}</option>
                              ))}
                            </select>
                          )}`,
  ...lines.slice(610, 659),  // keep 610-658, skip 659 (extra div)
  ...lines.slice(660)
];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("fixed, lines:", newLines.length);
