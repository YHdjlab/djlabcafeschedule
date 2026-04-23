import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { AdminPanel } from '@/components/schedule/admin-panel'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const isAdmin = ['gm', 'supervisor_floor', 'supervisor_bar'].includes(profile.role)
  if (!isAdmin) redirect('/dashboard')

  const [
    { data: allStaff },
    { data: rushConfig },
    { data: pendingDaysOff },
    { data: pendingSwaps },
    { data: pendingAttendance },
    { data: schedules },
    { data: availability },
  ] = await Promise.all([
    supabase.from('profiles').select('*').order('role').order('full_name'),
    supabase.from('rush_hour_config').select('*'),
    supabase.from('day_off_requests').select('*, staff:staff_id(id,full_name,role)').in('status', ['pending_supervisor','pending_gm']).order('created_at'),
    supabase.from('swap_requests').select('*, staff_a:staff_a_id(id,full_name), staff_b:staff_b_id(id,full_name)').eq('status','pending_supervisor').order('created_at'),
    supabase.from('attendance').select('*, staff:staff_id(id,full_name,role)').eq('status','pending_approval').order('created_at'),
    supabase.from('schedules').select('*, supervisor:supervisor_id(id,full_name), bar_staff:bar_staff_id(id,full_name), floor_staff1:floor_staff1_id(id,full_name), floor_staff2:floor_staff2_id(id,full_name)').order('slot_date').order('start_time'),
    supabase.from('availability').select('*, staff:staff_id(id,full_name,role)').order('week_starting').order('slot_date'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#323232]">Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-1">Manage staff, schedules, and system settings</p>
      </div>
      <AdminPanel
        profile={profile}
        allStaff={allStaff || []}
        rushConfig={rushConfig || []}
        pendingDaysOff={pendingDaysOff || []}
        pendingSwaps={pendingSwaps || []}
        pendingAttendance={pendingAttendance || []}
        schedules={schedules || []}
        availability={availability || []}
      />
    </div>
  )
}
