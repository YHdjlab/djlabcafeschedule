import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS, ROLE_COLORS, getCurrentWeekMonday } from '@/lib/utils'
import { Calendar, Clock, Users, CheckSquare, ArrowLeftRight, CalendarOff } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const weekStart = getCurrentWeekMonday()
  const isAdmin = ['gm', 'supervisor_floor', 'supervisor_bar'].includes(profile.role)

  const [
    { count: staffCount },
    { data: pendingSwaps },
    { data: pendingDaysOff },
    { data: myAttendance },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('swap_requests').select('*').eq('status', 'pending_supervisor'),
    supabase.from('day_off_requests').select('*').in('status', ['pending_supervisor', 'pending_gm']),
    supabase.from('attendance').select('*').eq('staff_id', user.id).eq('date', new Date().toISOString().slice(0,10)).single(),
  ])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = profile.full_name?.split(' ')[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#323232]">{greeting}, {firstName} ??</h1>
        <p className="text-gray-500 mt-1 text-sm">Here's what's happening at DjLab today.</p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="default" className={ROLE_COLORS[profile.role]}>
          {ROLE_LABELS[profile.role]}
        </Badge>
        <Badge variant={profile.active ? 'green' : 'red'}>
          {profile.active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin && (
          <Card padding="md" className="col-span-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Active Staff</p>
                <p className="text-3xl font-bold text-[#323232] mt-1">{staffCount || 0}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-xl">
                <Users size={18} className="text-blue-500"/>
              </div>
            </div>
          </Card>
        )}

        <Card padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">This Week</p>
              <p className="text-3xl font-bold text-[#323232] mt-1">{weekStart}</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-xl">
              <Calendar size={18} className="text-[#FF6357]"/>
            </div>
          </div>
        </Card>

        {isAdmin && (
          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pending Swaps</p>
                <p className="text-3xl font-bold text-[#323232] mt-1">{pendingSwaps?.length || 0}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-xl">
                <ArrowLeftRight size={18} className="text-purple-500"/>
              </div>
            </div>
          </Card>
        )}

        <Card padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Today</p>
              <p className="text-sm font-bold text-[#323232] mt-1">
                {myAttendance ? (myAttendance.status === 'checked_in' ? 'Checked In' : myAttendance.status === 'checked_out' ? 'Checked Out' : 'Pending') : 'Not Checked In'}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-xl">
              <CheckSquare size={18} className="text-green-500"/>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/schedule', icon: <Calendar size={20}/>, label: 'View Schedule', color: 'bg-orange-50 text-[#FF6357]' },
              { href: '/availability', icon: <Clock size={20}/>, label: 'Set Availability', color: 'bg-blue-50 text-blue-500' },
              { href: '/swaps', icon: <ArrowLeftRight size={20}/>, label: 'Shift Swaps', color: 'bg-purple-50 text-purple-500' },
              { href: '/days-off', icon: <CalendarOff size={20}/>, label: 'Request Day Off', color: 'bg-green-50 text-green-500' },
              { href: '/attendance', icon: <CheckSquare size={20}/>, label: 'Check In/Out', color: 'bg-yellow-50 text-yellow-600' },
              ...(isAdmin ? [{ href: '/admin', icon: <Users size={20}/>, label: 'Admin Panel', color: 'bg-gray-100 text-gray-600' }] : []),
            ].map(action => (
              <Link key={action.href} href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#F7F0E8] hover:bg-black/5 transition-all text-center group">
                <div className={"p-2.5 rounded-xl " + action.color}>{action.icon}</div>
                <span className="text-xs font-medium text-[#323232]">{action.label}</span>
              </Link>
            ))}
          </div>
        </Card>

        {isAdmin && pendingSwaps && pendingSwaps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <Link href="/swaps" className="text-xs text-[#FF6357] hover:underline">View all</Link>
            </CardHeader>
            <div className="space-y-3">
              {pendingSwaps.slice(0,5).map((swap: any) => (
                <div key={swap.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F7F0E8]">
                  <div>
                    <p className="text-sm font-medium text-[#323232]">Swap Request</p>
                    <p className="text-xs text-gray-500">{swap.shift_date} - {swap.shift_label}</p>
                  </div>
                  <Badge variant="yellow">Pending</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
