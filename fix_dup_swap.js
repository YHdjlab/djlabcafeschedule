const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Remove the duplicate swap select that appears below the timeline
// It's the one inside the bottom flex div
ap = ap.replace(
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
                          )}
                        </div>
                        {/* Timeline - always full width */}
                        <div className="flex-1 min-w-0">
                          <div className="flex-1 min-w-0">`,
  `                        </div>
                        {/* Timeline - always full width */}
                        <div className="flex-1 min-w-0">`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
