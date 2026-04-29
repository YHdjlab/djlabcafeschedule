const fs = require("fs");
const https = require("https");

// ─── 1. Update JP and Miled roles via Management API ─────────────────────────
async function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const options = {
      hostname: "api.supabase.com",
      path: "/v1/projects/gxmdtemgiuvahlcaobrr/database/query",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer sbp_b091296166042eb5bc4e7fada7bfb81737dd8970",
        "Content-Length": Buffer.byteLength(data)
      }
    };
    const req = https.request(options, res => {
      let b = ""; res.on("data", d => b += d); res.on("end", () => resolve({ status: res.statusCode, body: b }));
    });
    req.on("error", reject); req.write(data); req.end();
  });
}

async function updateRoles() {
  // Drop old constraint, add new one with 'supervisor', update roles
  let r = await runSQL("ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check");
  console.log("Drop constraint:", r.status);
  r = await runSQL("ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('gm', 'admin', 'supervisor', 'floor', 'bar'))");
  console.log("Add constraint:", r.status);
  r = await runSQL("UPDATE profiles SET role = 'supervisor' WHERE role IN ('supervisor_floor', 'supervisor_bar', 'admin')");
  console.log("Update roles:", r.status, r.body);
  r = await runSQL("SELECT email, role FROM profiles ORDER BY role");
  console.log("Verify:", r.body);
}

updateRoles().then(() => {
  // ─── 2. Update utils.ts ─────────────────────────────────────────────────────
  let utils = fs.readFileSync("src/lib/utils.ts", "utf8");
  utils = utils
    .replace(/\['gm', 'admin', 'supervisor_floor', 'supervisor_bar'\]/g, "['gm', 'admin', 'supervisor']")
    .replace(/\['gm','admin','supervisor_floor','supervisor_bar'\]/g, "['gm','admin','supervisor']")
    .replace(/'supervisor_floor','supervisor_bar'/g, "'supervisor'")
    .replace(/supervisor_floor|supervisor_bar/g, "supervisor");
  fs.writeFileSync("src/lib/utils.ts", utils, "utf8");
  console.log("utils.ts updated");

  // ─── 3. Update all role checks across all tsx/ts files ──────────────────────
  const allFiles = [];
  function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
      const p = dir + "/" + f;
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (p.endsWith(".tsx") || p.endsWith(".ts")) allFiles.push(p);
    });
  }
  walk("src");

  allFiles.forEach(file => {
    let content = fs.readFileSync(file, "utf8");
    let changed = false;
    const replacements = [
      ["'supervisor_floor','supervisor_bar','admin'", "'supervisor'"],
      ["'supervisor_floor', 'supervisor_bar', 'admin'", "'supervisor'"],
      ["supervisor_floor','supervisor_bar", "supervisor"],
      ["supervisor_floor', 'supervisor_bar", "supervisor"],
      ["'gm', 'admin', 'supervisor_floor', 'supervisor_bar'", "'gm', 'admin', 'supervisor'"],
      ["['gm','admin','supervisor_floor','supervisor_bar']", "['gm','admin','supervisor']"],
      ["['gm', 'admin', 'supervisor_floor', 'supervisor_bar']", "['gm', 'admin', 'supervisor']"],
      ["role === 'supervisor_floor' || role === 'supervisor_bar'", "role === 'supervisor'"],
      ["s.role === 'supervisor_floor' || s.role === 'supervisor_bar'", "s.role === 'supervisor'"],
    ];
    replacements.forEach(([from, to]) => {
      if (content.includes(from)) { content = content.split(from).join(to); changed = true; }
    });
    if (changed) { fs.writeFileSync(file, content, "utf8"); console.log("Updated:", file.replace("src/", "")); }
  });

  // ─── 4. New availability grid - blocked hours UI ─────────────────────────────
  fs.writeFileSync("src/components/schedule/availability-grid.tsx", `'use client'
import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase-client'
import { format, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Send, Check } from 'lucide-react'

const BG = '#1a1a1a'
const CARD = '#242424'
const CARD2 = '#2e2e2e'
const BORDER = 'rgba(255,255,255,0.08)'
const CORAL = '#FF6357'
const CREAM = '#F7F0E8'
const MUTED = 'rgba(247,240,232,0.45)'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const HOURS = Array.from({length: 16}, (_, i) => i + 8) // 8am to 11pm
const WEEKEND = [4, 5, 6] // Fri, Sat, Sun

// Shifts for display reference
const SHIFTS = [
  { key: 'AM',  label: 'AM',  start: 8,  end: 16, color: '#f59e0b' },
  { key: 'MID', label: 'MID', start: 12, end: 20, color: '#f97316' },
  { key: 'PM',  label: 'PM',  start: 16, end: 24, color: '#6366f1' },
]

function fmtH(h: number) {
  if (h === 0 || h === 24) return '12am'
  if (h < 12) return h + 'am'
  if (h === 12) return '12pm'
  return (h - 12) + 'pm'
}

interface Props {
  profile: any; availability: any[]; schedules: any[]
  nextMonday: string; currentMonday: string; rushConfig: any[]
}

export function AvailabilityGrid({ profile, availability, schedules, nextMonday, currentMonday, rushConfig }: Props) {
  const [weekStart, setWeekStart] = useState(nextMonday)
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [submitted, setSubmitted] = useState(() =>
    availability.some((a: any) => a.week_starting === nextMonday && a.submitted)
  )

  const monday = new Date(weekStart + 'T00:00:00')

  // blocked[dayIndex][hour] = true means BLOCKED (cannot work)
  const [blocked, setBlocked] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    availability.forEach((a: any) => {
      if (a.week_starting === weekStart && !a.available) {
        const match = a.slot_key?.match(/_h(\\d+)$/)
        if (match) {
          const dateStr = a.slot_date
          const mon = new Date(weekStart + 'T00:00:00')
          for (let d = 0; d < 7; d++) {
            const ds = format(addDays(mon, d), 'yyyy-MM-dd')
            if (ds === dateStr) { map[d + '_' + match[1]] = true; break }
          }
        }
      }
    })
    return map
  })

  const flash = (msg: string) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(''), 2000) }

  const toggleHour = async (dayIndex: number, hour: number) => {
    const key = dayIndex + '_' + hour
    const isWeekend = WEEKEND.includes(dayIndex)
    const newBlocked = !blocked[key]

    // Can't block weekend hours without day off request
    if (isWeekend && newBlocked) {
      flash('Fri/Sat/Sun are mandatory. Submit a Day Off request if needed.')
      return
    }

    setBlocked(prev => ({ ...prev, [key]: newBlocked }))
    const dateStr = format(addDays(monday, dayIndex), 'yyyy-MM-dd')

    await supabase.from('availability').upsert({
      week_starting: weekStart,
      staff_id: profile.id,
      slot_key: dateStr + '_h' + hour,
      slot_label: DAYS[dayIndex] + ' ' + fmtH(hour),
      slot_date: dateStr,
      available: !newBlocked,
      submitted: false,
    }, { onConflict: 'week_starting,staff_id,slot_key' })
    flash('Saved')
  }

  const submitWeek = async () => {
    setSaving(true)
    // Mark all unblocked hours as available
    const rows = []
    for (let d = 0; d < 7; d++) {
      const dateStr = format(addDays(monday, d), 'yyyy-MM-dd')
      for (const h of HOURS) {
        const isBlocked = blocked[d + '_' + h]
        rows.push({
          week_starting: weekStart,
          staff_id: profile.id,
          slot_key: dateStr + '_h' + h,
          slot_label: DAYS[d] + ' ' + fmtH(h),
          slot_date: dateStr,
          available: !isBlocked,
          submitted: true,
        })
      }
    }
    await supabase.from('availability')
      .delete()
      .eq('week_starting', weekStart)
      .eq('staff_id', profile.id)
    await supabase.from('availability').upsert(rows, { onConflict: 'week_starting,staff_id,slot_key' })
    setSubmitted(true)
    flash('Submitted!')
    setSaving(false)
  }

  const blockedCount = Object.values(blocked).filter(Boolean).length
  const weekdayConfig = rushConfig.find((r: any) => r.day_type === 'weekday')
  const rushStart = parseInt((weekdayConfig?.rush_start || '15:00').split(':')[0])
  const rushEnd = parseInt((weekdayConfig?.rush_end || '21:00').split(':')[0])

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      {/* Week nav */}
      <div style={{backgroundColor:CARD,borderRadius:'16px',border:\`1px solid \${BORDER}\`,padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>
        <button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()-7); setWeekStart(format(d,'yyyy-MM-dd')); setBlocked({}); setSubmitted(false) }}
          style={{width:'36px',height:'36px',borderRadius:'10px',backgroundColor:'rgba(255,255,255,0.06)',border:\`1px solid \${BORDER}\`,color:CREAM,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <ChevronLeft size={16}/>
        </button>
        <div style={{textAlign:'center'}}>
          <p style={{color:CREAM,fontSize:'14px',fontWeight:700}}>{format(monday,'MMM d')} – {format(addDays(monday,6),'MMM d, yyyy')}</p>
          <p style={{color:MUTED,fontSize:'12px',marginTop:'2px'}}>{blockedCount > 0 ? blockedCount + ' hours blocked' : 'No blocks set — all hours available'}</p>
        </div>
        <button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()+7); setWeekStart(format(d,'yyyy-MM-dd')); setBlocked({}); setSubmitted(false) }}
          style={{width:'36px',height:'36px',borderRadius:'10px',backgroundColor:'rgba(255,255,255,0.06)',border:\`1px solid \${BORDER}\`,color:CREAM,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <ChevronRight size={16}/>
        </button>
      </div>

      {/* Legend */}
      <div style={{backgroundColor:CARD,borderRadius:'14px',border:\`1px solid \${BORDER}\`,padding:'14px 18px',display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{width:'28px',height:'16px',borderRadius:'4px',backgroundColor:'rgba(239,68,68,0.3)',border:'1px solid rgba(239,68,68,0.4)'}}/>
          <span style={{color:MUTED,fontSize:'12px'}}>Blocked (tap to toggle)</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{width:'28px',height:'16px',borderRadius:'4px',backgroundColor:'rgba(255,255,255,0.04)',border:\`1px solid \${BORDER}\`}}/>
          <span style={{color:MUTED,fontSize:'12px'}}>Available</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{width:'28px',height:'16px',borderRadius:'4px',backgroundColor:'rgba(249,115,22,0.2)',border:'1px solid rgba(249,115,22,0.3)'}}/>
          <span style={{color:MUTED,fontSize:'12px'}}>Rush hour</span>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:'12px'}}>
          {SHIFTS.map(s => (
            <div key={s.key} style={{display:'flex',alignItems:'center',gap:'6px'}}>
              <div style={{width:'28px',height:'6px',borderRadius:'3px',backgroundColor:s.color + '60'}}/>
              <span style={{color:MUTED,fontSize:'11px',fontWeight:600}}>{s.label} {fmtH(s.start)}–{fmtH(s.end)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day grids */}
      {DAYS.map((dayName, dayIndex) => {
        const date = addDays(monday, dayIndex)
        const dateStr = format(date, 'yyyy-MM-dd')
        const isWeekend = WEEKEND.includes(dayIndex)
        const isScheduled = schedules.some((s: any) =>
          s.slot_date === dateStr &&
          (s.supervisor_id === profile.id || s.bar_staff_id === profile.id ||
           s.floor_staff1_id === profile.id || s.floor_staff2_id === profile.id) &&
          s.status === 'approved'
        )
        const dayBlocked = HOURS.filter(h => blocked[dayIndex + '_' + h]).length

        return (
          <div key={dayName} style={{backgroundColor:CARD,borderRadius:'14px',border: isWeekend ? '1px solid rgba(255,99,87,0.2)' : \`1px solid \${BORDER}\`,overflow:'hidden'}}>
            {/* Day header */}
            <div style={{padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',backgroundColor: isWeekend ? 'rgba(255,99,87,0.08)' : 'rgba(255,255,255,0.03)',borderBottom:\`1px solid \${BORDER}\`}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <p style={{color:CREAM,fontSize:'14px',fontWeight:700}}>{dayName}</p>
                <p style={{color:MUTED,fontSize:'11px'}}>{format(date,'MMM d')}</p>
                {isWeekend && <span style={{backgroundColor:'rgba(255,99,87,0.2)',color:CORAL,fontSize:'10px',fontWeight:700,padding:'2px 8px',borderRadius:'20px'}}>Mandatory</span>}
                {isScheduled && <span style={{backgroundColor:'rgba(34,197,94,0.2)',color:'#22c55e',fontSize:'10px',fontWeight:700,padding:'2px 8px',borderRadius:'20px'}}>Scheduled</span>}
              </div>
              <span style={{color: dayBlocked > 0 ? '#ef4444' : '#22c55e',fontSize:'11px',fontWeight:600}}>
                {dayBlocked > 0 ? dayBlocked + 'h blocked' : 'All available'}
              </span>
            </div>

            {/* Hour grid */}
            <div style={{padding:'10px 14px'}}>
              {/* Shift markers */}
              <div style={{position:'relative',height:'6px',marginBottom:'6px'}}>
                {SHIFTS.map(s => (
                  <div key={s.key} style={{
                    position:'absolute',height:'100%',borderRadius:'3px',
                    backgroundColor: s.color + '50',
                    left: ((s.start - 8) / 16 * 100) + '%',
                    width: (Math.min(s.end, 24) - s.start) / 16 * 100 + '%',
                  }}/>
                ))}
              </div>
              {/* Hours */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(16,1fr)',gap:'2px'}}>
                {HOURS.map(h => {
                  const isBlocked = blocked[dayIndex + '_' + h]
                  const isRush = !isWeekend && h >= rushStart && h < rushEnd
                  return (
                    <button key={h} onClick={() => toggleHour(dayIndex, h)} title={fmtH(h) + (isBlocked ? ' — blocked' : ' — available')}
                      style={{
                        height:'32px',borderRadius:'4px',border:'none',cursor:'pointer',
                        backgroundColor: isBlocked ? 'rgba(239,68,68,0.35)' : isRush ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)',
                        borderTop: isBlocked ? '2px solid rgba(239,68,68,0.6)' : isRush ? '2px solid rgba(249,115,22,0.3)' : '2px solid rgba(255,255,255,0.06)',
                        transition:'all 0.1s',
                        position:'relative',
                      }}>
                      <span style={{position:'absolute',bottom:'-14px',left:'50%',transform:'translateX(-50%)',color:'rgba(247,240,232,0.25)',fontSize:'8px',fontWeight:600,whiteSpace:'nowrap'}}>
                        {h % 2 === 0 ? fmtH(h) : ''}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div style={{height:'16px'}}/>
            </div>
          </div>
        )
      })}

      {/* Submit */}
      <div style={{backgroundColor:CARD,borderRadius:'16px',border:\`1px solid \${BORDER}\`,padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px'}}>
        <div>
          <p style={{color:CREAM,fontSize:'14px',fontWeight:700}}>
            {blockedCount > 0 ? blockedCount + ' hours blocked this week' : 'All hours available'}
          </p>
          <p style={{color:MUTED,fontSize:'12px',marginTop:'2px'}}>
            Tap any hour to mark it as blocked. Everything else is available for scheduling.
          </p>
          {savedMsg && <p style={{color:'#22c55e',fontSize:'12px',fontWeight:600,marginTop:'4px'}}>{savedMsg}</p>}
        </div>
        {submitted ? (
          <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 18px',borderRadius:'12px',backgroundColor:'rgba(34,197,94,0.15)',color:'#22c55e',fontSize:'13px',fontWeight:700,flexShrink:0}}>
            <Check size={14}/> Submitted
          </div>
        ) : (
          <button onClick={submitWeek} disabled={saving}
            style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 20px',borderRadius:'12px',backgroundColor:CORAL,color:'white',fontSize:'13px',fontWeight:700,border:'none',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,boxShadow:'0 2px 12px rgba(255,99,87,0.4)',opacity: saving ? 0.6 : 1}}>
            <Send size={13}/>{saving ? 'Submitting...' : 'Submit Availability'}
          </button>
        )}
      </div>
    </div>
  )
}
`);
  console.log("availability-grid.tsx rewritten");

  // ─── 5. Update availability page ─────────────────────────────────────────────
  fs.writeFileSync("src/app/(dashboard)/availability/page.tsx", `import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { AvailabilityGrid } from '@/components/schedule/availability-grid'
import { getNextMonday, getCurrentWeekMonday } from '@/lib/utils'

export default async function AvailabilityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')
  const nextMonday = getNextMonday()
  const currentMonday = getCurrentWeekMonday()
  const [{ data: availability }, { data: rushConfig }, { data: schedules }] = await Promise.all([
    supabase.from('availability').select('*').eq('staff_id', user.id).gte('week_starting', currentMonday),
    supabase.from('rush_hour_config').select('*'),
    supabase.from('schedules').select('*').gte('slot_date', currentMonday)
      .or('supervisor_id.eq.' + user.id + ',bar_staff_id.eq.' + user.id + ',floor_staff1_id.eq.' + user.id + ',floor_staff2_id.eq.' + user.id),
  ])
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
      <div>
        <h1 style={{color:'#F7F0E8',fontSize:'22px',fontWeight:800,marginBottom:'4px'}}>My Availability</h1>
        <p style={{color:'rgba(247,240,232,0.45)',fontSize:'13px'}}>Tap hours you cannot work. Everything else is considered available for scheduling.</p>
      </div>
      <AvailabilityGrid
        profile={profile}
        availability={availability || []}
        schedules={schedules || []}
        nextMonday={nextMonday}
        currentMonday={currentMonday}
        rushConfig={rushConfig || []}
      />
    </div>
  )
}
`);
  console.log("availability/page.tsx updated");

  // ─── 6. Update schedule builder - supervisor role + new generation logic ──────
  let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

  // Fix role checks
  ap = ap.replace(/\['supervisor_floor','supervisor_bar','admin'\]/g, "['supervisor']");
  ap = ap.replace(/\['supervisor_floor', 'supervisor_bar', 'admin'\]/g, "['supervisor']");
  ap = ap.replace(/supRoles = \['supervisor_floor','supervisor_bar','admin'\]/g, "supRoles = ['supervisor']");
  ap = ap.replace(/ROLE_LABELS\[s\.role\]/g, "ROLE_LABELS[s.role] || s.role");

  // Fix generation logic - supervisor always required per shift
  ap = ap.replace(
    "      const supRoles = ['supervisor_floor','supervisor_bar','admin']",
    "      const supRoles = ['supervisor']"
  );
  ap = ap.replace(
    "      const floorRoles = ['floor','supervisor_floor','admin']",
    "      const floorRoles = ['floor','supervisor']"
  );
  ap = ap.replace(
    "      if (!supervisor_id) issues.push('No supervisor available')",
    "      if (!supervisor_id) issues.push('⚠️ No supervisor — shift cannot run')"
  );

  fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
  console.log("admin-panel.tsx updated");

  // ─── 7. Update ROLE_LABELS in utils ──────────────────────────────────────────
  let utils = fs.readFileSync("src/lib/utils.ts", "utf8");
  utils = utils.replace(
    /supervisor_floor.*?supervisor_bar.*?\n.*?\n/s,
    "  supervisor: 'Supervisor',\n  "
  );
  // Simpler approach
  utils = utils
    .replace("'supervisor_floor': 'Supervisor (Floor)'", "'supervisor': 'Supervisor'")
    .replace("'supervisor_bar': 'Supervisor (Bar)'", "")
    .replace("supervisor_floor: 'Supervisor (Floor)'", "supervisor: 'Supervisor'")
    .replace("supervisor_bar: 'Supervisor (Bar)'", "");
  fs.writeFileSync("src/lib/utils.ts", utils, "utf8");
  console.log("utils.ts ROLE_LABELS updated");

  console.log("\n✅ Done! Run: npm run build && git add . && git commit -m 'New availability UI, supervisor role, updated schedule logic' && git push");
});
