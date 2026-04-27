'use client'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format, addWeeks, subWeeks, addDays } from 'date-fns'

interface ScheduleViewProps {
  schedules: any[]
  profile: any
  isAdmin: boolean
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function ScheduleView({ schedules, profile, isAdmin }: ScheduleViewProps) {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)
    monday.setHours(0,0,0,0)
    return monday
  })

  const weekDates = useMemo(() => Array.from({length: 7}, (_, i) => {
    const d = addDays(currentWeek, i)
    return { date: d, dateStr: format(d, 'yyyy-MM-dd'), dayName: DAYS[i] }
  }), [currentWeek])

  const fmtH = (t: string) => {
    if (!t) return ''
    if (t === '00:00') return '12am'
    const h = parseInt(t.split(':')[0])
    if (h === 0) return '12am'
    if (h < 12) return h + 'am'
    if (h === 12) return '12pm'
    return (h - 12) + 'pm'
  }

  const getStaff = (slot: any) => [
    slot.supervisor && { ...slot.supervisor, role: 'Supervisor', isMe: slot.supervisor_id === profile.id },
    slot.bar_staff && { ...slot.bar_staff, role: 'Bar', isMe: slot.bar_staff_id === profile.id },
    slot.floor_staff1 && { ...slot.floor_staff1, role: 'Floor', isMe: slot.floor_staff1_id === profile.id },
    slot.floor_staff2 && { ...slot.floor_staff2, role: 'Floor', isMe: slot.floor_staff2_id === profile.id },
  ].filter(Boolean)

  const isMyShift = (slot: any) =>
    slot.supervisor_id === profile.id || slot.bar_staff_id === profile.id ||
    slot.floor_staff1_id === profile.id || slot.floor_staff2_id === profile.id

  return (
    <div className="space-y-4">
      {/* Week navigator */}
      <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm p-4 flex items-center justify-between">
        <button onClick={() => setCurrentWeek(w => subWeeks(w, 1))}
          className="w-10 h-10 rounded-2xl bg-[#F7F0E8] hover:bg-black/10 flex items-center justify-center transition-colors">
          <ChevronLeft size={18}/>
        </button>
        <div className="text-center">
          <p className="font-bold text-[#323232]">
            {format(currentWeek, 'MMM d')} — {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {schedules.filter(s => weekDates.some(d => d.dateStr === s.slot_date)).length} shifts this week
          </p>
        </div>
        <button onClick={() => setCurrentWeek(w => addWeeks(w, 1))}
          className="w-10 h-10 rounded-2xl bg-[#F7F0E8] hover:bg-black/10 flex items-center justify-center transition-colors">
          <ChevronRight size={18}/>
        </button>
      </div>

      {/* Days */}
      <div className="space-y-4">
        {weekDates.map(({ date, dateStr, dayName }) => {
          const daySlots = schedules.filter(s => s.slot_date === dateStr && s.status === 'approved')
          const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')
          const isWeekend = dayName === 'Saturday' || dayName === 'Sunday'
          const hasMyShift = daySlots.some(isMyShift)

          return (
            <div key={dateStr} className={cn(
              'bg-white rounded-3xl overflow-hidden',
              isToday ? 'ring-2 ring-[#FF6357]' : 'ring-1 ring-black/[0.06]',
              'shadow-sm'
            )}>
              {/* Day header */}
              <div className={cn(
                'px-6 py-4 flex items-center justify-between',
                isToday ? 'bg-[#FF6357]' : 'bg-[#323232]'
              )}>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-black text-white text-xl">{dayName}</p>
                    <p className="text-xs text-white/50">{format(date, 'MMMM d, yyyy')}</p>
                  </div>
                  {isWeekend && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/15 text-white font-semibold">Full Rush</span>
                  )}
                  {hasMyShift && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#FF6357] text-white font-semibold" style={{backgroundColor: isToday ? 'rgba(255,255,255,0.2)' : '#FF6357'}}>Your shift</span>
                  )}
                </div>
                <div className="text-right">
                  {daySlots.length > 0 ? (
                    <>
                      <p className="text-sm font-bold text-white">
                        {fmtH(daySlots[0]?.start_time)} - {fmtH(daySlots[0]?.end_time)}
                      </p>
                      <p className="text-xs text-white/50">{getStaff(daySlots[0]).length} staff</p>
                    </>
                  ) : (
                    <p className="text-xs text-white/40">No schedule</p>
                  )}
                </div>
              </div>

              {/* Staff list */}
              {daySlots.length > 0 ? (
                <div className="px-6 py-4 space-y-3">
                  {getStaff(daySlots[0]).map((s: any, i: number) => {
                    const roleColor = s.role === 'Supervisor' ? '#3B82F6' : s.role === 'Bar' ? '#A855F7' : '#22C55E'
                    const roleBg = s.role === 'Supervisor' ? 'rgba(59,130,246,0.08)' : s.role === 'Bar' ? 'rgba(168,85,247,0.08)' : 'rgba(34,197,94,0.08)'
                    return (
                      <div key={i} className={cn('rounded-2xl px-4 py-3 flex items-center justify-between gap-4', s.isMe && 'ring-2 ring-[#FF6357]')}
                        style={{backgroundColor: s.isMe ? 'rgba(255,99,87,0.06)' : roleBg, border: `1px solid ${roleColor}20`}}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{backgroundColor: s.isMe ? '#FF6357' : roleColor}}>
                            {s.full_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{color: roleColor, backgroundColor: `${roleColor}15`}}>{s.role}</span>
                              {s.isMe && <span className="text-xs font-bold text-[#FF6357]">You</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#323232]">
                            {fmtH(daySlots[0]?.start_time)} - {fmtH(daySlots[0]?.end_time)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <Calendar size={24} className="text-gray-200 mx-auto mb-2"/>
                  <p className="text-sm text-gray-400">No shifts scheduled</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
