const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// 1. Fix corrupted bullet character
ap = ap.replace(/Â·/g, "·");

// 2. Fix the day header - show assigned staff count (not total including bench)
// and update hours range based on actual assigned staff
ap = ap.replace(
  `                  <div className="text-right">
                    <p className="text-xl font-black text-white">{fmtH(slot.startH)} - {fmtH(slot.endH)}</p>
                    <p className="text-xs text-white/50">{slot.staff?.length || 0} staff Â· {slot.issues?.length ? slot.issues.length + ' issue' + (slot.issues.length > 1 ? 's' : '') : 'all good'}</p>
                  </div>`,
  `                  <div className="text-right">
                    <p className="text-xl font-black text-white">{fmtH(slot.startH)} - {fmtH(slot.endH)}</p>
                    <p className="text-xs text-white/50">{slot.staff?.filter((m: any) => m.role !== 'Available').length || 0} assigned · {slot.issues?.length ? slot.issues.length + ' issue' + (slot.issues.length > 1 ? 's' : '') : 'all good'}</p>
                  </div>`
);

// 3. Add + button to assign bench staff to a role
ap = ap.replace(
  `                {/* Staff grid */}
                <div className="px-6 py-4 space-y-3">
                  {(slot.staff || []).map((member: any, memberIdx: number) => {
                    const isFirstBench = member.role === 'Available' && memberIdx > 0 && slot.staff[memberIdx-1]?.role !== 'Available'`,
  `                {/* Staff grid */}
                <div className="px-6 py-4 space-y-3">
                  {(slot.staff || []).map((member: any, memberIdx: number) => {
                    const isFirstBench = member.role === 'Available' && memberIdx > 0 && slot.staff[memberIdx-1]?.role !== 'Available'
                    const canAddToShift = member.role === 'Available'`
);

// 4. Replace the Available row to show + Assign button
ap = ap.replace(
  `                      {isFirstBench && (
                        <div className="flex items-center gap-3 py-1">
                          <div className="flex-1 h-px bg-gray-200"/>
                          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Also available · not assigned</span>
                          <div className="flex-1 h-px bg-gray-200"/>
                        </div>
                      )}
                      <div key={member.id} className={cn("rounded-2xl border px-5 py-4", roleBg, member.role === 'Available' && 'opacity-60')}>`,
  `                      {isFirstBench && (
                        <div className="flex items-center gap-3 py-1">
                          <div className="flex-1 h-px bg-gray-200"/>
                          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Also available</span>
                          <div className="flex-1 h-px bg-gray-200"/>
                        </div>
                      )}
                      <div key={member.id} className={cn("rounded-2xl border px-5 py-4", roleBg, member.role === 'Available' && 'opacity-70')}>`
);

// 5. For Available members, show an Assign button instead of Swap
// Find the top row swap button and add conditional for Available
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
                          )}`,
  `                          {member.role === 'Available' ? (
                            /* Assign bench staff to a role */
                            <select value="" onChange={e => {
                              if (!e.target.value) return
                              const assignRole = e.target.value
                              const staffRole = STAFF_MAP[member.id]?.role || ''
                              const roleFieldMap: Record<string,string> = {
                                'Supervisor': 'supervisor_id',
                                'Bar': 'bar_staff_id',
                                'Floor1': 'floor_staff1_id',
                                'Floor2': 'floor_staff2_id',
                              }
                              const fld = roleFieldMap[assignRole]
                              if (!fld) return
                              setGeneratedSlots((prev: any[]) => prev.map((gs: any) => {
                                if (gs.key !== slot.key) return gs
                                const newStaff = gs.staff
                                  .map((m: any) => m.id === member.id ? { ...m, role: assignRole === 'Floor1' || assignRole === 'Floor2' ? 'Floor' : assignRole } : m)
                                  .filter(Boolean)
                                return { ...gs, [fld]: member.id, staff: newStaff }
                              }))
                            }}
                              className="text-xs rounded-xl px-2 py-1 border-2 cursor-pointer font-bold bg-white text-[#FF6357] border-[#FF6357]/30 flex-shrink-0">
                              <option value="">+ Assign</option>
                              {!slot.supervisor_id && ['supervisor_floor','supervisor_bar','admin'].includes(STAFF_MAP[member.id]?.role) && <option value="Supervisor">As Supervisor</option>}
                              {!slot.bar_staff_id && ['bar','supervisor_bar','floor','supervisor_floor'].includes(STAFF_MAP[member.id]?.role) && <option value="Bar">As Bar</option>}
                              {!slot.floor_staff1_id && ['floor','supervisor_floor','bar','supervisor_bar'].includes(STAFF_MAP[member.id]?.role) && <option value="Floor1">As Floor</option>}
                              {slot.floor_staff1_id && !slot.floor_staff2_id && ['floor','supervisor_floor','bar','supervisor_bar'].includes(STAFF_MAP[member.id]?.role) && <option value="Floor2">As 2nd Floor</option>}
                              {/* Always allow adding as extra supervisor for overlap shifts */}
                              {slot.supervisor_id && ['supervisor_floor','supervisor_bar','admin'].includes(STAFF_MAP[member.id]?.role) && <option value="Floor1">Cover Overlap</option>}
                            </select>
                          ) : alts.length > 0 && (
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
                          )}`
);

// 6. Fix clipping - ensure the day header text doesn't overflow
ap = ap.replace(
  `                <div className={cn('px-8 py-6 flex items-center justify-between', slot.issues?.length ? 'bg-red-900' : 'bg-[#323232]')}>`,
  `                <div className={cn('px-6 py-5 flex items-center justify-between gap-4', slot.issues?.length ? 'bg-red-900' : 'bg-[#323232]')}>`
);
ap = ap.replace(
  `                      <p className="font-black text-white text-2xl">{slot.day}</p>`,
  `                      <p className="font-black text-white text-xl">{slot.day}</p>`
);
ap = ap.replace(
  `                    <p className="text-xl font-black text-white">{fmtH(slot.startH)} - {fmtH(slot.endH)}</p>`,
  `                    <p className="text-base font-black text-white whitespace-nowrap">{fmtH(slot.startH)} - {fmtH(slot.endH)}</p>`
);

// 7. Fix rush band padding
ap = ap.replace(
  `                  <div className="px-8 py-4 bg-[#F7F0E8] border-b border-black/5 flex items-center gap-6">`,
  `                  <div className="px-6 py-3 bg-[#F7F0E8] border-b border-black/5 flex items-center gap-4 flex-wrap">`
);

// 8. Fix the save/submit header
ap = ap.replace(
  `          <div className="bg-white rounded-2xl border border-black/5 p-5 flex items-center justify-between gap-6">`,
  `          <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between gap-4">`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("Done");
