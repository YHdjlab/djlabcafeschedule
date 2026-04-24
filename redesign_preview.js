const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// 1. Fix missing ChevronLeft/ChevronRight import
ap = ap.replace(
  "import { Users, Settings, Calendar, CheckSquare, ArrowLeftRight, CalendarOff, Check, X, Clock, Wand2, Eye } from 'lucide-react'",
  "import { Users, Settings, Calendar, CheckSquare, ArrowLeftRight, CalendarOff, Check, X, Clock, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'"
);

// 2. Fix the ? week nav buttons
ap = ap.replace(
  `<button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()-7); setWeekStart(format(d,'yyyy-MM-dd')); setGeneratedSlots([]) }} className="p-2 rounded-lg hover:bg-black/5">?</button>`,
  `<button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()-7); setWeekStart(format(d,'yyyy-MM-dd')); setGeneratedSlots([]) }} className="w-9 h-9 rounded-xl bg-[#F7F0E8] hover:bg-black/10 flex items-center justify-center transition-colors"><ChevronLeft size={16}/></button>`
);
ap = ap.replace(
  `<button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()+7); setWeekStart(format(d,'yyyy-MM-dd')); setGeneratedSlots([]) }} className="p-2 rounded-lg hover:bg-black/5">?</button>`,
  `<button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()+7); setWeekStart(format(d,'yyyy-MM-dd')); setGeneratedSlots([]) }} className="w-9 h-9 rounded-xl bg-[#F7F0E8] hover:bg-black/10 flex items-center justify-center transition-colors"><ChevronRight size={16}/></button>`
);

// 3. Redesign the schedule preview card rendering
const oldStaffRows = `                {/* Staff rows */}
                <div className="divide-y divide-black/5">
                  {(slot.staff || []).map((member: any) => {
                    const s = STAFF_MAP[member.id]
                    if (!s) return null
                    const info = member.info
                    const roleColor = member.role === 'Supervisor' ? 'bg-blue-500' : member.role === 'Bar' ? 'bg-purple-500' : 'bg-green-500'
                    const roleTextColor = member.role === 'Supervisor' ? 'text-blue-600' : member.role === 'Bar' ? 'text-purple-600' : 'text-green-600'
                    const eligibleRoles = member.role === 'Supervisor' ? ['supervisor_floor','supervisor_bar'] : member.role === 'Bar' ? ['bar','supervisor_bar'] : ['floor','supervisor_floor']
                    const fieldName = member.role === 'Supervisor' ? 'supervisor_id' : member.role === 'Bar' ? 'bar_staff_id' : member.id === slot.floor_staff1_id ? 'floor_staff1_id' : 'floor_staff2_id'
                    const alts = slotAvail.filter((sid: string) =>
                      sid !== member.id &&
                      eligibleRoles.includes(STAFF_MAP[sid]?.role) &&
                      sid !== slot.supervisor_id &&
                      sid !== slot.bar_staff_id &&
                      (fieldName === 'floor_staff1_id' || sid !== slot.floor_staff1_id) &&
                      (fieldName === 'floor_staff2_id' || sid !== slot.floor_staff2_id)
                    )
                    return (
                      <div key={member.id} className="px-5 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0", roleColor)}>
                            {s.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                            <p className={cn("text-xs font-medium", roleTextColor)}>{member.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {info ? (
                            <div className="text-right">
                              <p className="text-sm font-bold text-[#323232]">{fmtH(info.startH)} - {fmtH(info.endH)}</p>
                              <p className="text-xs text-[#FF6357] font-medium">{info.totalH}h</p>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">Hours unknown</p>
                          )}
                          {alts.length > 0 && (
                            <select value="" onChange={e => {
                              if (!e.target.value) return
                              const newId = e.target.value
                              setGeneratedSlots((prev: any[]) => prev.map((gs: any) => {
                                if (gs.key !== slot.key) return gs
                                const updated = { ...gs, [fieldName]: newId }
                                const newStaff = gs.staff.map((m: any) => m.id === member.id ? { ...m, id: newId, info: null } : m)
                                return { ...updated, staff: newStaff }
                              }))
                            }}
                              className="text-xs border border-[#FF6357]/40 rounded-lg px-2 py-1 bg-white text-[#FF6357] cursor-pointer font-medium">
                              <option value="">Swap</option>
                              {alts.map((sid: string) => (
                                <option key={sid} value={sid}>{STAFF_MAP[sid]?.full_name?.split(' ')[0]}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {/* Issues */}
                {slot.issues?.length > 0 && (
                  <div className="px-5 py-2 bg-red-50 border-t border-red-100 flex items-center gap-2">
                    <span className="text-xs text-red-500">{slot.issues.join(' - ')}</span>
                  </div>
                )}`;

const newStaffRows = `                {/* Staff grid */}
                <div className="p-4 grid grid-cols-2 gap-3">
                  {(slot.staff || []).map((member: any) => {
                    const s = STAFF_MAP[member.id]
                    if (!s) return null
                    const info = member.info
                    const roleColor = member.role === 'Supervisor' ? 'bg-blue-500' : member.role === 'Bar' ? 'bg-purple-500' : 'bg-green-500'
                    const roleBg = member.role === 'Supervisor' ? 'bg-blue-50 border-blue-100' : member.role === 'Bar' ? 'bg-purple-50 border-purple-100' : 'bg-green-50 border-green-100'
                    const roleTextColor = member.role === 'Supervisor' ? 'text-blue-600' : member.role === 'Bar' ? 'text-purple-600' : 'text-green-600'
                    const eligibleRoles = member.role === 'Supervisor' ? ['supervisor_floor','supervisor_bar'] : member.role === 'Bar' ? ['bar','supervisor_bar'] : ['floor','supervisor_floor']
                    const fieldName = member.role === 'Supervisor' ? 'supervisor_id' : member.role === 'Bar' ? 'bar_staff_id' : member.id === slot.floor_staff1_id ? 'floor_staff1_id' : 'floor_staff2_id'
                    const alts = slotAvail.filter((sid: string) =>
                      sid !== member.id &&
                      eligibleRoles.includes(STAFF_MAP[sid]?.role) &&
                      sid !== slot.supervisor_id &&
                      sid !== slot.bar_staff_id &&
                      (fieldName === 'floor_staff1_id' || sid !== slot.floor_staff1_id) &&
                      (fieldName === 'floor_staff2_id' || sid !== slot.floor_staff2_id)
                    )
                    return (
                      <div key={member.id} className={cn("rounded-2xl border p-3 flex flex-col gap-2", roleBg)}>
                        <div className="flex items-center justify-between">
                          <span className={cn("text-xs font-bold uppercase tracking-wide", roleTextColor)}>{member.role}</span>
                          {alts.length > 0 && (
                            <select value="" onChange={e => {
                              if (!e.target.value) return
                              const newId = e.target.value
                              setGeneratedSlots((prev: any[]) => prev.map((gs: any) => {
                                if (gs.key !== slot.key) return gs
                                const updated = { ...gs, [fieldName]: newId }
                                const newStaff = gs.staff.map((m: any) => m.id === member.id ? { ...m, id: newId, info: null } : m)
                                return { ...updated, staff: newStaff }
                              }))
                            }}
                              className={cn("text-xs rounded-lg px-2 py-0.5 border cursor-pointer font-semibold bg-white", roleTextColor, "border-current/20")}>
                              <option value="">Swap</option>
                              {alts.map((sid: string) => (
                                <option key={sid} value={sid}>{STAFF_MAP[sid]?.full_name?.split(' ')[0]}</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0", roleColor)}>
                            {s.full_name?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#323232] truncate">{s.full_name?.split(' ')[0]}</p>
                            {info ? (
                              <p className="text-xs text-gray-500">{fmtH(info.startH)}-{fmtH(info.endH)} <span className="font-semibold text-[#FF6357]">{info.totalH}h</span></p>
                            ) : (
                              <p className="text-xs text-gray-400">-</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {/* Issues */}
                {slot.issues?.length > 0 && (
                  <div className="mx-4 mb-4 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5"/>
                    <span className="text-xs text-red-500 font-medium">{slot.issues.join(' · ')}</span>
                  </div>
                )}`;

ap = ap.replace(oldStaffRows, newStaffRows);

// 4. Make the day header more premium
ap = ap.replace(
  `<div className={cn('px-5 py-3 flex items-center justify-between', slot.issues?.length ? 'bg-red-50' : isWeekend ? 'bg-orange-50' : 'bg-[#F7F0E8]')}>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-bold text-[#323232]">{slot.day}</p>
                      <p className="text-xs text-gray-400">{slot.date}</p>
                    </div>
                    {isWeekend && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-200 text-orange-700 font-medium">Full Rush Day</span>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#323232]">{fmtH(slot.startH)} - {fmtH(slot.endH)}</p>
                    <p className="text-xs text-gray-400">{slot.staff?.length || 0} staff assigned</p>
                  </div>
                </div>`,
  `<div className={cn('px-5 py-4 flex items-center justify-between', slot.issues?.length ? 'bg-red-50' : isWeekend ? 'bg-[#323232]' : 'bg-[#323232]')}>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-bold text-white text-lg">{slot.day}</p>
                      <p className="text-xs text-white/50">{slot.date}</p>
                    </div>
                    {isWeekend && <span className="text-xs px-2.5 py-1 rounded-full bg-[#FF6357] text-white font-semibold">Full Rush</span>}
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-white">{fmtH(slot.startH)} - {fmtH(slot.endH)}</p>
                    <p className="text-xs text-white/50">{slot.staff?.length || 0} staff · {slot.issues?.length ? slot.issues.length + ' issue' + (slot.issues.length > 1 ? 's' : '') : 'all good'}</p>
                  </div>
                </div>`
);

// 5. Fix the rush band bar section
ap = ap.replace(
  `{!isWeekend && (
                  <div className="px-5 py-1.5 bg-white border-b border-black/5 flex items-center gap-2 text-xs text-gray-400">
                    <div className="flex-1 h-1.5 rounded-full bg-blue-100 relative overflow-hidden">
                      <div className="absolute h-full bg-orange-300 rounded-full"
                        style={{left: ((slot.rushStartH - 8) / 16 * 100) + '%', width: ((slot.rushEndH - slot.rushStartH) / 16 * 100) + '%'}}/>
                    </div>
                    <span className="whitespace-nowrap">Rush {fmtH(slot.rushStartH)}-{fmtH(slot.rushEndH)}</span>
                  </div>
                )}`,
  `{!isWeekend && (
                  <div className="px-5 py-2 bg-white border-b border-black/5 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-gray-100 relative overflow-hidden">
                      <div className="absolute h-full bg-blue-200 rounded-full" style={{left: '0%', width: ((slot.rushStartH - 8) / 16 * 100) + '%'}}/>
                      <div className="absolute h-full bg-orange-300 rounded-full" style={{left: ((slot.rushStartH - 8) / 16 * 100) + '%', width: ((slot.rushEndH - slot.rushStartH) / 16 * 100) + '%'}}/>
                      <div className="absolute h-full bg-blue-200 rounded-full" style={{left: ((slot.rushEndH - 8) / 16 * 100) + '%', width: ((24 - slot.rushEndH) / 16 * 100) + '%'}}/>
                    </div>
                    <div className="flex gap-3 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-200 inline-block"/>Off-rush</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-300 inline-block"/>Rush {fmtH(slot.rushStartH)}-{fmtH(slot.rushEndH)}</span>
                    </div>
                  </div>
                )}`
);

// 6. Fix the preview header
ap = ap.replace(
  `          <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#323232]">Schedule Preview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Based on actual availability. Swap staff using dropdowns.</p>
            </div>
            <button onClick={saveSchedule} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#FF6357] text-white text-sm font-semibold hover:bg-[#e5554a] transition-all disabled:opacity-50">
              {saving ? 'Saving...' : 'Save and Submit'}
            </button>
          </div>`,
  `          <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-[#323232]">Schedule Preview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Auto-assigned by least hours. Use Swap to override.</p>
            </div>
            <button onClick={saveSchedule} disabled={saving}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6357] text-white text-sm font-bold hover:bg-[#e5554a] transition-all disabled:opacity-50 shadow-sm">
              {saving ? 'Saving...' : 'Save and Submit'}
            </button>
          </div>`
);

// 7. Fix the day card border
ap = ap.replace(
  `<div key={slot.key} className={cn('bg-white rounded-2xl border overflow-hidden', slot.issues?.length ? 'border-red-200' : 'border-black/5')}>`,
  `<div key={slot.key} className={cn('bg-white rounded-2xl overflow-hidden shadow-sm', slot.issues?.length ? 'ring-2 ring-red-200' : 'ring-1 ring-black/5')}>`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("Done");
