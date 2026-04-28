const fs = require("fs");

// Design tokens
const D = {
  bg: '#1C1C1E',
  bgCard: '#2C2C2E',
  bgHover: '#3A3A3C',
  bgInput: '#3A3A3C',
  coral: '#FF6357',
  coralDim: 'rgba(255,99,87,0.15)',
  cream: '#F7F0E8',
  creamDim: 'rgba(247,240,232,0.08)',
  creamMid: 'rgba(247,240,232,0.5)',
  white: '#FFFFFF',
  border: 'rgba(255,255,255,0.08)',
  borderMid: 'rgba(255,255,255,0.12)',
  blue: '#3B82F6',
  purple: '#A855F7',
  green: '#22C55E',
  gray: '#636366',
  grayLight: '#8E8E93',
  radius: '14px',
  radiusSm: '10px',
  radiusLg: '20px',
};

const content = `'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, ROLE_LABELS, ROLE_COLORS } from '@/lib/utils'
import { Users, Settings, Calendar, CheckSquare, ArrowLeftRight, CalendarOff, Check, X, Clock, ChevronLeft, ChevronRight, AlertCircle, Eye, Zap } from 'lucide-react'
import { format, addDays } from 'date-fns'

const BG = '#1a1a1a'
const CARD = '#242424'
const CARD2 = '#2e2e2e'
const BORDER = 'rgba(255,255,255,0.08)'
const CORAL = '#FF6357'
const CREAM = '#F7F0E8'
const MUTED = 'rgba(247,240,232,0.45)'

const S = {
  card: { backgroundColor: CARD, borderRadius: '16px', border: \`1px solid \${BORDER}\`, padding: '20px' } as React.CSSProperties,
  cardSm: { backgroundColor: CARD, borderRadius: '16px', border: \`1px solid \${BORDER}\`, padding: '12px 16px' } as React.CSSProperties,
  row: { backgroundColor: CARD2, borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' } as React.CSSProperties,
  label: { color: MUTED, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  title: { color: CREAM, fontSize: '15px', fontWeight: 700 },
  body: { color: MUTED, fontSize: '13px' },
  btn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', backgroundColor: CORAL, color: 'white', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0, boxShadow: '0 2px 12px rgba(255,99,87,0.4)' } as React.CSSProperties,
  btnSm: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', backgroundColor: CORAL, color: 'white', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  btnGhost: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.06)', color: CREAM, fontSize: '13px', fontWeight: 600, border: \`1px solid \${BORDER}\`, cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  btnDanger: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', backgroundColor: '#ef4444', color: 'white', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  btnSuccess: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', backgroundColor: '#22c55e', color: 'white', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: <Eye size={14}/> },
  { id: 'staff', label: 'Staff', icon: <Users size={14}/> },
  { id: 'schedule', label: 'Schedule', icon: <Calendar size={14}/> },
  { id: 'approvals', label: 'Approvals', icon: <CheckSquare size={14}/> },
  { id: 'settings', label: 'Settings', icon: <Settings size={14}/> },
]

const ROLE_OPTIONS = [
  { value: 'floor', label: 'Floor Staff' },
  { value: 'bar', label: 'Bar Staff' },
  { value: 'supervisor_floor', label: 'Supervisor (Floor)' },
  { value: 'supervisor_bar', label: 'Supervisor (Bar)' },
  { value: 'gm', label: 'General Manager' },
]

interface Props {
  profile: any; allStaff: any[]; rushConfig: any[]; pendingDaysOff: any[]
  pendingSwaps: any[]; pendingAttendance: any[]; schedules: any[]; availability: any[]
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

  return (
    <div style={{ backgroundColor: BG, borderRadius: '20px', padding: '24px', minHeight: '600px' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {TABS.map((t: any) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
            backgroundColor: tab === t.id ? CORAL : 'rgba(255,255,255,0.06)',
            color: tab === t.id ? 'white' : MUTED,
            boxShadow: tab === t.id ? '0 2px 12px rgba(255,99,87,0.35)' : 'none',
          }}>
            {t.icon}{t.label}
            {t.id === 'approvals' && totalApprovals > 0 && (
              <span style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', fontSize: '11px', padding: '1px 6px', borderRadius: '20px', fontWeight: 700 }}>{totalApprovals}</span>
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

function Stat({ label, value, icon, color }: any) {
  return (
    <div style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={S.label}>{label}</span>
        <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: color + '20', color }}>{icon}</div>
      </div>
      <p style={{ color: CREAM, fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>{value}</p>
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

function OverviewTab({ staff, pendingDaysOff, pendingSwaps, pendingAttendance, schedules, availability }: any) {
  const activeStaff = staff.filter((s: any) => s.active)
  const approvedSchedules = schedules.filter((s: any) => s.status === 'approved')
  const thisWeek = getCurrentWeekMonday()
  const weekAvail = availability.filter((a: any) => a.week_starting === thisWeek && a.available)
  const staffWithAvail = new Set(weekAvail.map((a: any) => a.staff_id)).size

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <Stat label="Active Staff" value={activeStaff.length} icon={<Users size={16}/>} color="#3B82F6"/>
        <Stat label="Approved Shifts" value={approvedSchedules.length} icon={<Calendar size={16}/>} color="#22C55E"/>
        <Stat label="Pending" value={pendingDaysOff.length + pendingSwaps.length + pendingAttendance.length} icon={<CheckSquare size={16}/>} color={CORAL}/>
        <Stat label="Availability Set" value={staffWithAvail + '/' + activeStaff.length} icon={<Clock size={16}/>} color="#A855F7"/>
      </div>

      <div style={S.card}>
        <p style={{ ...S.label, marginBottom: '14px' }}>Staff Availability This Week</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activeStaff.filter((s: any) => s.role !== 'gm').map((s: any) => {
            const avail = availability.filter((a: any) => a.staff_id === s.id && a.week_starting === thisWeek && a.available)
            const status = avail.length === 0 ? { label: 'No availability', bg: '#ef444420', color: '#ef4444' } : avail.length < 5 ? { label: 'Partial', bg: '#f9731620', color: '#f97316' } : { label: 'Good', bg: '#22c55e20', color: '#22c55e' }
            return (
              <div key={s.id} style={S.row}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>{s.full_name?.charAt(0)}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: CREAM, fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.full_name}</p>
                    <p style={{ color: MUTED, fontSize: '11px' }}>{ROLE_LABELS[s.role]}</p>
                  </div>
                </div>
                <span style={{ backgroundColor: status.bg, color: status.color, fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', flexShrink: 0 }}>{status.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StaffTab({ staff, setStaff, profile, supabase }: any) {
  const [editId, setEditId] = useState<string|null>(null)
  const isGM = ['gm','admin','supervisor_floor','supervisor_bar'].includes(profile.role)

  const toggleActive = async (id: string, current: boolean) => {
    const { data } = await supabase.from('profiles').update({ active: !current, terminated_at: !current ? null : new Date().toISOString() }).eq('id', id).select().single()
    if (data) setStaff((prev: any[]) => prev.map((s: any) => s.id === id ? data : s))
  }

  const updateRole = async (id: string, role: string) => {
    const { data } = await supabase.from('profiles').update({ role }).eq('id', id).select().single()
    if (data) setStaff((prev: any[]) => prev.map((s: any) => s.id === id ? data : s))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {staff.map((s: any) => (
        <div key={s.id} style={{ ...S.card, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: s.active ? CORAL : '#636366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>{s.full_name?.charAt(0)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: CREAM, fontSize: '13px', fontWeight: 600 }}>{s.full_name}</p>
              <p style={{ color: MUTED, fontSize: '11px' }}>{s.email}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: MUTED, fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px' }}>
                {ROLE_LABELS[s.role]}
              </span>
              {!s.active && <span style={{ backgroundColor: '#ef444420', color: '#ef4444', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px' }}>Terminated</span>}
              {isGM && s.id !== profile.id && (
                <button onClick={() => setEditId(editId === s.id ? null : s.id)} style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: MUTED, fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '8px', border: \`1px solid \${BORDER}\`, cursor: 'pointer' }}>
                  {editId === s.id ? 'Cancel' : 'Edit'}
                </button>
              )}
              {isGM && s.id !== profile.id && (
                <button onClick={() => toggleActive(s.id, s.active)} style={{ backgroundColor: s.active ? '#ef444420' : '#22c55e20', color: s.active ? '#ef4444' : '#22c55e', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                  {s.active ? 'Terminate' : 'Reactivate'}
                </button>
              )}
            </div>
          </div>
          {isGM && s.id !== profile.id && editId === s.id && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: \`1px solid \${BORDER}\` }}>
              <select value={s.role} onChange={e => { updateRole(s.id, e.target.value); setEditId(null) }}
                style={{ backgroundColor: CARD2, color: CREAM, border: \`1px solid \${BORDER}\`, borderRadius: '8px', padding: '8px 12px', fontSize: '13px', width: '100%', cursor: 'pointer' }}>
                {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
        </div>
      ))}
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
  const isGM = ['gm','admin','supervisor_floor','supervisor_bar'].includes(profile.role)
  const activeStaff = staff.filter((s: any) => s.active && s.role !== 'gm')
  const STAFF_MAP = Object.fromEntries(activeStaff.map((s: any) => [s.id, s]))
  const weekAvailability = availability.filter((a: any) => a.week_starting === weekStart && a.available)

  const getStaffHours = (staffId: string, dateStr: string) => {
    const hours = weekAvailability.filter((a: any) => a.staff_id === staffId && a.slot_date === dateStr)
      .map((a: any) => { const m = a.slot_key.match(/_h(\\d+)$/); return m ? parseInt(m[1]) : -1 })
      .filter((h: number) => h >= 0).sort((a: number, b: number) => a - b)
    if (!hours.length) return null
    return { startH: hours[0], endH: hours[hours.length-1]+1, totalH: hours[hours.length-1]+1-hours[0], hours }
  }

  const generateSchedule = async () => {
    setGenerating(true)
    const monday = new Date(weekStart + 'T00:00:00')
    const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    const weekdayConfig = rushConfig?.find((r: any) => r.day_type === 'weekday')
    const rushStartH = parseInt((weekdayConfig?.rush_start || '15:00').split(':')[0])
    const rushEndH = parseInt((weekdayConfig?.rush_end || '21:00').split(':')[0])
    const supRoles = ['supervisor_floor','supervisor_bar','admin']
    const assignCount: Record<string,number> = {}
    activeStaff.forEach((s: any) => { assignCount[s.id] = 0 })
    const byLeast = (ids: string[]) => [...ids].sort((a: string, b: string) => (assignCount[a]||0) - (assignCount[b]||0))
    const built: any[] = []

    DAYS.forEach((day, i) => {
      const date = addDays(monday, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const isWeekend = i >= 5
      const staffSet = new Set<string>()
      weekAvailability.filter((a: any) => a.slot_date === dateStr).forEach((a: any) => staffSet.add(a.staff_id))
      const availStaff = Array.from(staffSet)
      const fmtH = (h: number) => { if (h === 0 || h === 24) return '12am'; if (h < 12) return h + 'am'; if (h === 12) return '12pm'; return (h-12) + 'pm' }

      if (!availStaff.length) {
        built.push({ key: day+'_day', date: dateStr, day, isWeekend, startH: 8, endH: 24, supervisor_id: null, bar_staff_id: null, floor_staff1_id: null, floor_staff2_id: null, issues: ['No availability'], staff: [], rushStartH, rushEndH, fmtH })
        return
      }

      const availSups = byLeast(availStaff.filter((id: string) => supRoles.includes(STAFF_MAP[id]?.role)))
      const availBars = byLeast(availStaff.filter((id: string) => ['bar','supervisor_bar'].includes(STAFF_MAP[id]?.role)))
      const availFloors = byLeast(availStaff.filter((id: string) => ['floor','supervisor_floor','admin'].includes(STAFF_MAP[id]?.role)))

      const supervisor_id = availSups[0] || null
      if (supervisor_id) assignCount[supervisor_id] = (assignCount[supervisor_id]||0) + 8
      const barPool = byLeast(availBars.filter((id: string) => id !== supervisor_id))
      const bar_staff_id = barPool[0] || byLeast(availFloors.filter((id: string) => id !== supervisor_id))[0] || null
      if (bar_staff_id) assignCount[bar_staff_id] = (assignCount[bar_staff_id]||0) + 8
      const floor1Pool = byLeast([...availFloors, ...availBars].filter((id: string) => id !== supervisor_id && id !== bar_staff_id))
      const floor_staff1_id = floor1Pool[0] || null
      if (floor_staff1_id) assignCount[floor_staff1_id] = (assignCount[floor_staff1_id]||0) + 8
      const floor2Pool = byLeast([...availFloors, ...availBars].filter((id: string) => id !== supervisor_id && id !== bar_staff_id && id !== floor_staff1_id))
      const floor_staff2_id = floor2Pool[0] || null
      if (floor_staff2_id) assignCount[floor_staff2_id] = (assignCount[floor_staff2_id]||0) + 8

      const issues: string[] = []
      if (!supervisor_id) issues.push('No supervisor available')
      if (!bar_staff_id) issues.push('No bar staff')
      if (!floor_staff1_id) issues.push('No floor staff')

      const assignedIds = new Set([supervisor_id, bar_staff_id, floor_staff1_id, floor_staff2_id].filter(Boolean))
      const benchStaff = availStaff.filter((id: string) => !assignedIds.has(id) && STAFF_MAP[id]).map((id: string) => ({ id, role: 'Available', info: getStaffHours(id, dateStr) }))
      const allInfos = [supervisor_id, bar_staff_id, floor_staff1_id, floor_staff2_id].filter(Boolean).map(id => getStaffHours(id!, dateStr)).filter(Boolean)
      const dayStart = allInfos.length ? Math.min(...allInfos.map((x: any) => x.startH)) : 8
      const dayEnd = allInfos.length ? Math.max(...allInfos.map((x: any) => x.endH)) : 24

      built.push({
        key: day+'_day', date: dateStr, day, isWeekend, startH: dayStart, endH: dayEnd,
        supervisor_id, bar_staff_id, floor_staff1_id, floor_staff2_id, issues, rushStartH, rushEndH, fmtH,
        staff: [
          supervisor_id && { id: supervisor_id, role: 'Supervisor', info: getStaffHours(supervisor_id, dateStr) },
          bar_staff_id && { id: bar_staff_id, role: 'Bar', info: getStaffHours(bar_staff_id, dateStr) },
          floor_staff1_id && { id: floor_staff1_id, role: 'Floor', info: getStaffHours(floor_staff1_id, dateStr) },
          floor_staff2_id && { id: floor_staff2_id, role: 'Floor', info: getStaffHours(floor_staff2_id, dateStr) },
          ...benchStaff,
        ].filter(Boolean),
      })
    })
    setGeneratedSlots(built)
    setGenerating(false)
  }

  const saveSchedule = async () => {
    setSaving(true)
    const schedId = 'SCH-' + Date.now()
    const rows = generatedSlots.map((slot: any) => ({
      schedule_id: schedId, week_starting: weekStart, slot_id: slot.key, slot_date: slot.date,
      slot_label: slot.day, slot_type: slot.isWeekend ? 'rush' : 'off-rush',
      start_time: slot.startH + ':00', end_time: slot.endH === 24 ? '00:00' : slot.endH + ':00',
      supervisor_id: slot.supervisor_id, bar_staff_id: slot.bar_staff_id,
      floor_staff1_id: slot.floor_staff1_id, floor_staff2_id: slot.floor_staff2_id,
      status: 'pending_approval',
    }))
    await supabase.from('schedules').delete().eq('week_starting', weekStart)
    const { data } = await supabase.from('schedules').insert(rows).select('*, supervisor:supervisor_id(id,full_name), bar_staff:bar_staff_id(id,full_name), floor_staff1:floor_staff1_id(id,full_name), floor_staff2:floor_staff2_id(id,full_name)')
    if (data) {
      if (isGM) {
        await supabase.from('schedules').update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: profile.id }).eq('week_starting', weekStart)
        setSchedules((prev: any[]) => [...prev.filter((s: any) => s.week_starting !== weekStart), ...data.map((s: any) => ({ ...s, status: 'approved' }))])
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Week nav */}
      <div style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 16px' }}>
        <button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()-7); setWeekStart(format(d,'yyyy-MM-dd')); setGeneratedSlots([]) }}
          style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.06)', border: \`1px solid \${BORDER}\`, color: CREAM, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ChevronLeft size={16}/>
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: CREAM, fontSize: '14px', fontWeight: 600 }}>Week of {format(new Date(weekStart+'T00:00:00'), 'MMM d')} – {format(addDays(new Date(weekStart+'T00:00:00'),6), 'MMM d, yyyy')}</p>
          <p style={{ color: MUTED, fontSize: '12px', marginTop: '2px' }}>{weekSchedules.length} slots · {weekAvailability.length} availability entries</p>
        </div>
        <button onClick={() => { const d = new Date(weekStart+'T00:00:00'); d.setDate(d.getDate()+7); setWeekStart(format(d,'yyyy-MM-dd')); setGeneratedSlots([]) }}
          style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.06)', border: \`1px solid \${BORDER}\`, color: CREAM, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ChevronRight size={16}/>
        </button>
      </div>

      {/* Pending approval */}
      {pendingWeek.length > 0 && isGM && (
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={S.title}>Pending Approval</p>
            <span style={{ backgroundColor: '#f9731620', color: '#f97316', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>{pendingWeek.length} slots</span>
          </div>
          {pendingWeek.slice(0,5).map((slot: any) => (
            <div key={slot.id} style={{ ...S.row, marginBottom: '6px' }}>
              <span style={{ color: CREAM, fontSize: '13px', fontWeight: 500 }}>{slot.slot_label}</span>
              <span style={{ color: MUTED, fontSize: '12px' }}>{[slot.supervisor, slot.bar_staff, slot.floor_staff1, slot.floor_staff2].filter(Boolean).map((s: any) => s.full_name?.split(' ')[0]).join(', ')}</span>
            </div>
          ))}
          <button onClick={() => approveSchedule(weekStart)} style={{ ...S.btn, width: '100%', justifyContent: 'center', marginTop: '12px' }}>
            <Check size={14}/> Approve All {pendingWeek.length} Slots
          </button>
        </div>
      )}

      {/* Approved schedule */}
      {approvedWeek.length > 0 && (
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p style={S.title}>Approved Schedule</p>
            <span style={{ backgroundColor: '#22c55e20', color: '#22c55e', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>{approvedWeek.length} slots</span>
          </div>
          {approvedWeek.map((slot: any) => (
            <div key={slot.id} style={{ ...S.row, marginBottom: '6px' }}>
              <span style={{ color: CREAM, fontSize: '13px', fontWeight: 500 }}>{slot.slot_label}</span>
              <span style={{ color: MUTED, fontSize: '12px' }}>{[slot.supervisor, slot.bar_staff, slot.floor_staff1, slot.floor_staff2].filter(Boolean).map((s: any) => s.full_name?.split(' ')[0]).join(' · ')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Schedule builder */}
      {generatedSlots.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '14px 18px' }}>
            <div>
              <p style={S.title}>Schedule Preview</p>
              <p style={{ ...S.body, marginTop: '2px' }}>Auto-assigned by least hours. Use controls to override.</p>
            </div>
            <button onClick={saveSchedule} disabled={saving} style={S.btn}>
              {saving ? 'Saving...' : 'Save & Submit'}
            </button>
          </div>

          {generatedSlots.map((slot: any) => {
            const fmtH = slot.fmtH
            return (
              <div key={slot.key} style={{ borderRadius: '16px', border: slot.issues?.length ? '1px solid rgba(239,68,68,0.3)' : \`1px solid \${BORDER}\`, overflow: 'hidden' }}>
                {/* Day header */}
                <div style={{ padding: '14px 18px', backgroundColor: slot.issues?.length ? '#3B0A0A' : '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div>
                      <p style={{ color: CREAM, fontSize: '17px', fontWeight: 800, lineHeight: 1 }}>{slot.day}</p>
                      <p style={{ color: MUTED, fontSize: '11px', marginTop: '2px' }}>{slot.date}</p>
                    </div>
                    {slot.isWeekend && <span style={{ backgroundColor: CORAL, color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>Full Rush</span>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ color: CREAM, fontSize: '14px', fontWeight: 800 }}>{fmtH(slot.startH)} – {fmtH(slot.endH)}</p>
                    <p style={{ color: MUTED, fontSize: '11px', marginTop: '2px' }}>
                      {slot.staff?.filter((m: any) => m.role !== 'Available').length || 0} assigned · {slot.issues?.length ? slot.issues.length + ' issue(s)' : 'all good'}
                    </p>
                  </div>
                </div>

                {/* Rush indicator */}
                {!slot.isWeekend && (
                  <div style={{ padding: '8px 18px', backgroundColor: '#1e1e1e', borderBottom: \`1px solid \${BORDER}\`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '6px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', height: '100%', backgroundColor: 'rgba(59,130,246,0.4)', left: '0%', width: ((slot.rushStartH-8)/16*100)+'%' }}/>
                      <div style={{ position: 'absolute', height: '100%', backgroundColor: 'rgba(249,115,22,0.6)', left: ((slot.rushStartH-8)/16*100)+'%', width: ((slot.rushEndH-slot.rushStartH)/16*100)+'%' }}/>
                    </div>
                    <p style={{ color: MUTED, fontSize: '11px', whiteSpace: 'nowrap', flexShrink: 0 }}>Rush {fmtH(slot.rushStartH)}–{fmtH(slot.rushEndH)}</p>
                  </div>
                )}

                {/* Staff */}
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#1e1e1e' }}>
                  {(slot.staff || []).map((member: any, idx: number) => {
                    const isFirstBench = member.role === 'Available' && idx > 0 && slot.staff[idx-1]?.role !== 'Available'
                    const s = STAFF_MAP[member.id]
                    if (!s) return null
                    const info = member.info
                    const roleColors: Record<string,string> = { Supervisor: '#3B82F6', Bar: '#A855F7', Floor: '#22C55E', Available: '#636366' }
                    const rc = roleColors[member.role] || '#636366'
                    const fieldName: string = member.role === 'Supervisor' ? 'supervisor_id' : member.role === 'Bar' ? 'bar_staff_id' : member.role === 'Available' ? '__bench__' : member.id === slot.floor_staff1_id ? 'floor_staff1_id' : 'floor_staff2_id'
                    const eligibleRoles = ['floor','bar','supervisor_floor','supervisor_bar','admin']
                    const slotAvailIds = (() => { const set = new Set<string>(); weekAvailability.filter((a: any) => a.slot_date === slot.date).forEach((a: any) => set.add(a.staff_id)); return Array.from(set) })()
                    const alts = member.role === 'Available' ? [] : slotAvailIds.filter((sid: string) => {
                      if (sid === member.id) return false
                      if (!eligibleRoles.includes(STAFF_MAP[sid]?.role)) return false
                      const isAssigned2 = (sid === slot.supervisor_id && fieldName !== 'supervisor_id') || (sid === slot.bar_staff_id && fieldName !== 'bar_staff_id') || (sid === slot.floor_staff1_id && fieldName !== 'floor_staff1_id') || (sid === slot.floor_staff2_id && fieldName !== 'floor_staff2_id')
                      return !isAssigned2
                    })

                    return (
                      <div key={member.id + idx}>
                        {isFirstBench && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: BORDER }}/>
                            <span style={{ color: MUTED, fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>Also available</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: BORDER }}/>
                          </div>
                        )}
                        <div style={{ backgroundColor: member.role === 'Available' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)', borderRadius: '12px', border: member.role === 'Available' ? \`1px dashed \${BORDER}\` : \`1px solid \${BORDER}\`, padding: '10px 12px', opacity: member.role === 'Available' ? 0.65 : 1 }}>
                          {/* Top row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: info ? '10px' : '0', flexWrap: 'wrap' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: rc, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>{s.full_name?.charAt(0)}</span>
                            </div>
                            <p style={{ color: CREAM, fontSize: '13px', fontWeight: 600, flex: 1, minWidth: 0 }}>{s.full_name?.split(' ')[0]}</p>

                            {/* Role badge/dropdown */}
                            {member.role !== 'Available' && member.role !== 'Supervisor' ? (
                              <select value={member.role} onChange={e => setGeneratedSlots(prev => prev.map(gs => gs.key !== slot.key ? gs : { ...gs, staff: gs.staff.map((m: any) => m.id === member.id ? { ...m, role: e.target.value } : m) }))}
                                style={{ backgroundColor: rc + '20', color: rc, border: 'none', borderRadius: '20px', padding: '3px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                                <option value="Bar">BAR</option>
                                <option value="Floor">FLOOR</option>
                              </select>
                            ) : (
                              <span style={{ backgroundColor: rc + '20', color: rc, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>{member.role.toUpperCase()}</span>
                            )}

                            {info && <span style={{ color: CORAL, fontSize: '12px', fontWeight: 700 }}>{info.totalH}h</span>}

                            {/* Assign (bench only) */}
                            {member.role === 'Available' && (
                              <select value="" onChange={e => {
                                if (!e.target.value) return
                                const ar = e.target.value
                                const fm: Record<string,string> = { Supervisor: 'supervisor_id', Bar: 'bar_staff_id', Floor1: 'floor_staff1_id', Floor2: 'floor_staff2_id' }
                                const fld = fm[ar]; if (!fld) return
                                setGeneratedSlots(prev => prev.map(gs => gs.key !== slot.key ? gs : { ...gs, [fld]: member.id, staff: gs.staff.map((m: any) => m.id === member.id ? { ...m, role: ar === 'Floor1' || ar === 'Floor2' ? 'Floor' : ar } : m) }))
                              }} style={{ backgroundColor: CORAL + '20', color: CORAL, border: \`1px solid \${CORAL}40\`, borderRadius: '8px', padding: '4px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                                <option value="">+ Assign</option>
                                {!slot.supervisor_id && ['supervisor_floor','supervisor_bar','admin'].includes(STAFF_MAP[member.id]?.role) && <option value="Supervisor">As Supervisor</option>}
                                {!slot.bar_staff_id && <option value="Bar">As Bar</option>}
                                {!slot.floor_staff1_id && <option value="Floor1">As Floor</option>}
                                {slot.floor_staff1_id && !slot.floor_staff2_id && <option value="Floor2">As 2nd Floor</option>}
                                {slot.supervisor_id && slot.bar_staff_id && slot.floor_staff1_id && slot.floor_staff2_id && <option value="Floor2">Cover Overlap</option>}
                              </select>
                            )}

                            {/* Unassign */}
                            {member.role !== 'Available' && (
                              <button onClick={() => setGeneratedSlots(prev => prev.map(gs => gs.key !== slot.key ? gs : { ...gs, [fieldName]: null, staff: gs.staff.map((m: any) => m.id === member.id ? { ...m, role: 'Available' } : m) }))}
                                style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>✕</button>
                            )}

                            {/* Swap */}
                            {member.role !== 'Available' && alts.length > 0 && (
                              <select value="" onChange={e => {
                                if (!e.target.value) return
                                const newId = e.target.value
                                setGeneratedSlots(prev => prev.map(gs => {
                                  if (gs.key !== slot.key) return gs
                                  const newHours = weekAvailability.filter((a: any) => a.staff_id === newId && a.slot_date === gs.date).map((a: any) => { const match = a.slot_key.match(/_h(\\d+)$/); return match ? parseInt(match[1]) : -1 }).filter((h: number) => h >= 0).sort((a: number, b: number) => a - b)
                                  const newInfo = newHours.length ? { startH: newHours[0], endH: newHours[newHours.length-1]+1, totalH: newHours[newHours.length-1]+1-newHours[0], hours: newHours } : null
                                  const oldMember = { id: member.id, role: 'Available', info: member.info }
                                  const newStaff = gs.staff.map((m: any) => { if (m.id === member.id) return { ...m, id: newId, info: newInfo }; if (m.id === newId) return null; return m }).filter(Boolean)
                                  if (!newStaff.some((m: any) => m.id === oldMember.id)) newStaff.push(oldMember)
                                  return { ...(fieldName === '__bench__' ? gs : { ...gs, [fieldName]: newId }), staff: newStaff }
                                }))
                              }} style={{ backgroundColor: rc + '15', color: rc, border: \`1px solid \${rc}30\`, borderRadius: '8px', padding: '4px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                                <option value="">Swap</option>
                                {alts.map((sid: string) => <option key={sid} value={sid}>{STAFF_MAP[sid]?.full_name?.split(' ')[0]}</option>)}
                              </select>
                            )}
                          </div>

                          {/* Timeline */}
                          {info && (
                            <div>
                              <div style={{ position: 'relative', height: '18px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', height: '100%', backgroundColor: 'rgba(249,115,22,0.3)', left: ((slot.rushStartH-8)/16*100)+'%', width: ((slot.rushEndH-slot.rushStartH)/16*100)+'%' }}/>
                                <div style={{ position: 'absolute', height: '100%', borderRadius: '20px', backgroundColor: rc, opacity: 0.85, left: Math.max(0,(info.startH-8)/16*100)+'%', width: Math.min(100-Math.max(0,(info.startH-8)/16*100),(info.totalH/16*100))+'%' }}/>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: Math.max(0,(info.startH-8)/16*100)+'%' }}>
                                  <div style={{ width: Math.min(100-Math.max(0,(info.startH-8)/16*100),(info.totalH/16*100))+'%', display: 'flex', justifyContent: 'space-between', padding: '0 6px' }}>
                                    <span style={{ color: 'white', fontSize: '9px', fontWeight: 700 }}>{fmtH(info.startH)}</span>
                                    <span style={{ color: 'white', fontSize: '9px', fontWeight: 700 }}>{fmtH(info.endH)}</span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ position: 'relative', height: '12px', marginTop: '3px' }}>
                                {[8,10,12,14,16,18,20,22,24].map(h => (
                                  <span key={h} style={{ position: 'absolute', left: ((h-8)/16*100)+'%', transform: 'translateX(-50%)', color: MUTED, fontSize: '8px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                    {h===24?'12a':h===12?'12p':h>12?(h-12)+'p':h+'a'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Issues */}
                {slot.issues?.length > 0 && (
                  <div style={{ margin: '0 12px 12px', padding: '10px 14px', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <AlertCircle size={13} style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }}/>
                    <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>{slot.issues.join(' · ')}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <button onClick={generateSchedule} disabled={generating} style={{ ...S.btnGhost, width: '100%', justifyContent: 'center', padding: '16px', fontSize: '14px', borderRadius: '14px' }}>
          <Zap size={16} style={{ color: CORAL }}/>{generating ? 'Generating...' : 'Auto-Generate Schedule from Availability'}
        </button>
      )}
    </div>
  )
}

function ApprovalsTab({ pendingDaysOff, setPendingDaysOff, pendingSwaps, setPendingSwaps, pendingAttendance, setPendingAttendance, profile, supabase }: any) {
  const [loading, setLoading] = useState<string|null>(null)
  const isGM = ['gm','admin','supervisor_floor','supervisor_bar'].includes(profile.role)

  const approveDayOff = async (id: string, action: 'approve'|'deny') => {
    setLoading(id+action)
    const isSupervisor = ['supervisor_floor','supervisor_bar'].includes(profile.role)
    const newStatus = action === 'approve' ? (isSupervisor ? 'pending_gm' : 'approved') : 'denied'
    const update: any = { status: newStatus }
    if (action === 'approve') { if (isSupervisor) update.supervisor_approved_at = new Date().toISOString(); else update.gm_approved_at = new Date().toISOString() }
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

  const Section = ({ title, count, items, renderItem }: any) => (
    <div style={S.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <p style={S.title}>{title}</p>
        <span style={{ backgroundColor: '#f9731620', color: '#f97316', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>{count}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{items.map(renderItem)}</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {total === 0 && (
        <div style={{ ...S.card, textAlign: 'center', padding: '40px' }}>
          <Check size={32} style={{ color: '#22c55e', margin: '0 auto 12px' }}/>
          <p style={{ color: CREAM, fontSize: '15px', fontWeight: 600 }}>All caught up!</p>
          <p style={{ color: MUTED, fontSize: '13px', marginTop: '4px' }}>No pending approvals</p>
        </div>
      )}
      {pendingAttendance.length > 0 && (
        <Section title="Punch-In Approvals" count={pendingAttendance.length} items={pendingAttendance} renderItem={(rec: any) => (
          <div key={rec.id} style={S.row}>
            <div>
              <p style={{ color: CREAM, fontSize: '13px', fontWeight: 600 }}>{rec.staff?.full_name}</p>
              <p style={{ color: MUTED, fontSize: '11px' }}>{rec.checkin_time} · {rec.shift_type}</p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => approveAttendance(rec.id,'approve')} style={S.btnSuccess}><Check size={12}/></button>
              <button onClick={() => approveAttendance(rec.id,'reject')} style={S.btnDanger}><X size={12}/></button>
            </div>
          </div>
        )}/>
      )}
      {pendingSwaps.length > 0 && (
        <Section title="Swap Requests" count={pendingSwaps.length} items={pendingSwaps} renderItem={(swap: any) => (
          <div key={swap.id} style={S.row}>
            <div>
              <p style={{ color: CREAM, fontSize: '13px', fontWeight: 600 }}>{swap.staff_a?.full_name} + {swap.staff_b?.full_name}</p>
              <p style={{ color: MUTED, fontSize: '11px' }}>{swap.shift_date} · {swap.shift_label}</p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => approveSwap(swap.id,'approve')} style={S.btnSuccess}><Check size={12}/></button>
              <button onClick={() => approveSwap(swap.id,'deny')} style={S.btnDanger}><X size={12}/></button>
            </div>
          </div>
        )}/>
      )}
      {pendingDaysOff.length > 0 && (
        <Section title="Day Off Requests" count={pendingDaysOff.length} items={pendingDaysOff} renderItem={(req: any) => (
          <div key={req.id} style={S.row}>
            <div>
              <p style={{ color: CREAM, fontSize: '13px', fontWeight: 600 }}>{req.staff?.full_name}</p>
              <p style={{ color: MUTED, fontSize: '11px' }}>{format(new Date(req.date_off+'T00:00:00'), 'EEE MMM d')}{req.reason ? ' · '+req.reason : ''}</p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => approveDayOff(req.id,'approve')} style={S.btnSuccess}><Check size={12}/></button>
              <button onClick={() => approveDayOff(req.id,'deny')} style={S.btnDanger}><X size={12}/></button>
            </div>
          </div>
        )}/>
      )}
    </div>
  )
}

function SettingsTab({ rushConfig, setRushConfig, profile, supabase }: any) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const isGM = ['gm','admin','supervisor_floor','supervisor_bar'].includes(profile.role)
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
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const TField = ({ label, value, onChange, disabled }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <input type="time" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        style={{ backgroundColor: CARD2, color: CREAM, border: \`1px solid \${BORDER}\`, borderRadius: '10px', padding: '10px 12px', fontSize: '14px', width: '100%', cursor: disabled ? 'not-allowed' : 'text', opacity: disabled ? 0.5 : 1 }}/>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={S.card}>
        <p style={{ ...S.title, marginBottom: '18px' }}>Rush Hour Configuration</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ ...S.label, marginBottom: '10px' }}>Weekdays (Mon–Fri)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <TField label="Rush starts" value={wdStart} onChange={setWdStart} disabled={!isGM}/>
              <TField label="Rush ends" value={wdEnd} onChange={setWdEnd} disabled={!isGM}/>
            </div>
          </div>
          <div>
            <p style={{ ...S.label, marginBottom: '10px' }}>Weekends (Sat–Sun)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <TField label="Rush starts" value={weStart} onChange={setWeStart} disabled={!isGM}/>
              <TField label="Rush ends" value={weEnd} onChange={setWeEnd} disabled={!isGM}/>
            </div>
          </div>
          {isGM ? (
            <button onClick={save} disabled={saving} style={{ ...S.btn, width: '100%', justifyContent: 'center' }}>
              {saved ? <><Check size={14}/> Saved!</> : saving ? 'Saving...' : 'Save Settings'}
            </button>
          ) : (
            <p style={{ color: MUTED, fontSize: '13px', textAlign: 'center' }}>Only GMs can change rush hour settings</p>
          )}
        </div>
      </div>

      <div style={S.card}>
        <p style={{ ...S.title, marginBottom: '14px' }}>System Info</p>
        {[
          ['Off-Rush Staffing', '1 supervisor + 1 bar + 1 floor'],
          ['Rush Staffing', '1 supervisor + 1 bar + 2 floor'],
          ['Swap Cutoff', '2 hours before shift'],
          ['Schedule Approval', 'GM required'],
        ].map(([label, value]) => (
          <div key={label} style={{ ...S.row, marginBottom: '6px' }}>
            <span style={{ color: MUTED, fontSize: '13px' }}>{label}</span>
            <span style={{ color: CREAM, fontSize: '13px', fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
`;

fs.writeFileSync("src/components/schedule/admin-panel.tsx", content, "utf8");
console.log("admin-panel.tsx completely rewritten - dark premium design");
