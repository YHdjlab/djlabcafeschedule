'use client'
import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  profile: any
  availability: any[]
  nextMonday: string
  currentMonday: string
  rushConfig: any[]
}

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

function generateSlots(weekStart: string, rushConfig: any[]) {
  const weekday = rushConfig.find((r: any) => r.day_type === 'weekday')
  const weekend = rushConfig.find((r: any) => r.day_type === 'weekend')
  const slots: any[] = []
  const monday = new Date(weekStart + 'T00:00:00')

  DAYS.forEach((day, i) => {
    const date = addDays(monday, i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const isWeekend = i >= 5

    if (isWeekend) {
      slots.push({
        key: day + "_full",
        label: day + " Full Day",
        date: dateStr,
        day,
        start: '08:00',
        end: '00:00',
        type: 'rush' as const,
      })
    } else {
      slots.push(
        { key: day + "_morning", label: day + " Morning", date: dateStr, day, start: '08:00', end: weekday?.rush_start || '15:00', type: 'off-rush' as const },
        { key: day + "_rush", label: day + " Rush", date: dateStr, day, start: weekday?.rush_start || '15:00', end: weekday?.rush_end || '21:00', type: 'rush' as const },
        { key: day + "_evening", label: day + " Evening", date: dateStr, day, start: weekday?.rush_end || '21:00', end: '00:00', type: 'off-rush' as const },
      )
    }
  })
  return slots
}

export function AvailabilityGrid({ profile, availability, nextMonday, currentMonday, rushConfig }: Props) {
  const [weekStart, setWeekStart] = useState(nextMonday)
  const [saving, setSaving] = useState<string | null>(null)
  const [localAvail, setLocalAvail] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    availability.forEach(a => {
      map[a.week_starting + "_" + a.slot_key] = a.available
    })
    return map
  })

  const supabase = createClient()
  const slots = useMemo(() => generateSlots(weekStart, rushConfig), [weekStart, rushConfig])
  const monday = new Date(weekStart + 'T00:00:00')

  const toggleSlot = async (slot: typeof slots[0]) => {
    const key = weekStart + "_" + slot.key
    const current = localAvail[key] ?? false
    const newVal = !current
    setSaving(key)
    setLocalAvail(prev => ({ ...prev, [key]: newVal }))

    await supabase.from('availability').upsert({
      week_starting: weekStart,
      staff_id: profile.id,
      slot_key: slot.key,
      slot_label: slot.label,
      slot_date: slot.date,
      available: newVal,
    }, { onConflict: 'week_starting,staff_id,slot_key' })

    setSaving(null)
  }

  const setAllDay = async (day: string, value: boolean) => {
    const daySlots = slots.filter(s => s.day === day)
    const updates: Record<string, boolean> = {}
    daySlots.forEach(s => { updates[weekStart + "_" + s.key] = value })
    setLocalAvail(prev => ({ ...prev, ...updates }))

    await Promise.all(daySlots.map(slot =>
      supabase.from('availability').upsert({
        week_starting: weekStart,
        staff_id: profile.id,
        slot_key: slot.key,
        slot_label: slot.label,
        slot_date: slot.date,
        available: value,
      }, { onConflict: 'week_starting,staff_id,slot_key' })
    ))
  }

  const availableCount = slots.filter(s => localAvail[weekStart + "_" + s.key]).length

  return (
    <div className="space-y-4">
      <Card padding="sm">
        <div className="flex items-center justify-between p-2">
          <Button variant="ghost" size="sm" onClick={() => {
            const d = new Date(weekStart + 'T00:00:00')
            d.setDate(d.getDate() - 7)
            setWeekStart(format(d, 'yyyy-MM-dd'))
          }}>
            <ChevronLeft size={16}/>
          </Button>
          <div className="text-center">
            <p className="font-semibold text-[#323232]">
              {format(monday, 'MMM d')} - {format(addDays(monday, 6), 'MMM d, yyyy')}
            </p>
            <p className="text-xs text-[#FF6357] mt-0.5">{availableCount} slots marked available</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => {
            const d = new Date(weekStart + 'T00:00:00')
            d.setDate(d.getDate() + 7)
            setWeekStart(format(d, 'yyyy-MM-dd'))
          }}>
            <ChevronRight size={16}/>
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3">
        {DAYS.map(day => {
          const daySlots = slots.filter(s => s.day === day)
          const allAvailable = daySlots.every(s => localAvail[weekStart + "_" + s.key])
          const someAvailable = daySlots.some(s => localAvail[weekStart + "_" + s.key])
          const isWeekend = day === 'Saturday' || day === 'Sunday'
          const dayDate = daySlots[0]?.date

          return (
            <Card key={day} padding="none">
              <div className={cn(
                'px-4 py-3 flex items-center justify-between border-b border-black/5',
                isWeekend ? 'bg-orange-50' : 'bg-[#F7F0E8]'
              )}>
                <div>
                  <span className="font-semibold text-sm text-[#323232]">{day}</span>
                  {dayDate && <span className="text-xs text-gray-400 ml-2">{format(new Date(dayDate + 'T00:00:00'), 'MMM d')}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAllDay(day, true)}
                    className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  >
                    All
                  </button>
                  <button
                    onClick={() => setAllDay(day, false)}
                    className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    None
                  </button>
                </div>
              </div>
              <div className="p-3 grid grid-cols-1 gap-2">
                {daySlots.map(slot => {
                  const key = weekStart + "_" + slot.key
                  const isAvailable = localAvail[key] ?? false
                  const isSaving = saving === key

                  return (
                    <button
                      key={slot.key}
                      onClick={() => toggleSlot(slot)}
                      disabled={isSaving}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left',
                        isAvailable
                          ? 'border-green-400 bg-green-50'
                          : 'border-black/10 bg-white hover:border-black/20',
                        isSaving && 'opacity-50'
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#323232]">
                            {slot.start} - {slot.end === '00:00' ? 'Midnight' : slot.end}
                          </span>
                          <Badge variant={slot.type === 'rush' ? 'coral' : 'blue'}>
                            {slot.type}
                          </Badge>
                        </div>
                      </div>
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center transition-all',
                        isAvailable ? 'bg-green-500' : 'bg-gray-200'
                      )}>
                        {isAvailable
                          ? <Check size={14} className="text-white"/>
                          : <X size={14} className="text-gray-400"/>
                        }
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
