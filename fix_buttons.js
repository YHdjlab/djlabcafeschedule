const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix top row - prevent wrapping and ensure consistent button placement
ap = ap.replace(
  '<div className="flex items-center gap-3 mb-3">',
  '<div className="flex items-center gap-2 mb-3 flex-nowrap">'
);

// Make name+role take available space, push buttons to right
ap = ap.replace(
  `                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                            <span className={cn("text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border", roleBg, roleTextColor)}>{member.role}</span>
                            {info && <span className="text-xs font-bold text-[#FF6357]">{info.totalH}h</span>}
                          </div>`,
  `                          <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-bold text-[#323232] truncate">{s.full_name?.split(' ')[0]}</p>
                            {member.role !== 'Available' && member.role !== 'Supervisor' ? (
                              <select value={member.role} onChange={e => {
                                const newRole = e.target.value
                                setGeneratedSlots((prev: any[]) => prev.map((gs: any) => {
                                  if (gs.key !== slot.key) return gs
                                  return { ...gs, staff: gs.staff.map((m: any) => m.id === member.id ? { ...m, role: newRole } : m) }
                                }))
                              }} className={cn("text-xs font-bold px-1.5 py-0.5 rounded-full border cursor-pointer flex-shrink-0", roleBg, roleTextColor)} style={{minWidth:0}}>
                                <option value="Bar">BAR</option>
                                <option value="Floor">FLOOR</option>
                              </select>
                            ) : (
                              <span className={cn("text-xs font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full border flex-shrink-0", roleBg, roleTextColor)}>{member.role}</span>
                            )}
                            {info && <span className="text-xs font-bold text-[#FF6357] flex-shrink-0">{info.totalH}h</span>}
                          </div>
                          {/* Action buttons - always right aligned */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">`
);

// Close the action buttons div before the timeline
ap = ap.replace(
  `                          {/* Unassign button for assigned staff */}
                          {member.role !== 'Available' && (
                            <button onClick={() => {
                              setGeneratedSlots((prev: any[]) => prev.map((gs: any) => {
                                if (gs.key !== slot.key) return gs
                                const updated = { ...gs, [fieldName]: null }
                                const newStaff = gs.staff.map((m: any) => m.id === member.id ? { ...m, role: 'Available' } : m)
                                return { ...updated, staff: newStaff }
                              }))
                            }} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center flex-shrink-0 transition-colors text-gray-400 text-xs font-bold">✕</button>
                          )}`,
  `                          {/* Unassign button for assigned staff */}
                          {member.role !== 'Available' && (
                            <button onClick={() => {
                              setGeneratedSlots((prev: any[]) => prev.map((gs: any) => {
                                if (gs.key !== slot.key) return gs
                                const updated = { ...gs, [fieldName]: null }
                                const newStaff = gs.staff.map((m: any) => m.id === member.id ? { ...m, role: 'Available' } : m)
                                return { ...updated, staff: newStaff }
                              }))
                            }} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center flex-shrink-0 transition-colors text-gray-400 text-xs font-bold border border-gray-200">✕</button>
                          )}`
);

// Close the action buttons wrapper div after swap
ap = ap.replace(
  `                            </select>
                          )}
                        </div>
                        {/* Timeline */}`,
  `                            </select>
                          )}
                          </div>{/* end action buttons */}
                        </div>
                        {/* Timeline */}`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
