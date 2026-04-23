'use client'
import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatTime } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns'

interface ScheduleViewProps {
  schedules: any[]
  profile: any
  isAdmin: boolean
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SLOT_COLORS = {
  'rush': 'bg-red-50 border-red-200',
  'off-rush': 'bg-blue-50 border-blue-200',
}
const STATUS_COLORS: Record<string, string> = {
  approved: 'green',
  pending_approval: 'yellow',
  draft: 'default',
  rejected: 'red',
}

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

  const weekDates = useMemo(() => {
    return Array.from({length: 7}, (_, i) => {
      const d = addDays(currentWeek, i)
      return { date: d, dateStr: format(d, 'yyyy-MM-dd'), dayName: DAYS[i] }
    })
  }, [currentWeek])

  const weekSchedules = useMemo(() => {
    const dateStrs = weekDates.map(d => d.dateStr)
    return schedules.filter(s => dateStrs.includes(s.slot_date))
  }, [schedules, weekDates])

  const getStaffForSlot = (slot: any) => {
    const staff = []
    if (slot.supervisor) staff.push({ ...slot.supervisor, assignedRole: 'Supervisor' })
    if (slot.bar_staff) staff.push({ ...slot.bar_staff, assignedRole: 'Bar' })
    if (slot.floor_staff1) staff.push({ ...slot.floor_staff1, assignedRole: 'Floor' })
    if (slot.floor_staff2) staff.push({ ...slot.floor_staff2, assignedRole: 'Floor' })
    return staff
  }

  const isMyShift = (slot: any) => {
    return slot.supervisor_id === profile.id ||
      slot.bar_staff_id === profile.id ||
      slot.floor_staff1_id === profile.id ||
      slot.floor_staff2_id === profile.id
  }

  return (
    <div className="space-y-4">
      <Card padding="sm">
        <div className="flex items-center justify-between p-2">
          <Button variant="ghost" size="sm" onClick={() => setCurrentWeek(w => subWeeks(w, 1))}>
            <ChevronLeft size={16}/>
          </Button>
          <div className="text-center">
            <p className="font-semibold text-[#323232]">
              Week of {format(currentWeek, 'MMM d')} – {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{weekSchedules.length} shifts scheduled</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setCurrentWeek(w => addWeeks(w, 1))}>
            <ChevronRight size={16}/>
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {weekDates.map(({ date, dateStr, dayName }) => {
          const daySlots = weekSchedules.filter(s => s.slot_date === dateStr)
          const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')
          const isWeekend = dayName === 'Saturday' || dayName === 'Sunday'

          return (
            <Card key={dateStr} padding="none" className={cn(isToday && 'ring-2 ring-[#FF6357]')}>
              <div className={cn(
                'px-4 py-3 flex items-center justify-between border-b border-black/5',
                isWeekend ? 'bg-orange-50' : 'bg-[#F7F0E8]'
              )}>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className={isToday ? 'text-[#FF6357]' : 'text-gray-400'}/>
                  <span className={cn('font-semibold text-sm', isToday ? 'text-[#FF6357]' : 'text-[#323232]')}>
                    {dayName}
                  </span>
                  <span className="text-xs text-gray-400">{format(date, 'MMM d')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isWeekend && <Badge variant="coral">Full Rush</Badge>}
                  {daySlots.length === 0 && <span className="text-xs text-gray-400">No shifts</span>}
                </div>
              </div>

              {daySlots.length > 0 ? (
                <div className="divide-y divide-black/5">
                  {daySlots.map(slot => {
                    const staff = getStaffForSlot(slot)
                    const myShift = isMyShift(slot)
                    return (
                      <div key={slot.id} className={cn('px-4 py-3', myShift && 'bg-orange-50/50')}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-[#323232]">{slot.slot_label}</span>
                              <Badge variant={slot.slot_type === 'rush' ? 'coral' : 'blue'}>
                                {slot.slot_type}
                              </Badge>
                              {isAdmin && (
                                <Badge variant={STATUS_COLORS[slot.status] as any}>
                                  {slot.status.replace('_', ' ')}
                                </Badge>
                              )}
                              {myShift && <Badge variant="green">Your shift</Badge>}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {staff.map((s, i) => (
                                <div key={i} className={cn(
                                  'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs',
                                  s.id === profile.id ? 'bg-[#FF6357] text-white' : 'bg-[#F7F0E8] text-[#323232]'
                                )}>
                                  <div className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center">
                                    <span className="text-[9px] font-bold">{s.full_name?.charAt(0)}</span>
                                  </div>
                                  <span>{s.full_name?.split(' ')[0]}</span>
                                  <span className="opacity-60">· {s.assignedRole}</span>
                                </div>
                              ))}
                              {staff.length === 0 && (
                                <span className="text-xs text-gray-400 italic">No staff assigned yet</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-gray-400">No shifts scheduled for this day</p>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
