import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { ScheduleView } from '@/components/schedule/schedule-view'

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')
  const isAdmin = ['gm', 'admin', 'supervisor_floor', 'supervisor_bar'].includes(profile.role)

  const baseQuery = supabase
    .from('schedules')
    .select('*, supervisor:supervisor_id(id,full_name,role), bar_staff:bar_staff_id(id,full_name,role), floor_staff1:floor_staff1_id(id,full_name,role), floor_staff2:floor_staff2_id(id,full_name,role)')
    .eq('status', 'approved')
    .order('slot_date', { ascending: true })

  // Staff only see shifts they are assigned to
  const schedulesQuery = isAdmin
    ? baseQuery
    : baseQuery.or(`supervisor_id.eq.${user.id},bar_staff_id.eq.${user.id},floor_staff1_id.eq.${user.id},floor_staff2_id.eq.${user.id}`)

  const [{ data: allSchedules }, { data: availability }] = await Promise.all([
    schedulesQuery,
    supabase.from('availability').select('staff_id, slot_key, slot_date, available').eq('available', true)
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#323232] tracking-tight">Schedule</h1>
        <p className="text-gray-500 text-sm mt-1">{isAdmin ? 'Full team schedule' : 'Your upcoming shifts'}</p>
      </div>
      <ScheduleView schedules={allSchedules || []} profile={profile} isAdmin={isAdmin} availability={availability || []}/>
    </div>
  )
}
