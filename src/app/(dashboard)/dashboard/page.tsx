import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { ROLE_LABELS, ROLE_COLORS, getCurrentWeekMonday } from '@/lib/utils'
import { Calendar, Clock, Users, CheckSquare, ArrowLeftRight, CalendarOff, Settings, ChevronRight, Bell } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')
  const weekStart = getCurrentWeekMonday()
  const isAdmin = ['gm', 'admin', 'supervisor_floor', 'supervisor_bar'].includes(profile.role)
  const today = new Date().toISOString().slice(0, 10)
  const [
    { count: staffCount },
    { data: pendingSwaps },
    { data: pendingDaysOff },
    { data: pendingAttendance },
    { data: myAttendance },
    { data: myAvailability },
    { data: todaySchedule },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('swap_requests').select('*, staff_a:staff_a_id(full_name), staff_b:staff_b_id(full_name)').eq('status', 'pending_supervisor').order('created_at', { ascending: false }).limit(3),
    supabase.from('day_off_requests').select('*, staff:staff_id(full_name)').in('status', ['pending_supervisor', 'pending_gm']).order('created_at', { ascending: false }).limit(3),
    supabase.from('attendance').select('*, staff:staff_id(full_name)').eq('status', 'pending_approval').order('created_at', { ascending: false }).limit(3),
    supabase.from('attendance').select('*').eq('staff_id', user.id).eq('date', today).maybeSingle(),
    supabase.from('availability').select('*').eq('staff_id', user.id).eq('week_starting', weekStart),
    supabase.from('schedules').select('*, supervisor:supervisor_id(full_name), bar_staff:bar_staff_id(full_name), floor_staff1:floor_staff1_id(full_name), floor_staff2:floor_staff2_id(full_name)').eq('slot_date', today).eq('status', 'approved'),
  ])
  const hour = new Date().getHours()
  const greeting = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile.full_name?.split(' ')[0] || 'there'
  const totalPending = (pendingSwaps?.length || 0) + (pendingDaysOff?.length || 0) + (pendingAttendance?.length || 0)
  const availabilitySet = myAvailability?.length || 0
  const dayOfWeek = format(new Date(), 'EEEE')
  const dateStr = format(new Date(), 'MMMM d, yyyy')
  const isMyShiftToday = todaySchedule?.some((slot: any) => slot.supervisor_id === user.id || slot.bar_staff_id === user.id || slot.floor_staff1_id === user.id || slot.floor_staff2_id === user.id)
  const attendanceStatus = myAttendance ? (myAttendance.status === 'checked_in' ? 'checked_in' : myAttendance.status === 'checked_out' ? 'checked_out' : 'pending') : 'none'
  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-[#323232] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#FF6357] opacity-10 blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"/>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#FF6357] opacity-10 blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none"/>
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-white/50 text-sm font-medium mb-1">{dayOfWeek}, {dateStr}</p>
            <h1 className="text-3xl font-bold text-white">{greeting}, {firstName}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/80">{ROLE_LABELS[profile.role]}</span>
              {isMyShiftToday && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6357] text-white">Working today</span>}
            </div>
          </div>
          {isAdmin && totalPending > 0 && (
            <Link href="/admin" className="flex-shrink-0 flex items-center gap-2 bg-[#FF6357] hover:bg-[#e5554a] text-white px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all">
              <Bell size={14}/>{totalPending} pending
            </Link>
          )}
        </div>
        <div className="relative z-10 flex flex-wrap items-center gap-2 mt-5">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium ${attendanceStatus === 'checked_in' ? 'bg-green-500 text-white' : attendanceStatus === 'checked_out' ? 'bg-blue-500 text-white' : attendanceStatus === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white/10 text-white/60'}`}>
            <div className={`w-1.5 h-1.5 rounded-full bg-current ${attendanceStatus === 'checked_in' || attendanceStatus === 'pending' ? 'animate-pulse' : ''}`}/>
            {attendanceStatus === 'checked_in' ? 'Checked in' + (myAttendance?.checkin_time ? ' at ' + myAttendance.checkin_time : '') : attendanceStatus === 'checked_out' ? 'Checked out' + (myAttendance?.checkout_time ? ' at ' + myAttendance.checkout_time : '') : attendanceStatus === 'pending' ? 'Awaiting approval' : 'Not checked in'}
          </div>
          {availabilitySet > 0 && <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/10 text-white/60"><Clock size={11}/>{availabilitySet} slots set</div>}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">Quick Actions</p>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { href: '/schedule', icon: <Calendar size={20}/>, label: 'Schedule', bg: 'bg-orange-50', color: 'text-[#FF6357]' },
            { href: '/availability', icon: <Clock size={20}/>, label: 'Availability', bg: 'bg-blue-50', color: 'text-blue-500' },
            { href: '/swaps', icon: <ArrowLeftRight size={20}/>, label: 'Swaps', bg: 'bg-purple-50', color: 'text-purple-500' },
            { href: '/days-off', icon: <CalendarOff size={20}/>, label: 'Days Off', bg: 'bg-green-50', color: 'text-green-500' },
            { href: '/attendance', icon: <CheckSquare size={20}/>, label: 'Attendance', bg: 'bg-yellow-50', color: 'text-yellow-600' },
            ...(isAdmin ? [{ href: '/admin', icon: <Settings size={20}/>, label: 'Admin', bg: 'bg-gray-100', color: 'text-gray-600' }] : []),
          ].map(action => (
            <Link key={action.href} href={action.href} className="group flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-black/5">
              <div className={`p-3 rounded-xl ${action.bg} ${action.color} transition-transform duration-200 group-hover:scale-110`}>{action.icon}</div>
              <span className="text-xs font-semibold text-[#323232]">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Active Staff', value: staffCount || 0, icon: <Users size={15}/>, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Swap Requests', value: pendingSwaps?.length || 0, icon: <ArrowLeftRight size={15}/>, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Days Off', value: pendingDaysOff?.length || 0, icon: <CalendarOff size={15}/>, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Punch-In Queue', value: pendingAttendance?.length || 0, icon: <CheckSquare size={15}/>, color: 'text-[#FF6357]', bg: 'bg-orange-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 border border-black/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-400">{stat.label}</span>
                <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>{stat.icon}</div>
              </div>
              <p className="text-3xl font-bold text-[#323232]">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {todaySchedule && todaySchedule.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
            <h2 className="font-semibold text-[#323232]">Today on the floor</h2>
            <Link href="/schedule" className="flex items-center gap-1 text-xs text-[#FF6357] font-medium hover:underline">Full schedule<ChevronRight size={12}/></Link>
          </div>
          <div className="divide-y divide-black/5">
            {todaySchedule.map((slot: any) => {
              const mine = slot.supervisor_id === user.id || slot.bar_staff_id === user.id || slot.floor_staff1_id === user.id || slot.floor_staff2_id === user.id
              const names = [slot.supervisor, slot.bar_staff, slot.floor_staff1, slot.floor_staff2].filter(Boolean).map((s: any) => s.full_name?.split(' ')[0]).join(' · ')
              return (
                <div key={slot.id} className={`px-5 py-4 flex items-center justify-between ${mine ? 'bg-orange-50/40' : ''}`}>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#323232]">{slot.slot_label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${slot.slot_type === 'rush' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{slot.slot_type}</span>
                      {mine && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#FF6357] text-white">You</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{names}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 flex-shrink-0"/>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isAdmin && totalPending > 0 && (
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
            <h2 className="font-semibold text-[#323232]">Needs your attention</h2>
            <Link href="/admin" className="flex items-center gap-1 text-xs text-[#FF6357] font-medium hover:underline">Manage all<ChevronRight size={12}/></Link>
          </div>
          <div className="divide-y divide-black/5">
            {(pendingAttendance || []).map((rec: any) => (
              <div key={rec.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0"><CheckSquare size={15} className="text-yellow-600"/></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#323232] truncate">{rec.staff?.full_name} checked in</p>
                  <p className="text-xs text-gray-400">at {rec.checkin_time} · {rec.shift_type}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold flex-shrink-0">Approve</span>
              </div>
            ))}
            {(pendingSwaps || []).map((swap: any) => (
              <div key={swap.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0"><ArrowLeftRight size={15} className="text-purple-600"/></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#323232] truncate">{swap.staff_a?.full_name} + {swap.staff_b?.full_name}</p>
                  <p className="text-xs text-gray-400">Swap request · {swap.shift_date}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold flex-shrink-0">Review</span>
              </div>
            ))}
            {(pendingDaysOff || []).map((req: any) => (
              <div key={req.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0"><CalendarOff size={15} className="text-green-600"/></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#323232] truncate">{req.staff?.full_name}</p>
                  <p className="text-xs text-gray-400">Day off · {req.date_off}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold flex-shrink-0">Review</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isAdmin && (!todaySchedule || todaySchedule.length === 0) && (
        <div className="bg-white rounded-2xl border border-black/5 p-10 text-center">
          <div className="w-14 h-14 bg-[#F7F0E8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar size={24} className="text-[#FF6357]"/>
          </div>
          <p className="font-semibold text-[#323232]">No shifts today</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Check your schedule for upcoming shifts</p>
          <Link href="/schedule" className="inline-flex items-center gap-1 text-sm text-[#FF6357] font-semibold hover:underline">View schedule<ChevronRight size={14}/></Link>
        </div>
      )}
    </div>
  )
}
