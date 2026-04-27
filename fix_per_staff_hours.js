const fs = require("fs");

// Update schedule page to also fetch availability
fs.writeFileSync("src/app/(dashboard)/schedule/page.tsx", `import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { ScheduleView } from '@/components/schedule/schedule-view'

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')
  const isAdmin = ['gm', 'admin', 'supervisor_floor', 'supervisor_bar'].includes(profile.role)

  const query = supabase
    .from('schedules')
    .select('*, supervisor:supervisor_id(id,full_name,role), bar_staff:bar_staff_id(id,full_name,role), floor_staff1:floor_staff1_id(id,full_name,role), floor_staff2:floor_staff2_id(id,full_name,role)')
    .order('slot_date', { ascending: true })

  const [{ data: allSchedules }, { data: availability }] = await Promise.all([
    isAdmin ? query : query.eq('status', 'approved'),
    supabase.from('availability').select('staff_id, slot_key, slot_date, available').eq('available', true)
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#323232]">Schedule</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage shift schedules</p>
      </div>
      <ScheduleView schedules={allSchedules || []} profile={profile} isAdmin={isAdmin} availability={availability || []}/>
    </div>
  )
}
`);
console.log("page updated");

// Update schedule-view to use availability for per-person hours
let sv = fs.readFileSync("src/components/schedule/schedule-view.tsx", "utf8");

// Add availability to props
sv = sv.replace(
  `interface ScheduleViewProps {
  schedules: any[]
  profile: any
  isAdmin: boolean
}`,
  `interface ScheduleViewProps {
  schedules: any[]
  profile: any
  isAdmin: boolean
  availability: any[]
}`
);

sv = sv.replace(
  `export function ScheduleView({ schedules, profile, isAdmin }: ScheduleViewProps) {`,
  `export function ScheduleView({ schedules, profile, isAdmin, availability }: ScheduleViewProps) {`
);

// Add helper to get actual hours per staff per date
sv = sv.replace(
  `  const fmtH = (t: string) => {`,
  `  const getStaffHours = (staffId: string, dateStr: string) => {
    const hours = availability
      .filter((a: any) => a.staff_id === staffId && a.slot_date === dateStr)
      .map((a: any) => { const m = a.slot_key.match(/_h(\\d+)$/); return m ? parseInt(m[1]) : -1 })
      .filter((h: number) => h >= 0)
      .sort((a: number, b: number) => a - b)
    if (!hours.length) return null
    return { startH: hours[0], endH: hours[hours.length-1]+1, totalH: hours[hours.length-1]+1-hours[0] }
  }

  const fmtH = (t: string) => {`
);

// Update the bar to use per-staff hours instead of slot hours
sv = sv.replace(
  `                    {staff.map((s: any, i: number) => (
                      <div key={i} className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
                        style={{
                          backgroundColor: s.isMe ? 'rgba(255,99,87,0.06)' : \`\${s.color}10\`,
                          border: \`1px solid \${s.isMe ? 'rgba(255,99,87,0.2)' : s.color + '20'}\`,
                          outline: s.isMe ? '2px solid #FF6357' : 'none'
                        }}>
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                            style={{backgroundColor: s.isMe ? '#FF6357' : s.color}}>
                            {s.full_name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-base font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{color: s.isMe ? '#FF6357' : s.color, backgroundColor: s.isMe ? 'rgba(255,99,87,0.1)' : \`\${s.color}15\`}}>{s.role}</span>
                              {s.isMe && <span className="text-xs font-bold text-[#FF6357]">You</span>}
                              <span className="text-xs font-bold text-[#FF6357] ml-auto">{endH - startH}h</span>
                            </div>
                            {/* Timeline bar */}
                            <div className="relative h-5 rounded-full overflow-hidden" style={{backgroundColor: 'rgba(0,0,0,0.06)'}}>
                              <div className="absolute h-full opacity-25 rounded-full" style={{left: ((15-8)/16*100)+'%', width: ((21-15)/16*100)+'%', backgroundColor: '#FB923C'}}/>
                              <div className="absolute h-full rounded-full transition-all" style={{
                                left: Math.max(0, (startH - 8) / 16 * 100) + '%',
                                width: Math.min(100 - Math.max(0, (startH - 8) / 16 * 100), (endH - startH) / 16 * 100) + '%',
                                backgroundColor: s.isMe ? '#FF6357' : s.color,
                                opacity: 0.9
                              }}/>
                              {/* start/end labels positioned at actual bar location */}
                              <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{
                                left: Math.max(0, (startH - 8) / 16 * 100) + '%',
                                width: Math.min(100 - Math.max(0, (startH - 8) / 16 * 100), (endH - startH) / 16 * 100) + '%',
                              }}>
                                <div className="w-full flex items-center justify-between px-2">
                                  <span className="text-white font-bold drop-shadow" style={{fontSize:'10px'}}>{fmtH(slot.start_time)}</span>
                                  <span className="text-white font-bold drop-shadow" style={{fontSize:'10px'}}>{fmtH(slot.end_time)}</span>
                                </div>
                              </div>
                            </div>
                            {/* Hour markers */}
                            <div className="relative mt-1" style={{height:'12px'}}>
                              {[8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24].map(h => (
                                <span key={h} className="absolute text-gray-400" style={{left:((h-8)/16*100)+'%',fontSize:'8px',fontWeight:600,transform:'translateX(-50%)',whiteSpace:'nowrap'}}>
                                  {h===24?'12a':h===12?'12p':h>12?(h-12)+'p':h+'a'}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}`,
  `                    {staff.map((s: any, i: number) => {
                      const sh = getStaffHours(s.id, dateStr)
                      const sStart = sh ? sh.startH : startH
                      const sEnd = sh ? sh.endH : endH
                      const sTotalH = sh ? sh.totalH : (endH - startH)
                      return (
                      <div key={i} className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
                        style={{
                          backgroundColor: s.isMe ? 'rgba(255,99,87,0.06)' : \`\${s.color}10\`,
                          border: \`1px solid \${s.isMe ? 'rgba(255,99,87,0.2)' : s.color + '20'}\`,
                          outline: s.isMe ? '2px solid #FF6357' : 'none'
                        }}>
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                            style={{backgroundColor: s.isMe ? '#FF6357' : s.color}}>
                            {s.full_name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-base font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{color: s.isMe ? '#FF6357' : s.color, backgroundColor: s.isMe ? 'rgba(255,99,87,0.1)' : \`\${s.color}15\`}}>{s.role}</span>
                              {s.isMe && <span className="text-xs font-bold text-[#FF6357]">You</span>}
                              <span className="text-xs font-bold text-[#FF6357] ml-auto">{sTotalH}h</span>
                            </div>
                            <div className="relative h-5 rounded-full overflow-hidden" style={{backgroundColor: 'rgba(0,0,0,0.06)'}}>
                              <div className="absolute h-full opacity-25 rounded-full" style={{left: ((15-8)/16*100)+'%', width: ((21-15)/16*100)+'%', backgroundColor: '#FB923C'}}/>
                              <div className="absolute h-full rounded-full" style={{
                                left: Math.max(0,(sStart-8)/16*100)+'%',
                                width: Math.min(100-Math.max(0,(sStart-8)/16*100),(sTotalH/16*100))+'%',
                                backgroundColor: s.isMe ? '#FF6357' : s.color,
                                opacity: 0.9
                              }}/>
                              <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{
                                left: Math.max(0,(sStart-8)/16*100)+'%',
                                width: Math.min(100-Math.max(0,(sStart-8)/16*100),(sTotalH/16*100))+'%'
                              }}>
                                <div className="w-full flex items-center justify-between px-2">
                                  <span className="text-white font-bold drop-shadow" style={{fontSize:'10px'}}>{sStart < 12 ? sStart+'am' : sStart===12 ? '12pm' : (sStart-12)+'pm'}</span>
                                  <span className="text-white font-bold drop-shadow" style={{fontSize:'10px'}}>{sEnd===24?'12am':sEnd<12?sEnd+'am':sEnd===12?'12pm':(sEnd-12)+'pm'}</span>
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
                        </div>
                      </div>
                      )
                    })}`
);

fs.writeFileSync("src/components/schedule/schedule-view.tsx", sv, "utf8");
console.log("schedule-view updated");
