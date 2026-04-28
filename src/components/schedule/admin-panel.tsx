'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn, ROLE_LABELS, ROLE_COLORS } from '@/lib/utils'
import { Users, Settings, Calendar, CheckSquare, ArrowLeftRight, CalendarOff, Check, X, Clock, ChevronLeft, ChevronRight, AlertCircle, Eye } from 'lucide-react'
import { format, addDays } from 'date-fns'

const TABS = [
  { id: 'overview', label: 'Overview', icon: <Eye size={15}/> },
  { id: 'staff', label: 'Staff', icon: <Users size={15}/> },
  { id: 'schedule', label: 'Schedule Builder', icon: <Calendar size={15}/> },
  { id: 'approvals', label: 'Approvals', icon: <CheckSquare size={15}/> },
  { id: 'settings', label: 'Settings', icon: <Settings size={15}/> },
]

const ROLE_OPTIONS = [
  { value: 'floor', label: 'Floor Staff' },
  { value: 'bar', label: 'Bar Staff' },
  { value: 'supervisor_floor', label: 'Supervisor (Floor)' },
  { value: 'supervisor_bar', label: 'Supervisor (Bar)' },
  { value: 'gm', label: 'General Manager' },
]

interface Props {
  profile: any
  allStaff: any[]
  rushConfig: any[]
  pendingDaysOff: any[]
  pendingSwaps: any[]
  pendingAttendance: any[]
  schedules: any[]
  availability: any[]
}

export function AdminPanel({ profile, allStaff: initialStaff, rushConfig: initialRush, pendingDaysOff: initialDaysOff, pendingSwaps: initialSwaps, pendingAttendance: initialAttendance, schedules: initialSchedules, availability }: Props) {
  const [tab, setTab] = useState('overview')
  const [staff, setStaff] = useState(initialStaff)
  const [rushConfig, setRushConfig] = useState(initialRush)
  const [pendingDaysOff, setPendingDaysOff] = useState(initialDaysOff)
  const [pendingSwaps, setPendingSwaps] = useState(initialSwaps)
  const [pendingAttendance, setPendingAttendance] = useState(initialAttendance)
  const [schedules, setSchedules] = useState(initialSchedules)
  const supabase = createClient()

  const totalApprovals = pendingDaysOff.length + pendingSwaps.length + pendingAttendance.length
  const activeStaff = staff.filter((s: any) => s.active)

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map((t: any) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              tab === t.id ? 'bg-[#FF6357] text-white shadow-sm' : 'bg-white text-gray-500 hover:bg-black/5'
            )}
          >
            {t.icon}
            {t.label}
            {t.id === 'approvals' && totalApprovals > 0 && (
              <span className="ml-1 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">{totalApprovals}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab staff={staff} pendingDaysOff={pendingDaysOff} pendingSwaps={pendingSwaps} pendingAttendance={pendingAttendance} schedules={schedules} availability={availability}/>}
      {tab === 'staff' && <StaffTab staff={staff} setStaff={setStaff} profile={profile} supabase={supabase}/>}
      {tab === 'schedule' && <ScheduleBuilderTab staff={staff} schedules={schedules} setSchedules={setSchedules} profile={profile} supabase={supabase} availability={availability} rushConfig={rushConfig}/>}
      {tab === 'approvals' && <ApprovalsTab pendingDaysOff={pendingDaysOff} setPendingDaysOff={setPendingDaysOff} pendingSwaps={pendingSwaps} setPendingSwaps={setPendingSwaps} pendingAttendance={pendingAttendance} setPendingAttendance={setPendingAttendance} profile={profile} supabase={supabase}/>}
      {tab === 'settings' && <SettingsTab rushConfig={rushConfig} setRushConfig={setRushConfig} profile={profile} supabase={supabase}/>}
    </div>
  )
}

function OverviewTab({ staff, pendingDaysOff, pendingSwaps, pendingAttendance, schedules, availability }: any) {
  const activeStaff = staff.filter((s: any) => s.active)
  const approvedSchedules = schedules.filter((s: any) => s.status === 'approved')
  const thisWeek = getCurrentWeekMonday()
  const weekAvail = availability.filter((a: any) => a.week_starting === thisWeek && a.available)
  const staffWithAvail = new Set(weekAvail.map((a: any) => a.staff_id)).size

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Staff', value: activeStaff.length, icon: <Users size={18}/>, color: 'bg-blue-50 text-blue-500' },
          { label: 'Approved Shifts', value: approvedSchedules.length, icon: <Calendar size={18}/>, color: 'bg-green-50 text-green-500' },
          { label: 'Pending Approvals', value: pendingDaysOff.length + pendingSwaps.length + pendingAttendance.length, icon: <CheckSquare size={18}/>, color: 'bg-orange-50 text-[#FF6357]' },
          { label: 'Availability Set', value: staffWithAvail + '/' + activeStaff.length, icon: <Clock size={18}/>, color: 'bg-purple-50 text-purple-500' },
        ].map((stat: any) => (
          <Card key={stat.label} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-[#323232] mt-1">{stat.value}</p>
              </div>
              <div className={cn('p-2 rounded-xl', stat.color)}>{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Staff Availability This Week</CardTitle></CardHeader>
        <div className="space-y-2">
          {activeStaff.filter((s: any) => s.role !== 'gm').map((s: any) => {
            const avail = availability.filter((a: any) => a.staff_id === s.id && a.week_starting === thisWeek && a.available)
            return (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F7F0E8]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#323232] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{s.full_name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#323232]">{s.full_name}</p>
                    <p className="text-xs text-gray-400">{ROLE_LABELS[s.role]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#323232]">{avail.length}</span>
                  <span className="text-xs text-gray-400">slots</span>
                  {avail.length === 0 && <Badge variant="red">No availability</Badge>}
                  {avail.length > 0 && avail.length < 5 && <Badge variant="yellow">Partial</Badge>}
                  {avail.length >= 5 && <Badge variant="green">Good</Badge>}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function getCurrentWeekMonday() {
  const today = new Date()
  const day = today.getDay()
  const daysFromMonday = day === 0 ? 6 : day - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - daysFromMonday)
  return monday.toISOString().slice(0, 10)
}

function StaffTab({ staff, setStaff, profile, supabase }: any) {
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [form, setForm] = useState({ full_name: '', email: '', role: 'floor', phone: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isGM = profile.role === 'gm' || profile.is_admin === true

  const toggleActive = async (id: string, current: boolean) => {
    const { data } = await supabase.from('profiles').update({
      active: !current,
      terminated_at: !current ? null : new Date().toISOString()
    }).eq('id', id).select().single()
    if (data) setStaff((prev: any[]) => prev.map((s: any) => s.id === id ? data : s))
  }

  const updateRole = async (id: string, role: string) => {
    const { data } = await supabase.from('profiles').update({ role }).eq('id', id).select().single()
    if (data) setStaff((prev: any[]) => prev.map((s: any) => s.id === id ? data : s))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {staff.map((s: any) => (
          <Card key={s.id} padding="sm">
            <div className="flex items-center justify-between p-2 gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', s.active ? 'bg-[#323232]' : 'bg-gray-300')}>
                  <span className="text-white text-sm font-bold">{s.full_name?.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#323232] text-sm truncate">{s.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{s.email}</p>
                  {s.phone && <p className="text-xs text-gray-400">{s.phone}</p>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <Badge className={ROLE_COLORS[s.role]}>{ROLE_LABELS[s.role]}</Badge>
                <div className="flex gap-2">
                  {isGM && s.id !== profile.id && (
                    <button
                      onClick={() => toggleActive(s.id, s.active)}
                      className={cn('text-xs px-2 py-1 rounded-lg transition-colors', s.active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200')}
                    >
                      {s.active ? 'Terminate' : 'Reactivate'}
                    </button>
                  )}
                  {!s.active && <Badge variant="red">Terminated</Badge>}
                </div>
              </div>
            </div>
            {isGM && s.id !== profile.id && editId === s.id && (
              <div className="mt-3 pt-3 border-t border-black/5">
                <Select
                  label="Change role"
                  value={s.role}
                  onChange={e => { updateRole(s.id, e.target.value); setEditId(null) }}
                  options={ROLE_OPTIONS}
                />
              </div>
            )}
            {isGM && s.id !== profile.id && (
              <button onClick={() => setEditId(editId === s.id ? null : s.id)} className="mt-2 text-xs text-[#FF6357] hover:underline">
                {editId === s.id ? 'Cancel' : 'Change role'}
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

function ScheduleBuilderTab({ staff, schedules, setSchedules, profile, supabase, availability, rushConfig }: any) {
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = day === 0 ? 1 : 8 - day
    const next = new Date(today)
    next.setDate(today.getDate() + diff)
    return next.toISOString().slice(0,10)
  })
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatedSlots, setGeneratedSlots] = useState<any[]>([])
  const [editSlot, setEditSlot] = useState<string|null>(null)
  const isGM = profile.role === 'gm' || profile.is_admin === true

  const activeStaff = staff.filter((s: any) => s.active && s.role !== 'gm')
  const STAFF_MAP = Object.fromEntries(activeStaff.map((s: any) => [s.id, s]))

  const weekAvailability = availability.filter((a: any) => a.week_starting === weekStart && a.available)


  const getAvail = (slot: any) => {
    const startH = parseInt((slot.start || '08:00').split(':')[0])
    const endH = slot.end === '00:00' ? 24 : parseInt((slot.end || '23:00').split(':')[0])
    const staffWithAvail = new Set<string>()
    weekAvailability.forEach((a: any) => {
      if (a.slot_date === slot.date) {
        const match = a.slot_key.match(/_h(\d+)$/)
        if (match) {
          const hour = parseInt(match[1])
          if (hour >= startH && hour < endH) staffWithAvail.add(a.staff_id)
        }
      }
    })
    return Array.from(staffWithAvail)
  }

  const generateSchedule = async () => {
    setGenerating(true)
    const monday = new Date(weekStart + 'T00:00:00')
    const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    const weekdayConfig = rushConfig?.find((r: any) => r.day_type === 'weekday')
    const rushStartH = parseInt((weekdayConfig?.rush_start || '15:00').split(':')[0])
    const rushEndH = parseInt((weekdayConfig?.rush_end || '21:00').split(':')[0])

    const supRoles = ['supervisor_floor','supervisor_bar','admin']
    const floorRoles = ['floor','supervisor_floor','admin']
    const barRoles = ['bar','supervisor_bar']

    // Get actual available hours for a staff member on a date
    const getStaffHours = (staffId: string, dateStr: string) => {
      const hours = weekAvailability
        .filter((a: any) => a.staff_id === staffId && a.slot_date === dateStr)
        .map((a: any) => { const m = a.slot_key.match(/_h(\d+)$/); return m ? parseInt(m[1]) : -1 })
        .filter((h: number) => h >= 0)
        .sort((a: number, b: number) => a - b)
      if (!hours.length) return null
      return { startH: hours[0], endH: hours[hours.length - 1] + 1, totalH: hours[hours.length - 1] + 1 - hours[0], hours }
    }

    // Get all staff available on a date (have at least 1 hour)
    const getAvailableStaff = (dateStr: string) => {
      const staffSet = new Set<string>()
      weekAvailability.filter((a: any) => a.slot_date === dateStr).forEach((a: any) => staffSet.add(a.staff_id))
      return Array.from(staffSet)
    }

    // Determine if a staff member covers rush hours on a given day
    const coversRush = (staffId: string, dateStr: string, isWeekend: boolean) => {
      if (isWeekend) return true
      const info = getStaffHours(staffId, dateStr)
      if (!info) return false
      return info.hours.some((h: number) => h >= rushStartH && h < rushEndH)
    }

    const assignCount: Record<string,number> = {}
    activeStaff.forEach((s: any) => { assignCount[s.id] = 0 })
    const byLeast = (ids: string[]) => [...ids].sort((a: string, b: string) => (assignCount[a]||0) - (assignCount[b]||0))

    const built: any[] = []

    DAYS.forEach((day, i) => {
      const date = addDays(monday, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const isWeekend = i >= 5
      const availStaff = getAvailableStaff(dateStr)

      // If no staff at all, push empty day
      if (!availStaff.length) {
        built.push({ key: day + '_day', date: dateStr, day, label: day, type: isWeekend ? 'rush' : 'mixed',
          start: '08:00', end: '00:00', startH: 8, endH: 24,
          supervisor_id: null, bar_staff_id: null, floor_staff1_id: null, floor_staff2_id: null,
          issues: ['No staff availability submitted for this day'],
          staff: [], rushStartH, rushEndH, isWeekend, fmtH: (h: number) => { if (h === 0 || h === 24) return '12am'; if (h < 12) return h + 'am'; if (h === 12) return '12pm'; return (h-12) + 'pm' }, status: 'flagged' })
        return
      }

      // Separate by role
      const availSups = byLeast(availStaff.filter((id: string) => supRoles.includes(STAFF_MAP[id]?.role)))
      const availBars = byLeast(availStaff.filter((id: string) => barRoles.includes(STAFF_MAP[id]?.role)))
      const availFloors = byLeast(availStaff.filter((id: string) => floorRoles.includes(STAFF_MAP[id]?.role)))

      // For rush coverage - prefer staff who cover rush hours
      const rushSups = byLeast(availSups.filter((id: string) => coversRush(id, dateStr, isWeekend)))
      const rushBars = byLeast(availBars.filter((id: string) => coversRush(id, dateStr, isWeekend)))
      const rushFloors = byLeast(availFloors.filter((id: string) => coversRush(id, dateStr, isWeekend)))

      // Assign supervisor (prefer rush coverage)
      const supervisor_id = (rushSups[0] || availSups[0]) || null
      if (supervisor_id) assignCount[supervisor_id] = (assignCount[supervisor_id]||0) + 1

      // Assign bar (exclude supervisor) - floor staff can cover bar if needed
      const barPool = byLeast(availBars.filter((id: string) => id !== supervisor_id))
      const rushBarPool = byLeast(rushBars.filter((id: string) => id !== supervisor_id))
      const flexBarPool = byLeast(availFloors.filter((id: string) => id !== supervisor_id && !barPool.length))
      const bar_staff_id = (rushBarPool[0] || barPool[0] || flexBarPool[0]) || null
      const barIsCovering = bar_staff_id && !barPool.includes(bar_staff_id) && !rushBarPool.includes(bar_staff_id)
      if (bar_staff_id) assignCount[bar_staff_id] = (assignCount[bar_staff_id]||0) + 1

      // Assign floor 1 - bar staff can cover floor if needed
      const floorPool = byLeast(availFloors.filter((id: string) => id !== supervisor_id && id !== bar_staff_id))
      const rushFloorPool = byLeast(rushFloors.filter((id: string) => id !== supervisor_id && id !== bar_staff_id))
      const flexFloorPool = byLeast(availBars.filter((id: string) => id !== supervisor_id && id !== bar_staff_id && !floorPool.length))
      const floor_staff1_id = (rushFloorPool[0] || floorPool[0] || flexFloorPool[0]) || null
      const floor1IsCovering = floor_staff1_id && !floorPool.includes(floor_staff1_id) && !rushFloorPool.includes(floor_staff1_id)
      if (floor_staff1_id) assignCount[floor_staff1_id] = (assignCount[floor_staff1_id]||0) + 1

      // Assign floor 2 - bar staff can cover floor if needed
      const floor2Pool = byLeast([...floorPool, ...availBars].filter((id: string) => id !== floor_staff1_id && id !== bar_staff_id && id !== supervisor_id))
      const floor_staff2_id = floor2Pool[0] || null
      const floor2IsCovering = floor_staff2_id && !floorPool.includes(floor_staff2_id)
      if (floor_staff2_id) assignCount[floor_staff2_id] = (assignCount[floor_staff2_id]||0) + 1

      // Build issues
      const issues: string[] = []
      if (!supervisor_id) issues.push('No supervisor available')
      if (!bar_staff_id) issues.push('No bar staff available')
      else if (barIsCovering) issues.push(STAFF_MAP[bar_staff_id]?.full_name?.split(' ')[0] + ' (Floor) covering Bar today')
      if (!floor_staff1_id) issues.push('No floor staff available')
      else if (floor1IsCovering) issues.push(STAFF_MAP[floor_staff1_id]?.full_name?.split(' ')[0] + ' (Bar) covering Floor today')
      if (floor2IsCovering && floor_staff2_id) issues.push(STAFF_MAP[floor_staff2_id]?.full_name?.split(' ')[0] + ' (Bar) covering Floor today')
      if (!floor_staff2_id && isWeekend) issues.push('Need 2nd floor for rush day')

      // Get actual hours for each assigned person
      const getInfo = (id: string | null) => id ? getStaffHours(id, dateStr) : null
      const supInfo = getInfo(supervisor_id)
      const barInfo = getInfo(bar_staff_id)
      const floor1Info = getInfo(floor_staff1_id)
      const floor2Info = getInfo(floor_staff2_id)

      // Calculate overall shift start/end for the day
      const allInfos = [supInfo, barInfo, floor1Info, floor2Info].filter(Boolean)
      const dayStart = allInfos.length ? Math.min(...allInfos.map((x: any) => x.startH)) : 8
      const dayEnd = allInfos.length ? Math.max(...allInfos.map((x: any) => x.endH)) : 24

      const fmtH = (h: number) => { if (h === 0 || h === 24) return '12am'; if (h < 12) return h + 'am'; if (h === 12) return '12pm'; return (h-12) + 'pm' }

      // Find bench staff - available but not assigned (only from STAFF_MAP to ensure they render)
      const assignedIds = new Set([supervisor_id, bar_staff_id, floor_staff1_id, floor_staff2_id].filter(Boolean))
      const benchStaff = availStaff
        .filter((id: string) => !assignedIds.has(id) && STAFF_MAP[id])
        .map((id: string) => ({ id, role: 'Available', info: getStaffHours(id, dateStr) }))

      built.push({
        key: day + '_day',
        date: dateStr,
        day,
        label: day,
        type: isWeekend ? 'rush' : 'mixed',
        start: dayStart + ':00',
        end: dayEnd === 24 ? '00:00' : dayEnd + ':00',
        startH: dayStart,
        endH: dayEnd,
        supervisor_id, bar_staff_id, floor_staff1_id, floor_staff2_id,
        issues,
        staff: [
          supervisor_id && { id: supervisor_id, role: 'Supervisor', info: supInfo },
          bar_staff_id && { id: bar_staff_id, role: 'Bar', info: barInfo },
          floor_staff1_id && { id: floor_staff1_id, role: 'Floor', info: floor1Info },
          floor_staff2_id && { id: floor_staff2_id, role: 'Floor', info: floor2Info },
          ...benchStaff,
        ].filter(Boolean),
        rushStartH, rushEndH, isWeekend, fmtH,
        status: issues.length ? 'flagged' : 'draft'
      })
    })

    setGeneratedSlots(built)
    setGenerating(false)
  }

  const saveSchedule = async () => {
    setSaving(true)
    const schedId = 'SCH-' + Date.now()
    const rows = generatedSlots.map((slot: any) => ({
      schedule_id: schedId,
      week_starting: weekStart,
      slot_id: slot.key,
      slot_date: slot.date,
      slot_label: slot.label,
      slot_type: slot.type === 'mixed' ? 'off-rush' : slot.type,
      start_time: slot.start,
      end_time: slot.end,
      supervisor_id: slot.supervisor_id,
      bar_staff_id: slot.bar_staff_id,
      floor_staff1_id: slot.floor_staff1_id,
      floor_staff2_id: slot.floor_staff2_id,
      status: 'pending_approval',
    }))

    await supabase.from('schedules').delete().eq('week_starting', weekStart)
    const { data } = await supabase.from('schedules').insert(rows).select('*, supervisor:supervisor_id(id,full_name), bar_staff:bar_staff_id(id,full_name), floor_staff1:floor_staff1_id(id,full_name), floor_staff2:floor_staff2_id(id,full_name)')
    if (data) {
      // If GM or admin - auto approve immediately
      if (['gm','admin'].includes(profile.role)) {
        await supabase.from('schedules').update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: profile.id }).eq('week_starting', weekStart)
        const approved = data.map((s: any) => ({ ...s, status: 'approved' }))
        setSchedules((prev: any[]) => [...prev.filter((s: any) => s.week_starting !== weekStart), ...approved])
      } else {
        setSchedules((prev: any[]) => [...prev.filter((s: any) => s.week_starting !== weekStart), ...data])
      }
      setGeneratedSlots([])
    }
    setSaving(false)
  }

  const approveSchedule = async (weekStarting: string) => {
    await supabase.from('schedules').update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: profile.id }).eq('week_starting', weekStarting).eq('status', 'pending_approval')
    setSchedules((prev: any[]) => prev.map((s: any) => s.week_starting === weekStarting && s.status === 'pending_approval' ? { ...s, status: 'approved' } : s))
  }

  const weekSchedules = schedules.filter((s: any) => s.week_starting === weekStart)
  const pendingWeek = weekSchedules.filter((s: any) => s.status === 'pending_approval')
  const approvedWeek = weekSchedules.filter((s: any) => s.status === 'approved')

  return (
    <div className="space-y-4">
      <Card padding="sm">
        <div className="flex items-center justify-between p-3">
          <button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()-7); setWeekStart(format(d,'yyyy-MM-dd')); setGeneratedSlots([]) }} className="w-9 h-9 rounded-xl bg-[#F7F0E8] hover:bg-black/10 flex items-center justify-center transition-colors"><ChevronLeft size={16}/></button>
          <div className="text-center">
            <p className="font-semibold text-sm text-[#323232]">Week of {format(new Date(weekStart+'T00:00:00'), 'MMM d')} - {format(addDays(new Date(weekStart+'T00:00:00'),6), 'MMM d, yyyy')}</p>
            <p className="text-xs text-gray-400">{weekSchedules.length} slots - {weekAvailability.length} availability entries</p>
          </div>
          <button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()+7); setWeekStart(format(d,'yyyy-MM-dd')); setGeneratedSlots([]) }} className="w-9 h-9 rounded-xl bg-[#F7F0E8] hover:bg-black/10 flex items-center justify-center transition-colors"><ChevronRight size={16}/></button>
        </div>
      </Card>

      {pendingWeek.length > 0 && isGM && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Approval</CardTitle>
            <Badge variant="yellow">{pendingWeek.length} slots</Badge>
          </CardHeader>
          <div className="space-y-2 mb-4">
            {pendingWeek.slice(0,5).map((slot: any) => (
              <div key={slot.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F7F0E8] text-sm">
                <span className="font-medium text-[#323232]">{slot.slot_label}</span>
                <div className="flex gap-1 text-xs text-gray-500">
                  {[slot.supervisor, slot.bar_staff, slot.floor_staff1, slot.floor_staff2].filter(Boolean).map((s: any) => s.full_name?.split(' ')[0]).join(', ')}
                </div>
              </div>
            ))}
          </div>
          <Button onClick={() => approveSchedule(weekStart)} className="w-full">
            <Check size={16} className="mr-2"/> Approve All {pendingWeek.length} Slots for This Week
          </Button>
        </Card>
      )}

      {approvedWeek.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Approved Schedule</CardTitle>
            <Badge variant="green">{approvedWeek.length} slots</Badge>
          </CardHeader>
          <div className="space-y-1">
            {approvedWeek.map((slot: any) => (
              <div key={slot.id} className="flex items-center justify-between p-3 rounded-xl bg-green-50 text-sm">
                <span className="font-medium text-[#323232]">{slot.slot_label}</span>
                <span className="text-xs text-gray-500">
                  {[slot.supervisor, slot.bar_staff, slot.floor_staff1, slot.floor_staff2].filter(Boolean).map((s: any) => s.full_name?.split(' ')[0]).join(' - ')}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {generatedSlots.length > 0 ? (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-black/5 p-5 flex items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-[#323232]">Schedule Preview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Auto-assigned by least hours. Use Swap dropdowns to override.</p>
            </div>
            <button onClick={saveSchedule} disabled={saving}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6357] text-white text-sm font-bold hover:bg-[#e5554a] transition-all disabled:opacity-50 shadow-sm">
              {saving ? 'Saving...' : 'Save and Submit'}
            </button>
          </div>
          {generatedSlots.map((slot: any) => {
            const isWeekend = slot.isWeekend
            const fmtH = (h: number) => { if (h === 0 || h === 24) return '12am'; if (h < 12) return h + 'am'; if (h === 12) return '12pm'; return (h-12) + 'pm' }
            const slotAvail = (() => {
              const staffSet = new Set<string>()
              weekAvailability.filter((a: any) => a.slot_date === slot.date).forEach((a: any) => staffSet.add(a.staff_id))
              return Array.from(staffSet)
            })()
            return (
              <div key={slot.key} className={cn('bg-white rounded-2xl overflow-hidden shadow-sm', slot.issues?.length ? 'ring-2 ring-red-200' : 'ring-1 ring-black/5')}>
                {/* Day header */}
                <div className={cn('px-8 py-6 flex items-center justify-between', slot.issues?.length ? 'bg-red-900' : 'bg-[#323232]')}>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-black text-white text-2xl">{slot.day}</p>
                      <p className="text-xs text-white/50">{slot.date}</p>
                    </div>
                    {isWeekend && <span className="text-xs px-2.5 py-1 rounded-full bg-[#FF6357] text-white font-semibold">Full Rush</span>}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-white">{fmtH(slot.startH)} - {fmtH(slot.endH)}</p>
                    <p className="text-xs text-white/50">{slot.staff?.length || 0} staff · {slot.issues?.length ? slot.issues.length + ' issue' + (slot.issues.length > 1 ? 's' : '') : 'all good'}</p>
                  </div>
                </div>
                {/* Rush band indicator for weekdays */}
                {!isWeekend && (
                  <div className="px-8 py-4 bg-[#F7F0E8] border-b border-black/5 flex items-center gap-6">
                    <div className="flex-1 h-2 rounded-full bg-gray-100 relative overflow-hidden">
                      <div className="absolute h-full bg-blue-200 rounded-full" style={{left: '0%', width: ((slot.rushStartH - 8) / 16 * 100) + '%'}}/>
                      <div className="absolute h-full bg-orange-300 rounded-full" style={{left: ((slot.rushStartH - 8) / 16 * 100) + '%', width: ((slot.rushEndH - slot.rushStartH) / 16 * 100) + '%'}}/>
                      <div className="absolute h-full bg-blue-200 rounded-full" style={{left: ((slot.rushEndH - 8) / 16 * 100) + '%', width: ((24 - slot.rushEndH) / 16 * 100) + '%'}}/>
                    </div>
                    <div className="flex gap-3 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-200 inline-block"/>Off-rush</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-300 inline-block"/>Rush {fmtH(slot.rushStartH)}-{fmtH(slot.rushEndH)}</span>
                    </div>
                  </div>
                )}
                {/* Staff grid */}
                <div className="px-6 py-4 space-y-3">
                  {(slot.staff || []).map((member: any) => {
                    const s = STAFF_MAP[member.id]
                    if (!s) return null
                    const info = member.info
                    const roleColor = member.role === 'Supervisor' ? 'bg-blue-500' : member.role === 'Bar' ? 'bg-purple-500' : member.role === 'Available' ? 'bg-gray-400' : 'bg-green-500'
                    const roleBg = member.role === 'Supervisor' ? 'bg-blue-50 border-blue-100' : member.role === 'Bar' ? 'bg-purple-50 border-purple-100' : member.role === 'Available' ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-100'
                    const roleTextColor = member.role === 'Supervisor' ? 'text-blue-600' : member.role === 'Bar' ? 'text-purple-600' : member.role === 'Available' ? 'text-gray-500' : 'text-green-600'
                    const memberActualRole = STAFF_MAP[member.id]?.role || ''
                    const eligibleRoles = member.role === 'Supervisor' ? ['supervisor_floor','supervisor_bar','admin'] : member.role === 'Bar' ? ['bar','supervisor_bar'] : member.role === 'Available' ? ['floor','bar','supervisor_floor','supervisor_bar','admin'] : ['floor','supervisor_floor','admin']
                    const fieldName: string = member.role === 'Supervisor' ? 'supervisor_id' : member.role === 'Bar' ? 'bar_staff_id' : member.role === 'Available' ? '__bench__' : member.id === slot.floor_staff1_id ? 'floor_staff1_id' : 'floor_staff2_id'
                    // For Available bench staff - no swap button needed
                    // For assigned staff - can swap with anyone available that day with matching role
                    const allDayAvail = slot.staff.map((m: any) => m.id) // all staff in this day slot
                    const alts = member.role === 'Available' ? [] : slotAvail.filter((sid: string) => {
                      if (sid === member.id) return false
                      if (!eligibleRoles.includes(STAFF_MAP[sid]?.role)) return false
                      // Don't show someone already assigned to a different role (but bench is ok)
                      const isAssigned = (sid === slot.supervisor_id && fieldName !== 'supervisor_id') ||
                        (sid === slot.bar_staff_id && fieldName !== 'bar_staff_id') ||
                        (sid === slot.floor_staff1_id && fieldName !== 'floor_staff1_id') ||
                        (sid === slot.floor_staff2_id && fieldName !== 'floor_staff2_id')
                      if (isAssigned) return false
                      // Check availability overlap
                      if (!info) return true
                      const theirHours = weekAvailability
                        .filter((a: any) => a.staff_id === sid && a.slot_date === slot.date)
                        .map((a: any) => { const m = a.slot_key.match(/_h(\d+)$/); return m ? parseInt(m[1]) : -1 })
                        .filter((h: number) => h >= 0)
                      const overlap = theirHours.filter((h: number) => h >= info.startH && h < info.endH)
                      return overlap.length >= Math.ceil(info.totalH * 0.5)
                    })
                    return (
                      <div key={member.id} className={cn("rounded-2xl border px-5 py-4 flex items-center justify-between gap-4", roleBg)}>
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={cn("w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0", roleColor)}>
                            {s.full_name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-base font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                              <span className={cn("text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", roleBg, roleTextColor, "border")}>{member.role}</span>
                              {info && <span className="text-xs font-bold text-[#FF6357] ml-auto">{info.totalH}h</span>}
                            </div>
                            {info ? (
                              <div className="relative">
                                {/* Timeline bar: 8am to 12am = 16 hours */}
                                <div className="relative h-5 rounded-full overflow-hidden" style={{backgroundColor: 'rgba(0,0,0,0.06)'}}>
                                  {/* Rush band background */}
                                  <div className="absolute h-full opacity-30" style={{
                                    left: ((slot.rushStartH - 8) / 16 * 100) + '%',
                                    width: ((slot.rushEndH - slot.rushStartH) / 16 * 100) + '%',
                                    backgroundColor: '#FB923C'
                                  }}/>
                                  {/* Staff hours fill */}
                                  <div className="absolute h-full rounded-full transition-all duration-500" style={{
                                    left: Math.max(0, (info.startH - 8) / 16 * 100) + '%',
                                    width: Math.min(100 - Math.max(0, (info.startH - 8) / 16 * 100), (info.totalH / 16 * 100)) + '%',
                                    backgroundColor: member.role === 'Supervisor' ? '#3B82F6' : member.role === 'Bar' ? '#A855F7' : '#22C55E',
                                    opacity: 0.85
                                  }}/>
                                  {/* Time labels positioned at fill location */}
                                  <div className="absolute inset-y-0 flex items-center pointer-events-none" style={{
                                    left: Math.max(0, (info.startH - 8) / 16 * 100) + '%',
                                    width: Math.min(100 - Math.max(0, (info.startH - 8) / 16 * 100), (info.totalH / 16 * 100)) + '%',
                                  }}>
                                    <div className="w-full flex items-center justify-between px-1.5">
                                      <span className="text-white font-bold drop-shadow" style={{fontSize:'9px'}}>{fmtH(info.startH)}</span>
                                      <span className="text-white font-bold drop-shadow" style={{fontSize:'9px'}}>{fmtH(info.endH)}</span>
                                    </div>
                                  </div>
                                </div>
                                {/* Hour markers - every hour 8a to 12a */}
                                <div className="relative mt-1" style={{height:'12px'}}>
                                  {[8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24].map(h => (
                                    <span key={h} className="absolute text-gray-400" style={{
                                      left: ((h-8)/16*100)+'%',
                                      fontSize:'8px', fontWeight:600,
                                      transform:'translateX(-50%)',
                                      whiteSpace:'nowrap'
                                    }}>
                                      {h===24?'12a':h===12?'12p':h>12?(h-12)+'p':h+'a'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="h-5 rounded-full" style={{backgroundColor: 'rgba(0,0,0,0.06)'}}/>
                            )}
                          </div>
                        </div>
                        {alts.length > 0 && (
                          <select value="" onChange={e => {
                            if (!e.target.value) return
                            const newId = e.target.value
                            setGeneratedSlots((prev: any[]) => prev.map((gs: any) => {
                              if (gs.key !== slot.key) return gs
                              const updated = fieldName === '__bench__' ? gs : { ...gs, [fieldName]: newId }
                              const newHours = weekAvailability
                                .filter((a: any) => a.staff_id === newId && a.slot_date === gs.date)
                                .map((a: any) => { const match = a.slot_key.match(/_h(\d+)$/); return match ? parseInt(match[1]) : -1 })
                                .filter((h: number) => h >= 0)
                                .sort((a: number, b: number) => a - b)
                              const newInfo = newHours.length ? { startH: newHours[0], endH: newHours[newHours.length-1]+1, totalH: newHours[newHours.length-1]+1-newHours[0], hours: newHours } : null
                              // Swap: new person takes role, old person becomes Available
                              const oldMember = { id: member.id, role: 'Available', info: member.info }
                              const newStaff = gs.staff
                                .map((m: any) => {
                                  if (m.id === member.id) return { ...m, id: newId, info: newInfo } // new person takes role
                                  if (m.id === newId) return null // remove from bench
                                  return m
                                })
                                .filter(Boolean)
                              // Add old person to bench if not already there
                              const alreadyInStaff = newStaff.some((m: any) => m.id === oldMember.id)
                              if (!alreadyInStaff) newStaff.push(oldMember)
                              // Update the slot IDs too
                              return { ...(fieldName === '__bench__' ? gs : { ...gs, [fieldName]: newId }), staff: newStaff }
                            }))
                          }}
                            className={cn("text-sm rounded-xl px-3 py-1.5 border-2 cursor-pointer font-bold bg-white flex-shrink-0", roleTextColor, "border-current/30 hover:border-current/60 transition-colors")}>
                            <option value="">Swap</option>
                            {alts.map((sid: string) => (
                              <option key={sid} value={sid}>{STAFF_MAP[sid]?.full_name?.split(' ')[0]}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    )
                  })}
                </div>
                {/* Issues */}
                {slot.issues?.length > 0 && (
                  <div className="mx-6 mb-6 px-5 py-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5"/>
                    <span className="text-xs text-red-500 font-medium">{slot.issues.join(' · ')}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <button onClick={generateSchedule} disabled={generating}
          className="w-full py-4 rounded-2xl bg-[#323232] text-white font-semibold text-sm hover:bg-black transition-all disabled:opacity-50">
          {generating ? 'Generating...' : 'Auto-Generate Schedule from Availability'}
        </button>
      )}
    </div>
  )
}

function ApprovalsTab({ pendingDaysOff, setPendingDaysOff, pendingSwaps, setPendingSwaps, pendingAttendance, setPendingAttendance, profile, supabase }: any) {

  const [loading, setLoading] = useState<string|null>(null)
  const isGM = profile.role === 'gm' || profile.is_admin === true

  const approveDayOff = async (id: string, action: 'approve'|'deny') => {
    setLoading(id+action)
    const isSupervisor = ['supervisor_floor','supervisor_bar'].includes(profile.role)
    const newStatus = action === 'approve' ? (isSupervisor ? 'pending_gm' : 'approved') : 'denied'
    const update: any = { status: newStatus }
    if (action === 'approve') {
      if (isSupervisor) update.supervisor_approved_at = new Date().toISOString()
      else update.gm_approved_at = new Date().toISOString()
    }
    await supabase.from('day_off_requests').update(update).eq('id', id)
    setPendingDaysOff((prev: any[]) => prev.filter((r: any) => r.id !== id))
    setLoading(null)
  }

  const approveSwap = async (id: string, action: 'approve'|'deny') => {
    setLoading(id+action)
    await supabase.from('swap_requests').update({ status: action === 'approve' ? 'approved' : 'denied', resolved_at: new Date().toISOString() }).eq('id', id)
    setPendingSwaps((prev: any[]) => prev.filter((r: any) => r.id !== id))
    setLoading(null)
  }

  const approveAttendance = async (id: string, action: 'approve'|'reject') => {
    setLoading(id+action)
    await supabase.from('attendance').update({ status: action === 'approve' ? 'checked_in' : 'rejected' }).eq('id', id)
    setPendingAttendance((prev: any[]) => prev.filter((r: any) => r.id !== id))
    setLoading(null)
  }

  const total = pendingDaysOff.length + pendingSwaps.length + pendingAttendance.length

  return (
    <div className="space-y-4">
      {total === 0 && (
        <Card><p className="text-center text-gray-400 text-sm py-8">No pending approvals</p></Card>
      )}

      {pendingAttendance.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Punch-In Approvals</CardTitle><Badge variant="yellow">{pendingAttendance.length}</Badge></CardHeader>
          <div className="space-y-2">
            {pendingAttendance.map((rec: any) => (
              <div key={rec.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F7F0E8]">
                <div>
                  <p className="text-sm font-medium text-[#323232]">{rec.staff?.full_name}</p>
                  <p className="text-xs text-gray-500">{rec.checkin_time} - {rec.shift_type}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" loading={loading===rec.id+'approve'} onClick={() => approveAttendance(rec.id,'approve')}><Check size={14}/></Button>
                  <Button size="sm" variant="danger" loading={loading===rec.id+'reject'} onClick={() => approveAttendance(rec.id,'reject')}><X size={14}/></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {pendingSwaps.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Swap Approvals</CardTitle><Badge variant="yellow">{pendingSwaps.length}</Badge></CardHeader>
          <div className="space-y-2">
            {pendingSwaps.map((swap: any) => (
              <div key={swap.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F7F0E8]">
                <div>
                  <p className="text-sm font-medium text-[#323232]">{swap.staff_a?.full_name} + {swap.staff_b?.full_name}</p>
                  <p className="text-xs text-gray-500">{swap.shift_date} - {swap.shift_label}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" loading={loading===swap.id+'approve'} onClick={() => approveSwap(swap.id,'approve')}><Check size={14}/></Button>
                  <Button size="sm" variant="danger" loading={loading===swap.id+'deny'} onClick={() => approveSwap(swap.id,'deny')}><X size={14}/></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {pendingDaysOff.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Day Off Requests</CardTitle><Badge variant="yellow">{pendingDaysOff.length}</Badge></CardHeader>
          <div className="space-y-2">
            {pendingDaysOff.map((req: any) => (
              <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F7F0E8]">
                <div>
                  <p className="text-sm font-medium text-[#323232]">{req.staff?.full_name}</p>
                  <p className="text-xs text-gray-500">{format(new Date(req.date_off+'T00:00:00'), 'EEE MMM d')} {req.reason ? '- '+req.reason : ''}</p>
                  {req.status === 'pending_gm' && <Badge variant="yellow">Awaiting GM</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" loading={loading===req.id+'approve'} onClick={() => approveDayOff(req.id,'approve')}><Check size={14}/></Button>
                  <Button size="sm" variant="danger" loading={loading===req.id+'deny'} onClick={() => approveDayOff(req.id,'deny')}><X size={14}/></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function SettingsTab({ rushConfig, setRushConfig, profile, supabase }: any) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const isGM = profile.role === 'gm' || profile.is_admin === true
  const weekday = rushConfig.find((r: any) => r.day_type === 'weekday') || { rush_start: '15:00', rush_end: '21:00' }
  const weekend = rushConfig.find((r: any) => r.day_type === 'weekend') || { rush_start: '08:00', rush_end: '00:00' }
  const [wdStart, setWdStart] = useState(weekday.rush_start)
  const [wdEnd, setWdEnd] = useState(weekday.rush_end)
  const [weStart, setWeStart] = useState(weekend.rush_start)
  const [weEnd, setWeEnd] = useState(weekend.rush_end)

  const save = async () => {
    if (!isGM) return
    setSaving(true)
    await Promise.all([
      supabase.from('rush_hour_config').upsert({ day_type: 'weekday', rush_start: wdStart, rush_end: wdEnd, updated_by: profile.id, updated_at: new Date().toISOString() }, { onConflict: 'day_type' }),
      supabase.from('rush_hour_config').upsert({ day_type: 'weekend', rush_start: weStart, rush_end: weEnd, updated_by: profile.id, updated_at: new Date().toISOString() }, { onConflict: 'day_type' }),
    ])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Rush Hour Configuration</CardTitle></CardHeader>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-[#323232] mb-3">Weekdays (Mon-Fri)</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Rush starts" type="time" value={wdStart} onChange={e => setWdStart(e.target.value)} disabled={!isGM}/>
              <Input label="Rush ends" type="time" value={wdEnd} onChange={e => setWdEnd(e.target.value)} disabled={!isGM}/>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#323232] mb-3">Weekends (Sat-Sun)</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Rush starts" type="time" value={weStart} onChange={e => setWeStart(e.target.value)} disabled={!isGM}/>
              <Input label="Rush ends" type="time" value={weEnd} onChange={e => setWeEnd(e.target.value)} disabled={!isGM}/>
            </div>
          </div>
          {isGM ? (
            <Button onClick={save} loading={saving} className="w-full">
              {saved ? <><Check size={16} className="mr-2"/>Saved!</> : 'Save Rush Hour Settings'}
            </Button>
          ) : (
            <p className="text-sm text-center text-gray-400">Only the GM can change rush hour settings</p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>System Info</CardTitle></CardHeader>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Off-Rush staffing', value: '1 supervisor + 1 bar + 1 floor' },
            { label: 'Rush staffing', value: '1 supervisor + 1 bar + 2 floor' },
            { label: 'Swap cutoff', value: '2 hours before shift' },
            { label: 'Schedule approval', value: 'GM required' },
            { label: 'Punch-in approval', value: 'JP + Miled + Garo' },
          ].map((item: any) => (
            <div key={item.label} className="flex justify-between p-3 rounded-xl bg-[#F7F0E8]">
              <span className="text-gray-500">{item.label}</span>
              <span className="font-medium text-[#323232]">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
