const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");

let startLine = -1, endLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("generatedSlots.length > 0 ? (") && startLine === -1) startLine = i;
  if (startLine > -1 && lines[i].includes("Auto-Generate Schedule from Availability")) { endLine = i; break; }
}
console.log("Start:", startLine, "End:", endLine);
if (startLine === -1 || endLine === -1) { console.log("Section not found"); process.exit(1); }

const newSection = `      {generatedSlots.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#323232]">Generated Schedule Preview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Auto-assigned by least hours. Use dropdowns to swap staff.</p>
            </div>
            <Button size="sm" onClick={saveSchedule} loading={saving}>Save and Submit</Button>
          </div>
          {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => {
            const daySlots = generatedSlots.filter((s: any) => s.day === day)
            if (!daySlots.length) return null
            const issues = [...new Set(daySlots.flatMap((s: any) => s.issues || []))]
            const isWeekend = day === 'Saturday' || day === 'Sunday'
            const ft = (t: string) => { if (t === '00:00') return '12am'; const h = parseInt(t.split(':')[0]); if (h < 12) return h + 'am'; if (h === 12) return '12pm'; return (h-12) + 'pm' }
            return (
              <div key={day} className={cn('bg-white rounded-2xl border overflow-hidden', issues.length ? 'border-red-200' : 'border-black/5')}>
                <div className={cn('px-4 py-3 flex items-center justify-between', issues.length ? 'bg-red-50' : isWeekend ? 'bg-orange-50' : 'bg-[#F7F0E8]')}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#323232]">{day}</span>
                    <span className="text-xs text-gray-400">{daySlots[0]?.date}</span>
                  </div>
                  <span className="text-xs text-gray-500">{daySlots.length} shift{daySlots.length > 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-black/5">
                  {daySlots.map((slot: any) => {
                    const assigned = [
                      slot.supervisor_id && { id: slot.supervisor_id, role: 'Supervisor', field: 'supervisor_id', eligibleRoles: ['supervisor_floor','supervisor_bar'] },
                      slot.bar_staff_id && { id: slot.bar_staff_id, role: 'Bar', field: 'bar_staff_id', eligibleRoles: ['bar','supervisor_bar'] },
                      slot.floor_staff1_id && { id: slot.floor_staff1_id, role: 'Floor', field: 'floor_staff1_id', eligibleRoles: ['floor','supervisor_floor'] },
                      slot.floor_staff2_id && { id: slot.floor_staff2_id, role: 'Floor 2', field: 'floor_staff2_id', eligibleRoles: ['floor','supervisor_floor'] },
                    ].filter(Boolean)
                    const slotAvail = getAvail(slot)
                    return (
                      <div key={slot.key} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#323232]">{slot.label}</span>
                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', slot.type === 'rush' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600')}>{slot.type}</span>
                          </div>
                          <span className="text-xs text-gray-400">{ft(slot.start)} - {ft(slot.end === '00:00' ? '00:00' : slot.end)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {assigned.map((a: any) => {
                            const current = STAFF_MAP[a.id]
                            const alternatives = slotAvail.filter((sid: string) =>
                              sid !== a.id && a.eligibleRoles.includes(STAFF_MAP[sid]?.role) &&
                              sid !== slot.supervisor_id && sid !== slot.bar_staff_id &&
                              (a.field === 'floor_staff1_id' || sid !== slot.floor_staff1_id) &&
                              (a.field === 'floor_staff2_id' || sid !== slot.floor_staff2_id)
                            )
                            return (
                              <div key={a.field} className="flex items-center gap-2 p-2 rounded-xl bg-[#F7F0E8]">
                                <div className="w-6 h-6 rounded-full bg-[#323232] flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-bold">{current?.full_name?.charAt(0)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-[#323232] truncate">{current?.full_name?.split(' ')[0] || 'Unassigned'}</p>
                                  <p className="text-xs text-gray-400">{a.role}</p>
                                </div>
                                {alternatives.length > 0 && (
                                  <select
                                    value=""
                                    onChange={e => {
                                      if (!e.target.value) return
                                      setGeneratedSlots(prev => prev.map((gs: any) =>
                                        gs.key === slot.key ? { ...gs, [a.field]: e.target.value } : gs
                                      ))
                                    }}
                                    className="text-xs border border-black/10 rounded-lg px-1 py-0.5 bg-white text-[#323232] cursor-pointer"
                                  >
                                    <option value="">Swap</option>
                                    {alternatives.map((sid: string) => (
                                      <option key={sid} value={sid}>{STAFF_MAP[sid]?.full_name?.split(' ')[0]}</option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        {slot.issues?.length > 0 && (
                          <p className="text-xs text-red-500 mt-2">{slot.issues.join(' · ')}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
                {issues.length > 0 && (
                  <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                    <p className="text-xs text-red-500">{issues.join(' · ')}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <Button onClick={generateSchedule} loading={generating} className="w-full" size="lg">
          Auto-Generate Schedule from Availability`;

const before = lines.slice(0, startLine);
const after = lines.slice(endLine);
const newLines = [...before, ...newSection.split("\n"), ...after];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("Done - " + newLines.length + " lines");
