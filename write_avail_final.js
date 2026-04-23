const fs = require("fs");

const grid = `'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Check, Send, Clock, Calendar } from 'lucide-react'

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
const HOURS = Array.from({length: 16}, (_, i) => i + 8)

function formatHour(h: number) {
  if (h < 12) return h + ' AM'
  if (h === 12) return '12 PM'
  return (h - 12) + ' PM'
}

export function AvailabilityGrid({ profile, availability, schedules, nextMonday, currentMonday, rushConfig }: Props) {
  const [weekStart, setWeekStart] = useState(nextMonday)
  const [localAvail, setLocalAvail] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    availability.forEach(a => { map[a.week_starting + '|' + a.slot_key] = a.available })
    return map
  })
  const [submitted, setSubmitted] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    availability.forEach(a => { if (a.submitted) map[a.week_starting] = true })
    return map
  })
  const [submitting, setSubmitting] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const supabase = createClient()

  const monday = new Date(weekStart + 'T00:00:00')
  const weekdays = Array.from({length: 7}, (_, i) => addDays(monday, i))
  const weekdayConfig = rushConfig.find((r: any) => r.day_type === 'weekday')
  const rushStart = parseInt((weekdayConfig?.rush_start || '15:00').split(':')[0])
  const rushEnd = parseInt((weekdayConfig?.rush_end || '21:00').split(':')[0])

  const isRushHour = (dayIndex: number, hour: number) => {
    if (dayIndex >= 5) return true
    return hour >= rushStart && hour < rushEnd
  }

  const slotKey = (dayIndex: number, hour: number) => format(weekdays[dayIndex], 'yyyy-MM-dd') + '_h' + hour
  const mapKey = (dayIndex: number, hour: number) => weekStart + '|' + slotKey(dayIndex, hour)

  const getScheduledShift = (dayIndex: number, hour: number) => {
    const dateStr = format(weekdays[dayIndex], 'yyyy-MM-dd')
    return schedules.find(s => {
      if (s.slot_date !== dateStr) return false
      const slotStartH = parseInt((s.start_time || '08:00').split(':')[0])
      const slotEndH = parseInt((s.end_time || '00:00').split(':')[0]) || 24
      return hour >= slotStartH && hour < slotEndH &&
        (s.supervisor_id === profile.id || s.bar_staff_id === profile.id ||
         s.floor_staff1_id === profile.id || s.floor_staff2_id === profile.id)
    })
  }

  const flash = (msg: string) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(''), 2000) }

  const toggleHour = async (dayIndex: number, hour: number) => {
    const key = mapKey(dayIndex, hour)
    const newVal = !(localAvail[key] ?? false)
    setLocalAvail(prev => ({ ...prev, [key]: newVal }))
    const dateStr = format(weekdays[dayIndex], 'yyyy-MM-dd')
    await supabase.from('availability').upsert({
      week_starting: weekStart, staff_id: profile.id,
      slot_key: slotKey(dayIndex, hour),
      slot_label: FULL_DAYS[dayIndex] + ' ' + formatHour(hour),
      slot_date: dateStr, available: newVal, submitted: false,
    }, { onConflict: 'week_starting,staff_id,slot_key' })
    flash('Saved')
  }

  const toggleDay = async (dayIndex: number, value: boolean) => {
    const updates: Record<string, boolean> = {}
    HOURS.forEach(h => { updates[mapKey(dayIndex, h)] = value })
    setLocalAvail(prev => ({ ...prev, ...updates }))
    const dateStr = format(weekdays[dayIndex], 'yyyy-MM-dd')
    await Promise.all(HOURS.map(hour =>
      supabase.from('availability').upsert({
        week_starting: weekStart, staff_id: profile.id,
        slot_key: slotKey(dayIndex, hour),
        slot_label: FULL_DAYS[dayIndex] + ' ' + formatHour(hour),
        slot_date: dateStr, available: value, submitted: false,
      }, { onConflict: 'week_starting,staff_id,slot_key' })
    ))
  }

  const submitWeek = async () => {
    setSubmitting(true)
    await supabase.from('availability')
      .update({ submitted: true })
      .eq('week_starting', weekStart)
      .eq('staff_id', profile.id)
    setSubmitted(prev => ({ ...prev, [weekStart]: true }))
    flash('Availability submitted!')
    setSubmitting(false)
  }

  const totalHours = Object.entries(localAvail).filter(([k, v]) => k.startsWith(weekStart + '|') && v).length
  const isSubmitted = submitted[weekStart] ?? false

  const myScheduledShifts = schedules.filter(s => {
    const d = new Date(s.slot_date + 'T00:00:00')
    const wk = new Date(weekStart + 'T00:00:00')
    const wkEnd = addDays(wk, 7)
    return d >= wk && d < wkEnd &&
      (s.supervisor_id === profile.id || s.bar_staff_id === profile.id ||
       s.floor_staff1_id === profile.id || s.floor_staff2_id === profile.id) &&
      s.status === 'approved'
  })

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between">
        <button onClick={() => { const d = new Date(weekStart + 'T00:00:00'); d.setDate(d.getDate()-7); setWeekStart(format(d,'yyyy-MM-dd')) }}
          className="w-9 h-9 rounded-xl bg-[#F7F0E8] flex items-center justify-center hover:bg-black/10 transition-colors">
          <ChevronLeft size={16}/>
        </button>
        <div className="text-center">
          <p className="font-semibold text-[#323232]">{format(monday,'MMM d')} - {format(addDays(monday,6),'MMM d, yyyy')}</p>
          <div className="flex items-center justify-center gap-3 mt-1">
            <span className="text-xs text-[#FF6357]"><Clock size={10} className="inline mr-1"/>{totalHours}h available</span>
            {myScheduledShifts.length > 0 && <span className="text-xs text-green-600"><Calendar size={10} className="inline mr-1"/>{myScheduledShifts.length} shifts</span>}
          </div>
        </div>
        <button onClick={() => { const d = new Date(weekStart + 'T00:00:00'); d.setDate(d.getDate()+7); setWeekStart(format(d,'yyyy-MM-dd')) }}
          className="w-9 h-9 rounded-xl bg-[#F7F0E8] flex items-center justify-center hover:bg-black/10 transition-colors">
          <ChevronRight size={16}/>
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-100 border border-orange-200"/><span className="text-gray-500">Rush</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-50 border border-blue-100"/><span className="text-gray-500">Off-rush</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-400"/><span className="text-gray-500">Available</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#FF6357]"/><span className="text-gray-500">Scheduled</span></div>
        </div>
        <div className="flex items-center gap-3">
          {savedMsg && <span className="text-xs text-green-600 font-medium">{savedMsg}</span>}
          {isSubmitted ? (
            <span className="text-xs px-3 py-1.5 rounded-xl bg-green-100 text-green-700 font-semibold flex items-center gap-1">
              <Check size={12}/> Submitted
            </span>
          ) : (
            <button onClick={submitWeek} disabled={submitting || totalHours === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6357] text-white text-sm font-semibold hover:bg-[#e5554a] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <Send size={13}/>
              {submitting ? 'Submitting...' : 'Submit Availability'}
            </button>
          )}
        </div>
      </div>

      {myScheduledShifts.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-green-700 mb-2">Your scheduled shifts this week</p>
          <div className="space-y-1">
            {myScheduledShifts.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between text-xs text-green-600">
                <span>{format(new Date(s.slot_date + 'T00:00:00'), 'EEE MMM d')} - {s.slot_label}</span>
                <span className="px-2 py-0.5 rounded-full bg-green-100 font-medium">{s.slot_type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{minWidth: '580px'}}>
            <thead>
              <tr>
                <th className="w-16 p-2 border-b border-r border-black/5 bg-[#F7F0E8]"></th>
                {DAYS.map((day, i) => {
                  const date = weekdays[i]
                  const isWeekend = i >= 5
                  const dayHours = HOURS.filter(h => localAvail[mapKey(i, h)]).length
                  return (
                    <th key={day} className={cn('p-2 border-b border-r border-black/5 text-center', isWeekend ? 'bg-orange-50' : 'bg-[#F7F0E8]')}>
                      <p className="text-xs font-bold text-[#323232]">{day}</p>
                      <p className="text-xs text-gray-400">{format(date, 'MMM d')}</p>
                      <div className="flex gap-1 justify-center mt-1">
                        <button onClick={() => toggleDay(i, true)} className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 hover:bg-green-200">All</button>
                        <button onClick={() => toggleDay(i, false)} className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600 hover:bg-red-200">None</button>
                      </div>
                      {dayHours > 0 && <p className="text-xs text-[#FF6357] mt-0.5">{dayHours}h</p>}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {HOURS.map(hour => (
                <tr key={hour}>
                  <td className="p-1 border-b border-r border-black/5 bg-[#F7F0E8]">
                    <span className="text-xs font-medium text-gray-500 block text-right pr-2">{formatHour(hour)}</span>
                  </td>
                  {DAYS.map((_, dayIndex) => {
                    const key = mapKey(dayIndex, hour)
                    const isAvail = localAvail[key] ?? false
                    const isRush = isRushHour(dayIndex, hour)
                    const isScheduled = !!getScheduledShift(dayIndex, hour)
                    return (
                      <td key={dayIndex} className={cn('border-b border-r border-black/5 p-0.5', isRush ? 'bg-orange-50/40' : 'bg-blue-50/20')}>
                        <button onClick={() => !isScheduled && toggleHour(dayIndex, hour)}
                          disabled={isScheduled}
                          className={cn(
                            'w-full h-7 rounded-md transition-all duration-150 flex items-center justify-center',
                            isScheduled ? 'bg-[#FF6357] cursor-default shadow-sm' :
                            isAvail ? 'bg-green-400 hover:bg-green-500 shadow-sm' :
                            isRush ? 'bg-orange-100/60 hover:bg-orange-200/80' :
                            'bg-white/60 hover:bg-gray-100'
                          )}>
                          {isScheduled ? <span className="text-white text-xs font-bold">S</span> : isAvail && <Check size={11} className="text-white"/>}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}`;

fs.writeFileSync("src/components/schedule/availability-grid.tsx", grid, "utf8");
console.log("Done - " + grid.length + " bytes written");
