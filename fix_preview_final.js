const fs = require("fs");

// Run generate fix first
require("child_process").execSync("node fix_generate2.js", {stdio: "inherit"});

let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");

// Find the preview section
let startLine = -1, endLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("generatedSlots.length > 0 ? (") && startLine === -1) startLine = i;
  if (startLine > -1 && lines[i].includes("Auto-Generate Schedule from Availability")) { endLine = i; break; }
}
console.log("Preview section:", startLine, "to", endLine);
if (startLine === -1 || endLine === -1) { console.log("Not found"); process.exit(1); }

const newPreview = `      {generatedSlots.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#323232]">Schedule Preview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Based on actual availability. Swap staff using dropdowns.</p>
            </div>
            <button onClick={saveSchedule} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#FF6357] text-white text-sm font-semibold hover:bg-[#e5554a] transition-all disabled:opacity-50">
              {saving ? 'Saving...' : 'Save and Submit'}
            </button>
          </div>
          {generatedSlots.map((slot: any) => {
            const isWeekend = slot.isWeekend
            const fmtH = (h: number) => { if (h === 0 || h === 24) return '12am'; if (h < 12) return h + 'am'; if (h === 12) return '12pm'; return (h-12) + 'pm' }
            const slotAvail = (() => {
              const staffSet = new Set<string>()
              weekAvailability.filter((a: any) => a.slot_date === slot.date).forEach((a: any) => staffSet.add(a.staff_id))
              return Array.from(staffSet)
            })()
            return (
              <div key={slot.key} className={cn('bg-white rounded-2xl border overflow-hidden', slot.issues?.length ? 'border-red-200' : 'border-black/5')}>
                {/* Day header */}
                <div className={cn('px-5 py-3 flex items-center justify-between', slot.issues?.length ? 'bg-red-50' : isWeekend ? 'bg-orange-50' : 'bg-[#F7F0E8]')}>
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
                </div>
                {/* Rush band indicator for weekdays */}
                {!isWeekend && (
                  <div className="px-5 py-1.5 bg-white border-b border-black/5 flex items-center gap-2 text-xs text-gray-400">
                    <div className="flex-1 h-1.5 rounded-full bg-blue-100 relative overflow-hidden">
                      <div className="absolute h-full bg-orange-300 rounded-full"
                        style={{left: ((slot.rushStartH - 8) / 16 * 100) + '%', width: ((slot.rushEndH - slot.rushStartH) / 16 * 100) + '%'}}/>
                    </div>
                    <span className="whitespace-nowrap">Rush {fmtH(slot.rushStartH)}-{fmtH(slot.rushEndH)}</span>
                  </div>
                )}
                {/* Staff rows */}
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
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <button onClick={generateSchedule} disabled={generating}
          className="w-full py-4 rounded-2xl bg-[#323232] text-white font-semibold text-sm hover:bg-black transition-all disabled:opacity-50">
          {generating ? 'Generating...' : 'Auto-Generate Schedule from Availability'}`;

const before = lines.slice(0, startLine);
const after = lines.slice(endLine);
const newLines = [...before, ...newPreview.split("\n"), ...after];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("Preview rewritten - " + newLines.length + " lines");
