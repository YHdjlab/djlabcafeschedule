'use client'
import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase-client'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Check, Send, Sun, Sunset, Moon } from 'lucide-react'

interface Props {
  profile: any
  availability: any[]
  schedules: any[]
  nextMonday: string
  currentMonday: string
  rushConfig: any[]
}

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const FULL_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const WEEKEND_DAYS = [4, 5, 6] // Fri, Sat, Sun indices

const SHIFTS = [
  { key: 'AM',  label: 'AM Shift',  time: '8am - 4pm',  startH: 8,  endH: 16, color: 'bg-amber-400',   textColor: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   icon: '☀️' },
  { key: 'MID', label: 'MID Shift', time: '12pm - 8pm', startH: 12, endH: 20, color: 'bg-orange-400',  textColor: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200',  icon: '🌤️' },
  { key: 'PM',  label: 'PM Shift',  time: '4pm - 12am', startH: 16, endH: 24, color: 'bg-indigo-500',  textColor: 'text-indigo-700',  bg: 'bg-indigo-50',  border: 'border-indigo-200',  icon: '🌙' },
]

const MAX_PER_TYPE = 2

export function AvailabilityGrid({ profile, availability, schedules, nextMonday, currentMonday, rushConfig }: Props) {
  const [weekStart, setWeekStart] = useState(nextMonday)
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  // Load existing shift selections from availability data
  // Format: slot_key = "2026-04-27_shift_AM"
  const [selections, setSelections] = useState<Record<string, string | null>>(() => {
    const map: Record<string, string | null> = {}
    // Init all days to null
    for (let d = 0; d < 7; d++) map[d] = null
    // Load from existing availability
    availability.forEach((a: any) => {
      if (a.week_starting === nextMonday && a.available) {
        const match = a.slot_key?.match(/_shift_(AM|MID|PM)$/)
        if (match) {
          const dateStr = a.slot_date
          // find day index
          const monday = new Date(nextMonday + 'T00:00:00')
          for (let d = 0; d < 7; d++) {
            const ds = format(addDays(monday, d), 'yyyy-MM-dd')
            if (ds === dateStr) { map[d] = match[1]; break }
          }
        }
      }
    })
    return map
  })

  const [submitted, setSubmitted] = useState(() =>
    availability.some((a: any) => a.week_starting === nextMonday && a.submitted)
  )

  const monday = new Date(weekStart + 'T00:00:00')

  // Count how many of each shift type selected this week (excluding Sunday for limit purposes)
  const shiftCounts = useMemo(() => {
    const counts: Record<string, number> = { AM: 0, MID: 0, PM: 0 }
    for (let d = 0; d < 6; d++) { // Mon-Sat only for limit counting
      const s = selections[d]
      if (s) counts[s] = (counts[s] || 0) + 1
    }
    return counts
  }, [selections])

  const flash = (msg: string) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(''), 2500) }

  const selectShift = async (dayIndex: number, shiftKey: string | null) => {
    const isSunday = dayIndex === 6

    // If selecting (not clearing), check limits for non-Sunday days
    if (shiftKey && !isSunday) {
      const currentForDay = selections[dayIndex]
      const newCount = shiftCounts[shiftKey] - (currentForDay === shiftKey ? 1 : 0)
      if (newCount >= MAX_PER_TYPE) {
        flash('Max ' + MAX_PER_TYPE + ' ' + shiftKey + ' shifts per week!')
        return
      }
    }

    // Toggle - if same shift clicked, clear it (unless weekend mandatory)
    const newShift = selections[dayIndex] === shiftKey ? null : shiftKey
    const isWeekendDay = WEEKEND_DAYS.includes(dayIndex)

    // Weekends can't be cleared (mandatory) unless they have a day off request
    if (isWeekendDay && newShift === null) {
      flash('Fri/Sat/Sun are mandatory. Submit a Day Off request if needed.')
      return
    }

    setSelections(prev => ({ ...prev, [dayIndex]: newShift }))

    // Save to DB
    const dateStr = format(addDays(monday, dayIndex), 'yyyy-MM-dd')
    const dayName = FULL_DAYS[dayIndex]

    // Delete old shift for this day
    await supabase.from('availability')
      .delete()
      .eq('week_starting', weekStart)
      .eq('staff_id', profile.id)
      .eq('slot_date', dateStr)

    if (newShift) {
      const shift = SHIFTS.find(s => s.key === newShift)!
      // Insert all hours for this shift as individual slots (for compatibility with builder)
      const rows = []
      for (let h = shift.startH; h < shift.endH; h++) {
        rows.push({
          week_starting: weekStart,
          staff_id: profile.id,
          slot_key: dateStr + '_h' + h,
          slot_label: dayName + ' ' + (h < 12 ? h + ' AM' : h === 12 ? '12 PM' : (h-12) + ' PM'),
          slot_date: dateStr,
          available: true,
          submitted: false,
        })
      }
      // Also save the shift marker for display
      rows.push({
        week_starting: weekStart,
        staff_id: profile.id,
        slot_key: dateStr + '_shift_' + newShift,
        slot_label: dayName + ' ' + newShift + ' Shift',
        slot_date: dateStr,
        available: true,
        submitted: false,
      })
      await supabase.from('availability').upsert(rows, { onConflict: 'week_starting,staff_id,slot_key' })
    }
    flash('Saved')
  }

  const submitWeek = async () => {
    setSaving(true)
    await supabase.from('availability')
      .update({ submitted: true })
      .eq('week_starting', weekStart)
      .eq('staff_id', profile.id)
    setSubmitted(true)
    flash('Availability submitted!')
    setSaving(false)
  }

  const totalShifts = Object.values(selections).filter(Boolean).length
  const canSubmit = totalShifts > 0 && !submitted

  return (
    <div className="space-y-4">
      {/* Week nav */}
      <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm p-4 flex items-center justify-between">
        <button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()-7); setWeekStart(format(d,'yyyy-MM-dd')); setSelections({}); setSubmitted(false) }}
          style={{width:'36px',height:'36px',borderRadius:'10px',backgroundColor:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',color:'#F7F0E8',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <ChevronLeft size={16}/>
        </button>
        <div style={{textAlign:'center'}}>
          <p style={{color:'#F7F0E8',fontSize:'14px',fontWeight:700}}>{format(monday,'MMM d')} — {format(addDays(monday,6),'MMM d, yyyy')}</p>
          <p style={{color:'rgba(247,240,232,0.45)',fontSize:'12px',marginTop:'2px'}}>{totalShifts} shifts selected this week</p>
        </div>
        <button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()+7); setWeekStart(format(d,'yyyy-MM-dd')); setSelections({}); setSubmitted(false) }}
          style={{width:'36px',height:'36px',borderRadius:'10px',backgroundColor:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',color:'#F7F0E8',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <ChevronRight size={16}/>
        </button>
      </div>

      {/* Shift type counter */}
      <div className="grid grid-cols-3 gap-3">
        {SHIFTS.map(shift => (
          <div key={shift.key} style={{backgroundColor:'#242424',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.08)',padding:'14px',textAlign:'center'}}>
            <p className="text-lg">{shift.icon}</p>
            <p className={cn('text-sm font-bold', shift.textColor)}>{shift.key}</p>
            <p className="text-xs text-gray-400">{shift.time}</p>
            <p className={cn('text-xl font-black mt-1', shift.textColor)}>{shiftCounts[shift.key]}<span className="text-xs font-normal text-gray-400">/{MAX_PER_TYPE}</span></p>
          </div>
        ))}
      </div>

      {/* Day cards */}
      <div className="space-y-3">
        {DAYS.map((day, dayIndex) => {
          const date = addDays(monday, dayIndex)
          const dateStr = format(date, 'yyyy-MM-dd')
          const isWeekend = WEEKEND_DAYS.includes(dayIndex)
          const isSunday = dayIndex === 6
          const selected = selections[dayIndex]
          const selectedShift = SHIFTS.find(s => s.key === selected)
          const isScheduled = schedules.some((s: any) =>
            s.slot_date === dateStr &&
            (s.supervisor_id === profile.id || s.bar_staff_id === profile.id ||
             s.floor_staff1_id === profile.id || s.floor_staff2_id === profile.id) &&
            s.status === 'approved'
          )

          return (
            <div key={day} className={cn('bg-white rounded-3xl border shadow-sm',
              isWeekend ? 'border-orange-200' : 'border-black/[0.06]'>
              {/* Day header */}
              <div className={cn('px-5 py-3 flex items-center justify-between',
                isWeekend ? 'bg-orange-50' : 'bg-[#F7F0E8]'
              )}>
                <div className="flex items-center gap-2">
                  <p style={{color:'#F7F0E8',fontSize:'14px',fontWeight:700}}>{FULL_DAYS[dayIndex]}</p>
                  <p style={{color:'rgba(247,240,232,0.45)',fontSize:'11px'}}>{format(date, 'MMM d')}</p>
                  {isWeekend && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-200 text-orange-700 font-semibold">Mandatory</span>}
                  {isSunday && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 font-semibold">Free pick</span>}
                </div>
                {isScheduled && <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF6357] text-white font-semibold">Scheduled</span>}
                {selected && <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold', selectedShift?.bg, selectedShift?.textColor)}>{selectedShift?.time}</span>}
              </div>

              {/* Shift buttons */}
              <div className="p-4 grid grid-cols-3 gap-3">
                {SHIFTS.map(shift => {
                  const isSelected = selected === shift.key
                  const isDisabled = !isSunday && !isSelected && shiftCounts[shift.key] >= MAX_PER_TYPE
                  return (
                    <button key={shift.key}
                      onClick={() => !isDisabled && selectShift(dayIndex, shift.key)}
                      disabled={isDisabled}
                      className={cn(
                        'rounded-2xl border-2 p-3 text-center transition-all duration-150 relative',
                        isSelected
                          ? cn(shift.color, 'border-transparent text-white shadow-md scale-[1.02]')
                          : isDisabled
                          ? 'bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed'
                          : cn('bg-white', shift.border, 'hover:' + shift.bg, 'cursor-pointer')
                      )}>
                      <p className="text-base">{shift.icon}</p>
                      <p className={cn('text-xs font-bold mt-0.5', isSelected ? 'text-white' : shift.textColor)}>{shift.key}</p>
                      <p className={cn('text-xs mt-0.5', isSelected ? 'text-white/80' : 'text-gray-400')}>{shift.time}</p>
                      {isSelected && <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white/30 flex items-center justify-center"><Check size={10} className="text-white"/></div>}
                      {isDisabled && <p className="text-xs text-gray-400 mt-0.5">Full</p>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Submit */}
      <div style={{backgroundColor:'#242424',borderRadius:'16px',border:'1px solid rgba(255,255,255,0.08)',padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px'}}>
        <div>
          <p style={{color:'#F7F0E8',fontSize:'14px',fontWeight:700}}>{totalShifts} shifts selected</p>
          <p style={{color:'rgba(247,240,232,0.45)',fontSize:'12px',marginTop:'2px'}}>AM: {shiftCounts.AM}/2 · MID: {shiftCounts.MID}/2 · PM: {shiftCounts.PM}/2</p>
          {savedMsg && <p style={{color:'#22c55e',fontSize:'12px',fontWeight:600,marginTop:'4px'}}>{savedMsg}</p>}
        </div>
        {submitted ? (
          <span className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-green-100 text-green-700 text-sm font-bold">
            <Check size={16}/> Submitted
          </span>
        ) : (
          <button onClick={submitWeek} disabled={!canSubmit || saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#FF6357] text-white text-sm font-bold hover:bg-[#e5554a] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
            <Send size={14}/>
            {saving ? 'Submitting...' : 'Submit Availability'}
          </button>
        )}
      </div>
    </div>
  )
}
