const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");

// Find start of staff map (the return statement for each member)
let startLine = -1, endLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('return (') && lines[i-1]?.includes('isFirstBench && (') === false && startLine === -1 && i > 600) {
    startLine = i;
  }
  if (startLine > -1 && lines[i].includes('</>') && lines[i+1]?.includes(')') && lines[i+2]?.includes('})}')) {
    endLine = i;
    break;
  }
}
console.log("startLine:", startLine, "endLine:", endLine);

const newCard = `                    return (
                      <>
                      {isFirstBench && (
                        <div className="flex items-center gap-3 py-1">
                          <div className="flex-1 h-px bg-gray-200"/>
                          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Also available</span>
                          <div className="flex-1 h-px bg-gray-200"/>
                        </div>
                      )}
                      <div key={member.id} className={cn("rounded-2xl border px-5 py-4", roleBg, member.role === 'Available' && 'opacity-70')}>
                        {/* Top row */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0", roleColor)}>
                            {s.full_name?.charAt(0)}
                          </div>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                            <span className={cn("text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border", roleBg, roleTextColor)}>{member.role}</span>
                            {info && <span className="text-xs font-bold text-[#FF6357]">{info.totalH}h</span>}
                          </div>
                          {/* Assign button for bench staff */}
                          {member.role === 'Available' && (
                            <select value="" onChange={e => {
                              if (!e.target.value) return
                              const assignRole = e.target.value
                              const roleFieldMap: Record<string,string> = { 'Supervisor': 'supervisor_id', 'Bar': 'bar_staff_id', 'Floor1': 'floor_staff1_id', 'Floor2': 'floor_staff2_id' }
                              const fld = roleFieldMap[assignRole]
                              if (!fld) return
                              setGeneratedSlots((prev: any[]) => prev.map((gs: any) => {
                                if (gs.key !== slot.key) return gs
                                const newStaff = gs.staff.map((m: any) => m.id === member.id ? { ...m, role: assignRole === 'Floor1' || assignRole === 'Floor2' ? 'Floor' : assignRole } : m)
                                return { ...gs, [fld]: member.id, staff: newStaff }
                              }))
                            }} className="text-xs rounded-xl px-2 py-1 border-2 cursor-pointer font-bold bg-white text-[#FF6357] border-[#FF6357]/30 flex-shrink-0">
                              <option value="">+ Assign</option>
                              {!slot.supervisor_id && ['supervisor_floor','supervisor_bar','admin'].includes(STAFF_MAP[member.id]?.role) && <option value="Supervisor">As Supervisor</option>}
                              {!slot.bar_staff_id && <option value="Bar">As Bar</option>}
                              {!slot.floor_staff1_id && <option value="Floor1">As Floor</option>}
                              {slot.floor_staff1_id && !slot.floor_staff2_id && <option value="Floor2">As 2nd Floor</option>}
                            </select>
                          )}
                          {/* Unassign button for assigned staff */}
                          {member.role !== 'Available' && (
                            <button onClick={() => {
                              setGeneratedSlots((prev: any[]) => prev.map((gs: any) => {
                                if (gs.key !== slot.key) return gs
                                const updated = { ...gs, [fieldName]: null }
                                const newStaff = gs.staff.map((m: any) => m.id === member.id ? { ...m, role: 'Available' } : m)
                                return { ...updated, staff: newStaff }
                              }))
                            }} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center flex-shrink-0 transition-colors text-gray-400 text-xs font-bold">✕</button>
                          )}
                          {/* Swap button for assigned staff */}
                          {member.role !== 'Available' && alts.length > 0 && (
                            <select value="" onChange={e => {
                              if (!e.target.value) return
                              const newId = e.target.value
                              setGeneratedSlots((prev: any[]) => prev.map((gs: any) => {
                                if (gs.key !== slot.key) return gs
                                const newHours = weekAvailability
                                  .filter((a: any) => a.staff_id === newId && a.slot_date === gs.date)
                                  .map((a: any) => { const match = a.slot_key.match(/_h(\\d+)$/); return match ? parseInt(match[1]) : -1 })
                                  .filter((h: number) => h >= 0).sort((a: number, b: number) => a - b)
                                const newInfo = newHours.length ? { startH: newHours[0], endH: newHours[newHours.length-1]+1, totalH: newHours[newHours.length-1]+1-newHours[0], hours: newHours } : null
                                const oldMember = { id: member.id, role: 'Available', info: member.info }
                                const newStaff = gs.staff.map((m: any) => {
                                  if (m.id === member.id) return { ...m, id: newId, info: newInfo }
                                  if (m.id === newId) return null
                                  return m
                                }).filter(Boolean)
                                if (!newStaff.some((m: any) => m.id === oldMember.id)) newStaff.push(oldMember)
                                return { ...(fieldName === '__bench__' ? gs : { ...gs, [fieldName]: newId }), staff: newStaff }
                              }))
                            }} className={cn("text-xs rounded-xl px-2 py-1 border-2 cursor-pointer font-bold bg-white flex-shrink-0", roleTextColor, "border-current/30")}>
                              <option value="">Swap</option>
                              {alts.map((sid: string) => <option key={sid} value={sid}>{STAFF_MAP[sid]?.full_name?.split(' ')[0]}</option>)}
                            </select>
                          )}
                        </div>
                        {/* Timeline */}
                        <div className="w-full">
                          {info ? (
                            <div className="relative">
                              <div className="relative h-5 rounded-full overflow-hidden" style={{backgroundColor: 'rgba(0,0,0,0.06)'}}>
                                <div className="absolute h-full opacity-30 rounded-full" style={{left: ((slot.rushStartH-8)/16*100)+'%', width: ((slot.rushEndH-slot.rushStartH)/16*100)+'%', backgroundColor: '#FB923C'}}/>
                                <div className="absolute h-full rounded-full transition-all duration-500" style={{left: Math.max(0,(info.startH-8)/16*100)+'%', width: Math.min(100-Math.max(0,(info.startH-8)/16*100),(info.totalH/16*100))+'%', backgroundColor: member.role==='Supervisor'?'#3B82F6':member.role==='Bar'?'#A855F7':'#22C55E', opacity: 0.85}}/>
                                <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{left: Math.max(0,(info.startH-8)/16*100)+'%', width: Math.min(100-Math.max(0,(info.startH-8)/16*100),(info.totalH/16*100))+'%'}}>
                                  <div className="w-full flex items-center justify-between px-1.5">
                                    <span className="text-white font-bold drop-shadow" style={{fontSize:'9px'}}>{fmtH(info.startH)}</span>
                                    <span className="text-white font-bold drop-shadow" style={{fontSize:'9px'}}>{fmtH(info.endH)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="relative mt-1" style={{height:'12px'}}>
                                {[8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24].map(h => (
                                  <span key={h} className="absolute text-gray-400" style={{left:((h-8)/16*100)+'%',fontSize:'8px',fontWeight:600,transform:'translateX(-50%)',whiteSpace:'nowrap'}}>
                                    {h===24?'12a':h===12?'12p':h>12?(h-12)+'p':h+'a'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="h-5 rounded-full" style={{backgroundColor:'rgba(0,0,0,0.06)'}}/>
                          )}
                        </div>
                      </div>
                      </>
                    )`;

const newLines = [...lines.slice(0, startLine), ...newCard.split("\n"), ...lines.slice(endLine + 1)];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("Done, lines:", newLines.length);
