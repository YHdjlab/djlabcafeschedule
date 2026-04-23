import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { ScheduleView } from '@/components/schedule/schedule-view'

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')
  const isAdmin = ['gm', 'supervisor_floor', 'supervisor_bar'].includes(profile.role)
  const query = supabase
    .from('schedules')
    .select('*, supervisor:supervisor_id(id,full_name,role), bar_staff:bar_staff_id(id,full_name,role), floor_staff1:floor_staff1_id(id,full_name,role), floor_staff2:floor_staff2_id(id,full_name,role)')
    .order('slot_date', { ascending: true })
  const { data: allSchedules } = isAdmin ? await query : await query.eq('status', 'approved')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#323232]">Schedule</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage shift schedules</p>
      </div>
      <ScheduleView schedules={allSchedules || []} profile={profile} isAdmin={isAdmin}/>
    </div>
  )
}
