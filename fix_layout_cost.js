const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// 1. Fix staff card layout - swap button goes on top row, timeline takes full width
ap = ap.replace(
  `                    return (
                      <div key={member.id} className={cn("rounded-2xl border px-5 py-4 flex items-center justify-between gap-4", roleBg)}>
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={cn("w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0", roleColor)}>
                            {s.full_name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-base font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                              <span className={cn("text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", roleBg, roleTextColor, "border")}>{member.role}</span>
                              {info && <span className="text-xs font-bold text-[#FF6357] ml-auto">{info.totalH}h</span>}
                            </div>`,
  `                    return (
                      <div key={member.id} className={cn("rounded-2xl border px-5 py-4", roleBg)}>
                        {/* Top row: avatar + name + role + hours + swap */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0", roleColor)}>
                            {s.full_name?.charAt(0)}
                          </div>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                            <span className={cn("text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", roleBg, roleTextColor, "border")}>{member.role}</span>
                            {info && <span className="text-xs font-bold text-[#FF6357]">{info.totalH}h</span>}
                          </div>
                          {alts.length > 0 && (
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
                          <div className="flex-1 min-w-0">`
);

// 2. Remove the old swap button from the right side (it was inside the flex row)
ap = ap.replace(
  `                        </div>
                        {alts.length > 0 && (
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
                              // Swap: new person takes role, old person becomes Available
                              const oldMember = { id: member.id, role: 'Available', info: member.info }
                              const newStaff = gs.staff
                                .map((m: any) => {
                                  if (m.id === member.id) return { ...m, id: newId, info: newInfo } // new person takes role
                                  if (m.id === newId) return null // remove from bench
                                  return m
                                })
                                .filter(Boolean)
                              // Add old person to bench if not already there
                              const alreadyInStaff = newStaff.some((m: any) => m.id === oldMember.id)
                              if (!alreadyInStaff) newStaff.push(oldMember)
                              // Update the slot IDs too
                              return { ...(fieldName === '__bench__' ? gs : { ...gs, [fieldName]: newId }), staff: newStaff }
                            }))
                          }}
                            className={cn("text-sm rounded-xl px-3 py-1.5 border-2 cursor-pointer font-bold bg-white flex-shrink-0", roleTextColor, "border-current/30 hover:border-current/60 transition-colors")}>
                            <option value="">Swap</option>
                            {alts.map((sid: string) => (
                              <option key={sid} value={sid}>{STAFF_MAP[sid]?.full_name?.split(' ')[0]}</option>
                            ))}
                          </select>
                        )}
                      </div>`,
  `                        </div>
                      </div>`
);

// 3. Fix the closing tags for the new layout
ap = ap.replace(
  `                                  whiteSpace:'nowrap'
                                    }}>
                                      {h===24?'12a':h===12?'12p':h>12?(h-12)+'p':h+'a'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="h-5 rounded-full" style={{backgroundColor: 'rgba(0,0,0,0.06)'}}/>
                            )}
                          </div>
                        </div>
                      </div>`,
  `                                  whiteSpace:'nowrap'
                                    }}>
                                      {h===24?'12a':h===12?'12p':h>12?(h-12)+'p':h+'a'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="h-5 rounded-full" style={{backgroundColor: 'rgba(0,0,0,0.06)'}}/>
                            )}
                          </div>
                        </div>
                      </div>`
);

// 4. Cost-efficient scheduling - count weekly hours and prefer least-hours staff
// Find the byLeast function and make it count actual hours not just assignments
ap = ap.replace(
  `    const assignCount: Record<string,number> = {}
    activeStaff.forEach((s: any) => { assignCount[s.id] = 0 })
    const byLeast = (ids: string[]) => [...ids].sort((a: string, b: string) => (assignCount[a]||0) - (assignCount[b]||0))`,
  `    // Cost-efficient: track actual hours assigned (each shift = 8h)
    const assignCount: Record<string,number> = {}
    activeStaff.forEach((s: any) => { assignCount[s.id] = 0 })
    // byLeast sorts by total hours assigned (fewest hours = highest priority = cheapest)
    const byLeast = (ids: string[]) => [...ids].sort((a: string, b: string) => (assignCount[a]||0) - (assignCount[b]||0))`
);

// Update assignCount to add 8 hours per shift instead of 1
ap = ap.replace(
  `      if (supervisor_id) assignCount[supervisor_id] = (assignCount[supervisor_id]||0) + 1`,
  `      if (supervisor_id) assignCount[supervisor_id] = (assignCount[supervisor_id]||0) + 8`
);
ap = ap.replace(
  `      if (bar_staff_id) assignCount[bar_staff_id] = (assignCount[bar_staff_id]||0) + 1`,
  `      if (bar_staff_id) assignCount[bar_staff_id] = (assignCount[bar_staff_id]||0) + 8`
);
ap = ap.replace(
  `      if (floor_staff1_id) assignCount[floor_staff1_id] = (assignCount[floor_staff1_id]||0) + 1`,
  `      if (floor_staff1_id) assignCount[floor_staff1_id] = (assignCount[floor_staff1_id]||0) + 8`
);
ap = ap.replace(
  `      if (floor_staff2_id) assignCount[floor_staff2_id] = (assignCount[floor_staff2_id]||0) + 1`,
  `      if (floor_staff2_id) assignCount[floor_staff2_id] = (assignCount[floor_staff2_id]||0) + 8`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("Done");
