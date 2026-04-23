const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");

// Find the line with "Generated Schedule Preview"
let startLine = -1, endLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("generatedSlots.length > 0 ? (") && startLine === -1) {
    startLine = i;
  }
  if (startLine > -1 && lines[i].includes("Auto-Generate Schedule from Availability")) {
    endLine = i;
    break;
  }
}

console.log("Start line:", startLine, "End line:", endLine);
console.log("Start:", lines[startLine]);
console.log("End:", lines[endLine]);

if (startLine === -1 || endLine === -1) {
  console.log("Could not find section"); process.exit(1);
}

const newSection = `      {generatedSlots.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#323232]">Generated Schedule Preview</h3>
            <Button size="sm" onClick={saveSchedule} loading={saving}>Save and Submit</Button>
          </div>
          {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => {
            const daySlots = generatedSlots.filter((s: any) => s.day === day)
            if (!daySlots.length) return null
            const staffMap: Record<string, {role: string, slots: any[]}> = {}
            daySlots.forEach((slot: any) => {
              const add = (id: string, role: string) => {
                if (!id) return
                if (!staffMap[id]) staffMap[id] = { role, slots: [] }
                staffMap[id].slots.push(slot)
              }
              add(slot.supervisor_id, 'Supervisor')
              add(slot.bar_staff_id, 'Bar')
              add(slot.floor_staff1_id, 'Floor')
              add(slot.floor_staff2_id, 'Floor')
            })
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
                  <span className="text-xs text-gray-500">{Object.keys(staffMap).length} staff assigned</span>
                </div>
                <div className="divide-y divide-black/5">
                  {Object.entries(staffMap).map(([id, data]: [string, any]) => {
                    const s = STAFF_MAP[id]
                    if (!s) return null
                    const start = data.slots[0]?.start || '08:00'
                    const end = data.slots[data.slots.length-1]?.end || '00:00'
                    const startH = parseInt(start.split(':')[0])
                    const endH = end === '00:00' ? 24 : parseInt(end.split(':')[0])
                    const hours = endH - startH
                    return (
                      <div key={id} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#323232] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{s.full_name?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                            <p className="text-xs text-gray-400">{data.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#323232]">{ft(start)} - {ft(end)}</p>
                          <p className="text-xs text-[#FF6357] font-medium">{hours}h total</p>
                        </div>
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
// Remove the closing of the old ternary from after
const newLines = [...before, ...newSection.split("\n"), ...after];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("Done - written " + newLines.length + " lines");
