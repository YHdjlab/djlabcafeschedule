const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Replace the generatedSlots rendering section
const oldPreview = `      {generatedSlots.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Generated Schedule Preview</CardTitle>
            <Button size="sm" onClick={saveSchedule} loading={saving}>Save & Submit</Button>
          </CardHeader>
          <div className="space-y-2">
            {generatedSlots.map((slot: any) => (
              <div key={slot.key} className={cn('p-3 rounded-xl border text-sm', slot.issues?.length ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200')}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#323232]">{slot.label}</span>
                  <Badge variant={slot.type === 'rush' ? 'coral' : 'blue'}>{slot.type}</Badge>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[slot.supervisor_id && { id: slot.supervisor_id, role: 'Sup' }, slot.bar_staff_id && { id: slot.bar_staff_id, role: 'Bar' }, slot.floor_staff1_id && { id: slot.floor_staff1_id, role: 'Floor' }, slot.floor_staff2_id && { id: slot.floor_staff2_id, role: 'Floor' }].filter(Boolean).map((a: any, i: number) => (
                    <span key={i} className="text-xs bg-white px-2 py-0.5 rounded-lg border">{STAFF_MAP[a.id]?.full_name?.split(' ')[0]} - {a.role}</span>
                  ))}
                </div>
                {slot.issues?.length > 0 && <p className="text-xs text-red-500 mt-1">{slot.issues.join(', ')}</p>}
              </div>
            ))}
          </div>
        </Card>
      ) : (`;

const newPreview = `      {generatedSlots.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#323232]">Generated Schedule Preview</h3>
            <Button size="sm" onClick={saveSchedule} loading={saving}>Save & Submit</Button>
          </div>
          {(() => {
            // Group slots by day
            const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
            return days.map(day => {
              const daySlots = generatedSlots.filter((s: any) => s.day === day)
              if (!daySlots.length) return null
              // Build per-staff assignments for this day
              const staffAssignments: Record<string, {role: string, slots: any[]}> = {}
              daySlots.forEach((slot: any) => {
                const add = (id: string, role: string) => {
                  if (!id) return
                  if (!staffAssignments[id]) staffAssignments[id] = { role, slots: [] }
                  staffAssignments[id].slots.push(slot)
                }
                add(slot.supervisor_id, 'Supervisor')
                add(slot.bar_staff_id, 'Bar')
                add(slot.floor_staff1_id, 'Floor')
                add(slot.floor_staff2_id, 'Floor')
              })
              const hasIssues = daySlots.some((s: any) => s.issues?.length > 0)
              const allIssues = daySlots.flatMap((s: any) => s.issues || [])
              return (
                <div key={day} className={cn('bg-white rounded-2xl border overflow-hidden', hasIssues ? 'border-red-200' : 'border-black/5')}>
                  <div className={cn('px-4 py-3 flex items-center justify-between', hasIssues ? 'bg-red-50' : day === 'Saturday' || day === 'Sunday' ? 'bg-orange-50' : 'bg-[#F7F0E8]')}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#323232]">{day}</span>
                      <span className="text-xs text-gray-400">{daySlots[0]?.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{Object.keys(staffAssignments).length} staff</span>
                      {hasIssues && <span className="text-xs text-red-500 font-medium">Issues</span>}
                    </div>
                  </div>
                  <div className="divide-y divide-black/5">
                    {Object.entries(staffAssignments).map(([staffId, data]: [string, any]) => {
                      const s = STAFF_MAP[staffId]
                      if (!s) return null
                      const startTime = data.slots[0]?.start || '08:00'
                      const endTime = data.slots[data.slots.length - 1]?.end || '00:00'
                      const startH = parseInt(startTime.split(':')[0])
                      const endH = endTime === '00:00' ? 24 : parseInt(endTime.split(':')[0])
                      const totalH = endH - startH
                      const formatT = (t: string) => {
                        if (t === '00:00') return '12am'
                        const h = parseInt(t.split(':')[0])
                        if (h === 0) return '12am'
                        if (h < 12) return h + 'am'
                        if (h === 12) return '12pm'
                        return (h-12) + 'pm'
                      }
                      return (
                        <div key={staffId} className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#323232] flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">{s.full_name?.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                              <p className="text-xs text-gray-400 capitalize">{data.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <p className="text-sm font-semibold text-[#323232]">{formatT(startTime)} - {formatT(endTime)}</p>
                              <p className="text-xs text-[#FF6357] font-medium">{totalH}h</p>
                            </div>
                            <div className="flex flex-col gap-1">
                              {data.slots.map((slot: any) => (
                                <span key={slot.key} className={cn('text-xs px-2 py-0.5 rounded-full font-medium', slot.type === 'rush' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600')}>{slot.type}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {hasIssues && (
                    <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                      <p className="text-xs text-red-500">{[...new Set(allIssues)].join(' · ')}</p>
                    </div>
                  )}
                </div>
              )
            })
          })()}
        </div>
      ) : (`;

ap = ap.replace(oldPreview, newPreview);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");

// Check if replacement worked
if (ap.includes("Generated Schedule Preview") && ap.includes("staffAssignments")) {
  console.log("Replacement successful");
} else {
  console.log("WARNING: replacement may have failed, checking...");
  console.log("Has old preview:", ap.includes("slot.issues?.length ? 'bg-red-50"));
  console.log("Has new preview:", ap.includes("staffAssignments"));
}
