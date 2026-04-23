'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn, ROLE_LABELS, ROLE_COLORS } from '@/lib/utils'
import {
  Users, Settings, Calendar, CheckSquare, ArrowLeftRight,
  CalendarOff, Plus, Edit2, UserX, UserCheck, ChevronDown,
  ChevronUp, Check, X, Clock, Wand2, Eye
} from 'lucide-react'
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
      {tab === 'schedule' && <ScheduleBuilderTab staff={staff} schedules={schedules} setSchedules={setSchedules} profile={profile} supabase={supabase} availability={availability}/>}
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
  const isGM = profile.role === 'gm'

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

function ScheduleBuilderTab({ staff, schedules, setSchedules, profile, supabase, availability }: any) {
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
  const isGM = profile.role === 'gm'

  const activeStaff = staff.filter((s: any) => s.active && s.role !== 'gm')
  const STAFF_MAP = Object.fromEntries(activeStaff.map((s: any) => [s.id, s]))

  const weekAvailability = availability.filter((a: any) => a.week_starting === weekStart && a.available)

  const generateSchedule = async () => {
    setGenerating(true)
    const monday = new Date(weekStart + 'T00:00:00')
    const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    const slots: any[] = []

    DAYS.forEach((day, i) => {
      const date = addDays(monday, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const isWeekend = i >= 5

      if (isWeekend) {
        slots.push({ key: day+'_full', date: dateStr, day, label: day+' Full Day 8am-12am', type: 'rush', start: '08:00', end: '00:00' })
      } else {
        slots.push(
          { key: day+'_morning', date: dateStr, day, label: day+' Morning 8am-3pm', type: 'off-rush', start: '08:00', end: '15:00' },
          { key: day+'_rush', date: dateStr, day, label: day+' Rush 3pm-9pm', type: 'rush', start: '15:00', end: '21:00' },
          { key: day+'_evening', date: dateStr, day, label: day+' Evening 9pm-12am', type: 'off-rush', start: '21:00', end: '00:00' },
        )
      }
    })

    const assignCount: Record<string,number> = {}
    activeStaff.forEach((s: any) => { assignCount[s.id] = 0 })

    const getAvail = (slot: any) => {
      // slot has start/end times, check which staff have availability covering those hours
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
    const supRoles = ['supervisor_floor','supervisor_bar']
    const floorRoles = ['floor','supervisor_floor']
    const barRoles = ['bar','supervisor_bar']

    const byLeast = (ids: string[]) => [...ids].sort((a: any, b: any) => (assignCount[a]||0) - (assignCount[b]||0))

    const built = slots.map((slot: any) => {
      const avail = getAvail(slot)
      const sups = byLeast(avail.filter((id: string) => supRoles.includes(STAFF_MAP[id]?.role)))
      const bars = byLeast(avail.filter((id: string) => barRoles.includes(STAFF_MAP[id]?.role)))
      const floors = byLeast(avail.filter((id: string) => floorRoles.includes(STAFF_MAP[id]?.role)))
      const issues: string[] = []

      let supervisor_id = sups[0] || null
      if (!supervisor_id) issues.push('No supervisor available')
      else assignCount[supervisor_id] = (assignCount[supervisor_id]||0) + 1

      const barCandidates = bars.filter((id: string) => id !== supervisor_id)
      let bar_staff_id = barCandidates[0] || null
      if (!bar_staff_id) issues.push('No bar staff available')
      else assignCount[bar_staff_id] = (assignCount[bar_staff_id]||0) + 1

      const floorCandidates = floors.filter((id: string) => id !== supervisor_id && id !== bar_staff_id)
      let floor_staff1_id = floorCandidates[0] || null
      if (!floor_staff1_id) issues.push('No floor staff available')
      else assignCount[floor_staff1_id] = (assignCount[floor_staff1_id]||0) + 1

      let floor_staff2_id = null
      if (slot.type === 'rush') {
        const f2 = floorCandidates.filter((id: string) => id !== floor_staff1_id)[0] || null
        if (!f2) issues.push('Need 2nd floor staff for rush')
        else { floor_staff2_id = f2; assignCount[f2] = (assignCount[f2]||0) + 1 }
      }

      return { ...slot, supervisor_id, bar_staff_id, floor_staff1_id, floor_staff2_id, issues, status: issues.length ? 'flagged' : 'draft' }
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
      slot_type: slot.type,
      start_time: slot.start,
      end_time: slot.end,
      supervisor_id: slot.supervisor_id,
      bar_staff_id: slot.bar_staff_id,
      floor_staff1_id: slot.floor_staff1_id,
      floor_staff2_id: slot.floor_staff2_id,
      status: 'pending_approval',
    }))

    await supabase.from('schedules').delete().eq('week_starting', weekStart).eq('status', 'draft')
    const { data } = await supabase.from('schedules').insert(rows).select('*, supervisor:supervisor_id(id,full_name), bar_staff:bar_staff_id(id,full_name), floor_staff1:floor_staff1_id(id,full_name), floor_staff2:floor_staff2_id(id,full_name)')
    if (data) {
      setSchedules((prev: any[]) => [...prev.filter(s => s.week_starting !== weekStart), ...data])
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
        <div className="flex items-center justify-between p-2">
          <button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()-7); setWeekStart(format(d,'yyyy-MM-dd')); setGeneratedSlots([]) }} className="p-2 rounded-lg hover:bg-black/5">?</button>
          <div className="text-center">
            <p className="font-semibold text-sm text-[#323232]">Week of {format(new Date(weekStart+'T00:00:00'), 'MMM d')} - {format(addDays(new Date(weekStart+'T00:00:00'),6), 'MMM d, yyyy')}</p>
            <p className="text-xs text-gray-400">{weekSchedules.length} slots - {weekAvailability.length} availability entries</p>
          </div>
          <button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()+7); setWeekStart(format(d,'yyyy-MM-dd')); setGeneratedSlots([]) }} className="p-2 rounded-lg hover:bg-black/5">?</button>
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#323232]">Generated Schedule Preview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Auto-assigned by least hours. Use dropdowns to swap staff.</p>
            </div>
            <Button size="sm" onClick={saveSchedule} loading={saving}>Save and Submit</Button>
          </div>
          {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => {
            const daySlots = generatedSlots.filter((s: any) => s.day === day)
            if (!daySlots.length) return null
            const issues = [...new Set(daySlots.flatMap((s: any) => s.issues || []))]
            const isWeekend = day === 'Saturday' || day === 'Sunday'
            const ft = (t: string) => { if (t === '00:00') return '12am'; const h = parseInt(t.split(':')[0]); if (h < 12) return h + 'am'; if (h === 12) return '12pm'; return (h-12) + 'pm' }
            return (
              <div key={day} className={cn('bg-white rounded-2xl border overflow-hidden', issues.length ? 'border-red-200' : 'border-black/5')}>
                <div className={cn('px-4 py-3 flex items-center justify-between', issues.length ? 'bg-red-50' : isWeekend ? 'bg-orange-50' : 'bg-[#F7F0E8]')}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#323232]">{day}</span>
                    <span className="text-xs text-gray-400">{daySlots[0]?.date}</span>
                  </div>
                  <span className="text-xs text-gray-500">{daySlots.length} shift{daySlots.length > 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-black/5">
                  {daySlots.map((slot: any) => {
                    const assigned = [
                      slot.supervisor_id && { id: slot.supervisor_id, role: 'Supervisor', field: 'supervisor_id', eligibleRoles: ['supervisor_floor','supervisor_bar'] },
                      slot.bar_staff_id && { id: slot.bar_staff_id, role: 'Bar', field: 'bar_staff_id', eligibleRoles: ['bar','supervisor_bar'] },
                      slot.floor_staff1_id && { id: slot.floor_staff1_id, role: 'Floor', field: 'floor_staff1_id', eligibleRoles: ['floor','supervisor_floor'] },
                      slot.floor_staff2_id && { id: slot.floor_staff2_id, role: 'Floor 2', field: 'floor_staff2_id', eligibleRoles: ['floor','supervisor_floor'] },
                    ].filter(Boolean)
                    const slotAvail = getAvail(slot)
                    return (
                      <div key={slot.key} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#323232]">{slot.label}</span>
                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', slot.type === 'rush' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600')}>{slot.type}</span>
                          </div>
                          <span className="text-xs text-gray-400">{ft(slot.start)} - {ft(slot.end === '00:00' ? '00:00' : slot.end)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {assigned.map((a: any) => {
                            const current = STAFF_MAP[a.id]
                            const alternatives = slotAvail.filter((sid: string) =>
                              sid !== a.id && a.eligibleRoles.includes(STAFF_MAP[sid]?.role) &&
                              sid !== slot.supervisor_id && sid !== slot.bar_staff_id &&
                              (a.field === 'floor_staff1_id' || sid !== slot.floor_staff1_id) &&
                              (a.field === 'floor_staff2_id' || sid !== slot.floor_staff2_id)
                            )
                            return (
                              <div key={a.field} className="flex items-center gap-2 p-2 rounded-xl bg-[#F7F0E8]">
                                <div className="w-6 h-6 rounded-full bg-[#323232] flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-bold">{current?.full_name?.charAt(0)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-[#323232] truncate">{current?.full_name?.split(' ')[0] || 'Unassigned'}</p>
                                  <p className="text-xs text-gray-400">{a.role}</p>
                                </div>
                                {alternatives.length > 0 && (
                                  <select
                                    value=""
                                    onChange={e => {
                                      if (!e.target.value) return
                                      setGeneratedSlots(prev => prev.map((gs: any) =>
                                        gs.key === slot.key ? { ...gs, [a.field]: e.target.value } : gs
                                      ))
                                    }}
                                    className="text-xs border border-black/10 rounded-lg px-1 py-0.5 bg-white text-[#323232] cursor-pointer"
                                  >
                                    <option value="">Swap</option>
                                    {alternatives.map((sid: string) => (
                                      <option key={sid} value={sid}>{STAFF_MAP[sid]?.full_name?.split(' ')[0]}</option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        {slot.issues?.length > 0 && (
                          <p className="text-xs text-red-500 mt-2">{slot.issues.join(' · ')}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
                {issues.length > 0 && (
                  <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                    <p className="text-xs text-red-500">{issues.join(' · ')}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <Button onClick={generateSchedule} loading={generating} className="w-full" size="lg">
          Auto-Generate Schedule from Availability
          Auto-Generate Schedule from Availability
          Auto-Generate Schedule from Availability
        </Button>
      )}
    </div>
  )
}

function ApprovalsTab({ pendingDaysOff, setPendingDaysOff, pendingSwaps, setPendingSwaps, pendingAttendance, setPendingAttendance, profile, supabase }: any) {
  const [loading, setLoading] = useState<string|null>(null)
  const isGM = profile.role === 'gm'

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
                  <p className="text-sm font-medium text-[#323232]">{swap.staff_a?.full_name} ? {swap.staff_b?.full_name}</p>
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
  const isGM = profile.role === 'gm'
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
