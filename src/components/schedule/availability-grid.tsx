'use client'
import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase-client'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

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
const HOURS = Array.from({length: 16}, (_, i) => i + 8) // 8 to 23

function formatHour(h: number) {
  if (h === 0 || h === 24) return '12 AM'
  if (h < 12) return h + ' AM'
  if (h === 12) return '12 PM'
  return (h - 12) + ' PM'
}

export function AvailabilityGrid({ profile, availability, nextMonday, currentMonday, rushConfig }: Props) {
  const [weekStart, setWeekStart] = useState(nextMonday)
  const [localAvail, setLocalAvail] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    availability.forEach(a => { map[a.slot_key] = a.available })
    return map
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const monday = new Date(weekStart + 'T00:00:00')
  const weekdays = Array.from({length: 7}, (_, i) => addDays(monday, i))

  const weekdayConfig = rushConfig.find(r => r.day_type === 'weekday')
  const rushStart = parseInt((weekdayConfig?.rush_start || '15:00').split(':')[0])
  const rushEnd = parseInt((weekdayConfig?.rush_end || '21:00').split(':')[0])

  const isRushHour = (dayIndex: number, hour: number) => {
    if (dayIndex >= 5) return true // weekend = all rush
    return hour >= rushStart && hour < rushEnd
  }

  const slotKey = (dayIndex: number, hour: number) => {
    const dateStr = format(weekdays[dayIndex], 'yyyy-MM-dd')
    return dateStr + '_h' + hour
  }

  const toggleHour = async (dayIndex: number, hour: number) => {
    const key = slotKey(dayIndex, hour)
    const newVal = !(localAvail[key] ?? false)
    setLocalAvail(prev => ({ ...prev, [key]: newVal }))
    const dateStr = format(weekdays[dayIndex], 'yyyy-MM-dd')
    await supabase.from('availability').upsert({
      week_starting: weekStart,
      staff_id: profile.id,
      slot_key: key,
      slot_label: FULL_DAYS[dayIndex] + ' ' + formatHour(hour),
      slot_date: dateStr,
      available: newVal,
    }, { onConflict: 'week_starting,staff_id,slot_key' })
  }

  const toggleDay = async (dayIndex: number, value: boolean) => {
    const updates: Record<string, boolean> = {}
    HOURS.forEach(h => { updates[slotKey(dayIndex, h)] = value })
    setLocalAvail(prev => ({ ...prev, ...updates }))
    const dateStr = format(weekdays[dayIndex], 'yyyy-MM-dd')
    await Promise.all(HOURS.map(hour =>
      supabase.from('availability').upsert({
        week_starting: weekStart,
        staff_id: profile.id,
        slot_key: slotKey(dayIndex, hour),
        slot_label: FULL_DAYS[dayIndex] + ' ' + formatHour(hour),
        slot_date: dateStr,
        available: value,
      }, { onConflict: 'week_starting,staff_id,slot_key' })
    ))
  }

  const toggleHourAllDays = async (hour: number, value: boolean) => {
    const updates: Record<string, boolean> = {}
    Array.from({length: 7}, (_, i) => i).forEach(di => { updates[slotKey(di, hour)] = value })
    setLocalAvail(prev => ({ ...prev, ...updates }))
    await Promise.all(Array.from({length: 7}, (_, i) => i).map(dayIndex => {
      const dateStr = format(weekdays[dayIndex], 'yyyy-MM-dd')
      return supabase.from('availability').upsert({
        week_starting: weekStart,
        staff_id: profile.id,
        slot_key: slotKey(dayIndex, hour),
        slot_label: FULL_DAYS[dayIndex] + ' ' + formatHour(hour),
        slot_date: dateStr,
        available: value,
      }, { onConflict: 'week_starting,staff_id,slot_key' })
    }))
  }

  const totalAvailable = Object.values(localAvail).filter(Boolean).length

  const prevWeek = () => {
    const d = new Date(weekStart + 'T00:00:00')
    d.setDate(d.getDate() - 7)
    setWeekStart(format(d, 'yyyy-MM-dd'))
  }
  const nextWeek = () => {
    const d = new Date(weekStart + 'T00:00:00')
    d.setDate(d.getDate() + 7)
    setWeekStart(format(d, 'yyyy-MM-dd'))
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between">
        <button onClick={prevWeek} className="w-9 h-9 rounded-xl bg-[#F7F0E8] flex items-center justify-center hover:bg-black/10 transition-colors">
          <ChevronLeft size={16}/>
        </button>
        <div className="text-center">
          <p className="font-semibold text-[#323232]">{format(monday, 'MMM d')} - {format(addDays(monday, 6), 'MMM d, yyyy')}</p>
          <p className="text-xs text-[#FF6357] mt-0.5">{totalAvailable} hours marked available</p>
        </div>
        <button onClick={nextWeek} className="w-9 h-9 rounded-xl bg-[#F7F0E8] flex items-center justify-center hover:bg-black/10 transition-colors">
          <ChevronRight size={16}/>
        </button>
      </div>

      <div className="flex gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-100 border border-orange-200"/><span className="text-gray-500">Rush hour</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-50 border border-blue-100"/><span className="text-gray-500">Off-rush</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-400"/><span className="text-gray-500">Available</span></div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{minWidth: '600px'}}>
            <thead>
              <tr>
                <th className="w-16 p-2 border-b border-r border-black/5 bg-[#F7F0E8]"></th>
                {DAYS.map((day, i) => {
                  const date = weekdays[i]
                  const isWeekend = i >= 5
                  const dayAvail = HOURS.filter(h => localAvail[slotKey(i, h)]).length
                  return (
                    <th key={day} className={cn('p-2 border-b border-r border-black/5 text-center', isWeekend ? 'bg-orange-50' : 'bg-[#F7F0E8]')}>
                      <p className="text-xs font-bold text-[#323232]">{day}</p>
                      <p className="text-xs text-gray-400">{format(date, 'MMM d')}</p>
                      <div className="flex gap-1 justify-center mt-1">
                        <button onClick={() => toggleDay(i, true)} className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 hover:bg-green-200">All</button>
                        <button onClick={() => toggleDay(i, false)} className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600 hover:bg-red-200">None</button>
                      </div>
                      {dayAvail > 0 && <p className="text-xs text-[#FF6357] mt-0.5">{dayAvail}h</p>}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {HOURS.map(hour => (
                <tr key={hour}>
                  <td className="p-2 border-b border-r border-black/5 bg-[#F7F0E8] text-right">
                    <div className="flex items-center justify-between px-1 gap-1">
                      <button
                        onClick={() => toggleHourAllDays(hour, !DAYS.some((_, i) => localAvail[slotKey(i, hour)]))}
                        className="text-xs text-gray-400 hover:text-[#FF6357] transition-colors"
                        title="Toggle all days"
                      >
                        all
                      </button>
                      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{formatHour(hour)}</span>
                    </div>
                  </td>
                  {DAYS.map((_, dayIndex) => {
                    const key = slotKey(dayIndex, hour)
                    const isAvail = localAvail[key] ?? false
                    const isRush = isRushHour(dayIndex, hour)
                    return (
                      <td key={dayIndex} className={cn('border-b border-r border-black/5 p-1', isRush ? 'bg-orange-50/40' : 'bg-blue-50/20')}>
                        <button
                          onClick={() => toggleHour(dayIndex, hour)}
                          className={cn(
                            'w-full h-8 rounded-lg transition-all duration-150 flex items-center justify-center',
                            isAvail
                              ? 'bg-green-400 hover:bg-green-500 shadow-sm'
                              : isRush
                              ? 'bg-orange-100/60 hover:bg-orange-200/80'
                              : 'bg-white/60 hover:bg-gray-100'
                          )}
                        >
                          {isAvail && <Check size={12} className="text-white"/>}
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
}