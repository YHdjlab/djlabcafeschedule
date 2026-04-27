'use client'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format, addWeeks, subWeeks, addDays } from 'date-fns'

interface ScheduleViewProps {
  schedules: any[]
  profile: any
  isAdmin: boolean
  availability: any[]
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function ScheduleView({ schedules, profile, isAdmin, availability }: ScheduleViewProps) {
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

  const getStaffHours = (staffId: string, dateStr: string) => {
    const hours = availability
      .filter((a: any) => a.staff_id === staffId && a.slot_date === dateStr)
      .map((a: any) => { const m = a.slot_key.match(/_h(\d+)$/); return m ? parseInt(m[1]) : -1 })
      .filter((h: number) => h >= 0)
      .sort((a: number, b: number) => a - b)
    if (!hours.length) return null
    return { startH: hours[0], endH: hours[hours.length-1]+1, totalH: hours[hours.length-1]+1-hours[0] }
  }

  const fmtH = (t: string) => {
    if (!t) return ''
    const h = parseInt(t.split(':')[0])
    if (h === 0) return '12am'
    if (h < 12) return h + 'am'
    if (h === 12) return '12pm'
    return (h - 12) + 'pm'
  }

  const timeToH = (t: string) => {
    if (!t) return 24
    const h = parseInt(t.split(':')[0])
    if (h === 0) return 24
    return h
  }

  const getStaff = (slot: any) => [
    slot.supervisor && { ...slot.supervisor, role: 'Supervisor', isMe: slot.supervisor_id === profile.id, color: '#3B82F6' },
    slot.bar_staff && { ...slot.bar_staff, role: 'Bar', isMe: slot.bar_staff_id === profile.id, color: '#A855F7' },
    slot.floor_staff1 && { ...slot.floor_staff1, role: 'Floor', isMe: slot.floor_staff1_id === profile.id, color: '#22C55E' },
    slot.floor_staff2 && { ...slot.floor_staff2, role: 'Floor', isMe: slot.floor_staff2_id === profile.id, color: '#22C55E' },
  ].filter(Boolean)

  const isMyShift = (slot: any) =>
    slot.supervisor_id === profile.id || slot.bar_staff_id === profile.id ||
    slot.floor_staff1_id === profile.id || slot.floor_staff2_id === profile.id

  const weekSlots = useMemo(() =>
    schedules.filter(s => weekDates.some(d => d.dateStr === s.slot_date) && s.status === 'approved'),
    [schedules, weekDates]
  )

  return (
    <div className="space-y-4">
      {/* Week navigator */}
      <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm p-4 flex items-center justify-between">
        <button onClick={() => setCurrentWeek(w => subWeeks(w, 1))}
          className="w-10 h-10 rounded-2xl bg-[#F7F0E8] hover:bg-black/10 flex items-center justify-center transition-colors">
          <ChevronLeft size={18}/>
        </button>
        <div className="text-center">
          <p className="font-bold text-[#323232]">{format(currentWeek, 'MMM d')} — {format(addDays(currentWeek, 6), 'MMM d, yyyy')}</p>
          <p className="text-xs text-gray-400 mt-0.5">{weekSlots.length} shifts this week</p>
        </div>
        <button onClick={() => setCurrentWeek(w => addWeeks(w, 1))}
          className="w-10 h-10 rounded-2xl bg-[#F7F0E8] hover:bg-black/10 flex items-center justify-center transition-colors">
          <ChevronRight size={18}/>
        </button>
      </div>

      {/* Days */}
      <div className="space-y-5">
        {weekDates.map(({ date, dateStr, dayName }) => {
          const daySlots = weekSlots.filter(s => s.slot_date === dateStr)
          const slot = daySlots[0]
          const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')
          const isWeekend = dayName === 'Saturday' || dayName === 'Sunday'
          const hasMyShift = daySlots.some(isMyShift)
          const staff = slot ? getStaff(slot) : []
          const startH = slot ? timeToH(slot.start_time) : 8
          const endH = slot ? timeToH(slot.end_time) : 24

          return (
            <div key={dateStr} className="bg-white rounded-3xl overflow-hidden shadow-sm"
              style={{outline: isToday ? '2px solid #FF6357' : '1px solid rgba(0,0,0,0.06)'}}>

              {/* Day header */}
              <div className="px-8 py-5 flex items-center justify-between"
                style={{backgroundColor: isToday ? '#FF6357' : '#323232'}}>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-black text-white text-2xl">{dayName}</p>
                    <p className="text-xs text-white/50">{format(date, 'MMMM d, yyyy')}</p>
                  </div>
                  {isWeekend && <span className="text-xs px-2.5 py-1 rounded-full font-semibold text-white" style={{backgroundColor: 'rgba(255,255,255,0.15)'}}>Full Rush</span>}
                  {hasMyShift && <span className="text-xs px-2.5 py-1 rounded-full font-bold text-white" style={{backgroundColor: '#FF6357', outline: isToday ? '1px solid rgba(255,255,255,0.4)' : 'none'}}>Your shift</span>}
                </div>
                <div className="text-right">
                  {slot ? (
                    <>
                      <p className="text-xl font-black text-white">{fmtH(slot.start_time)} - {fmtH(slot.end_time)}</p>
                      <p className="text-xs text-white/50">{staff.length} staff assigned</p>
                    </>
                  ) : (
                    <p className="text-sm text-white/30">No schedule</p>
                  )}
                </div>
              </div>

              {slot ? (
                <>
                  {/* Rush band */}
                  <div className="px-8 py-3 bg-white border-b border-black/5 flex items-center gap-4">
                    <div className="flex-1 h-2 rounded-full bg-gray-100 relative overflow-hidden">
                      <div className="absolute h-full bg-blue-200 rounded-full" style={{left: '0%', width: ((15-8)/16*100)+'%'}}/>
                      <div className="absolute h-full bg-orange-300 rounded-full" style={{left: ((15-8)/16*100)+'%', width: ((21-15)/16*100)+'%'}}/>
                      <div className="absolute h-full bg-blue-200 rounded-full" style={{left: ((21-8)/16*100)+'%', width: ((24-21)/16*100)+'%'}}/>
                    </div>
                    <div className="flex gap-3 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-200 inline-block"/>Off-rush</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-300 inline-block"/>Rush 3pm-9pm</span>
                    </div>
                  </div>

                  {/* Staff rows */}
                  <div className="px-6 py-4 space-y-3">
                    {staff.map((s: any, i: number) => {
                      const sh = getStaffHours(s.id, dateStr)
                      const sStart = sh ? sh.startH : startH
                      const sEnd = sh ? sh.endH : endH
                      const sTotalH = sh ? sh.totalH : (endH - startH)
                      return (
                      <div key={i} className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
                        style={{
                          backgroundColor: s.isMe ? 'rgba(255,99,87,0.06)' : `${s.color}10`,
                          border: `1px solid ${s.isMe ? 'rgba(255,99,87,0.2)' : s.color + '20'}`,
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
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{color: s.isMe ? '#FF6357' : s.color, backgroundColor: s.isMe ? 'rgba(255,99,87,0.1)' : `${s.color}15`}}>{s.role}</span>
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
                    })}
                  </div>
                </>
              ) : (
                <div className="px-6 py-10 text-center">
                  <Calendar size={28} className="text-gray-200 mx-auto mb-3"/>
                  <p className="text-sm text-gray-400 font-medium">No shifts scheduled</p>
                  <p className="text-xs text-gray-300 mt-1">Check back after the schedule is published</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
